import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, STATE_PLAYING, STATE_LOST, STATE_CLEAR } from '../js/game.js';
import { TILE, ENEMY_SCORE, PLAYER_LIVES, PLAYER_SPAWN } from '../js/config.js';
import { rectsOverlap } from '../js/collision.js';
import { emptyGrid, setCell } from './helpers.js';

function quietGame(extra = {}) {
  return new Game({ spawn: false, enemyTotal: 5, rng: () => 0.5, ...extra });
}

test('new game starts playing with a player, score, lives and level', () => {
  const game = quietGame();
  assert.equal(game.state, STATE_PLAYING);
  assert.equal(game.score, 0);
  assert.equal(game.lives, PLAYER_LIVES);
  assert.equal(game.levelNumber, 1);
  assert.ok(game.player);
  assert.equal(game.player.x, PLAYER_SPAWN.col * TILE + (TILE - game.player.rect.w) / 2);
});

test('player fires a bullet and respects cooldown', () => {
  const game = quietGame();
  game.player.dir = 'up';
  const first = game.fireTank(game.player);
  assert.ok(first);
  assert.equal(first.owner, 'player');
  assert.equal(game.bullets.length, 1);
  assert.equal(game.fireTank(game.player), null);
});

test('player bullet destroys a brick tile', () => {
  const grid = setCell(emptyGrid(), 3, 3, 'B');
  const game = quietGame({ grid });
  game.player.x = 3 * TILE + (TILE - game.player.rect.w) / 2;
  game.player.y = 6 * TILE;
  game.player.dir = 'up';
  game.fireTank(game.player);
  game.bullets[0].x = 3 * TILE + TILE / 2;
  game.bullets[0].y = 4 * TILE + TILE / 2;
  game.update(0.2, {});
  assert.equal(game.map.tileAt(3, 3), 0);
});

test('player bullet destroys an enemy and awards score', () => {
  const game = quietGame({ grid: emptyGrid() });
  game.enemies.push(game.createEnemy(0, 5));
  const enemy = game.enemies[0];
  enemy.x = 5 * TILE;
  enemy.y = 2 * TILE;
  game.player.x = enemy.x;
  game.player.y = 6 * TILE;
  game.player.dir = 'up';
  game.fireTank(game.player);
  game.bullets[0].x = enemy.x + enemy.rect.w / 2;
  game.bullets[0].y = enemy.y + enemy.rect.h / 2;
  game.update(0.05, {});
  assert.equal(game.enemies.length, 0);
  assert.equal(game.score, ENEMY_SCORE);
});

test('enemy bullet kills the player and spends a life', () => {
  const game = quietGame();
  game.enemies.push(game.createEnemy(0, 5));
  const bullet = game.fireTank(game.enemies[0]);
  assert.ok(bullet);
  bullet.x = game.player.x + game.player.rect.w / 2;
  bullet.y = game.player.y + game.player.rect.h / 2;
  game.update(0.01, {});
  assert.equal(game.lives, PLAYER_LIVES - 1);
  assert.equal(game.state, STATE_PLAYING);
});

test('losing all lives ends the game', () => {
  const game = quietGame({ lives: 1 });
  game.enemies.push(game.createEnemy(0, 5));
  const bullet = game.fireTank(game.enemies[0]);
  bullet.x = game.player.x + game.player.rect.w / 2;
  bullet.y = game.player.y + game.player.rect.h / 2;
  game.update(0.01, {});
  assert.equal(game.lives, 0);
  assert.equal(game.state, STATE_LOST);
});

test('destroying the base ends the game', () => {
  const grid = setCell(emptyGrid(), 6, 12, 'E');
  const game = quietGame({ grid });
  game.enemies.push(game.createEnemy(0, 5));
  const bullet = game.fireTank(game.enemies[0]);
  bullet.x = 6 * TILE + TILE / 2;
  bullet.y = 12 * TILE + TILE / 2;
  game.update(0.01, {});
  assert.equal(game.map.baseAlive, false);
  assert.equal(game.state, STATE_LOST);
});

test('clearing all enemies marks level clear; next level keeps score and lives', () => {
  const game = quietGame();
  game.score = 300;
  game.lives = 2;
  game.spawnQueue = 0;
  game.enemies.length = 0;
  game.update(0.016, {});
  assert.equal(game.state, STATE_CLEAR);
  game.nextLevel();
  assert.equal(game.state, STATE_PLAYING);
  assert.equal(game.levelNumber, 2);
  assert.equal(game.score, 300);
  assert.equal(game.lives, 2);
});

test('restart resets score, lives and level', () => {
  const game = quietGame();
  game.score = 900;
  game.lives = 1;
  game.levelIndex = 2;
  game.state = STATE_LOST;
  game.restart();
  assert.equal(game.score, 0);
  assert.equal(game.lives, PLAYER_LIVES);
  assert.equal(game.levelNumber, 1);
  assert.equal(game.state, STATE_PLAYING);
});

test('player movement input moves the tank in the requested direction', () => {
  const game = quietGame();
  const startX = game.player.x;
  game.update(0.5, { left: true });
  assert.equal(game.player.dir, 'left');
  assert.ok(game.player.x < startX);
});

test('player cannot drive through an enemy tank', () => {
  const game = quietGame({ grid: emptyGrid() });
  const enemy = game.createEnemy(0, 0);
  enemy.x = game.player.x + 2 * TILE;
  enemy.y = game.player.y;
  game.enemies.push(enemy);
  game.update(0.5, { right: true });
  assert.equal(rectsOverlap(game.player.rect, enemy.rect), false);
});

test('enemy does not fire when its facing direction is off the aim axis', () => {
  const grid = setCell(emptyGrid(), 7, 6, 'S');
  const game = quietGame({ grid });
  game.player.x = 4 * TILE + (TILE - game.player.rect.w) / 2;
  game.player.y = 6 * TILE + (TILE - game.player.rect.h) / 2;
  const enemy = game.createEnemy(8, 6);
  game.enemies.push(enemy);
  game.update(0.016, {});
  assert.equal(enemy.dir, 'down');
  assert.equal(game.bullets.length, 0);
});

test('player respawn avoids an enemy parked on the spawn point', () => {
  const game = quietGame({ grid: emptyGrid() });
  const enemy = game.createEnemy(PLAYER_SPAWN.col, PLAYER_SPAWN.row);
  game.enemies.push(enemy);
  game.killPlayer();
  assert.equal(game.lives, PLAYER_LIVES - 1);
  assert.ok(game.player);
  assert.equal(rectsOverlap(game.player.rect, enemy.rect), false);
});

test('player respawn is delayed while every spawn candidate is blocked', () => {
  let grid = emptyGrid();
  for (const [col, row] of [
    [PLAYER_SPAWN.col - 1, PLAYER_SPAWN.row],
    [PLAYER_SPAWN.col + 1, PLAYER_SPAWN.row],
    [PLAYER_SPAWN.col, PLAYER_SPAWN.row - 1],
  ]) {
    grid = setCell(grid, col, row, 'S');
  }
  const game = quietGame({ grid });
  const enemy = game.createEnemy(PLAYER_SPAWN.col, PLAYER_SPAWN.row);
  game.enemies.push(enemy);
  game.killPlayer();
  assert.equal(game.player, null);
  assert.ok(game.respawnTimer > 0);
  assert.equal(game.state, STATE_PLAYING);

  game.enemies = [];
  game.update(1, {});
  assert.ok(game.player);
  assert.equal(game.player.x, PLAYER_SPAWN.col * TILE + (TILE - game.player.rect.w) / 2);
});

test('enemy spawning still works while the player is respawning', () => {
  const game = quietGame({ grid: emptyGrid() });
  game.player = null;
  game.spawnQueue = 1;
  assert.equal(game.spawnEnemy(), true);
  assert.equal(game.enemies.length, 1);
});

test('player bullet does not destroy the friendly base', () => {
  const grid = setCell(emptyGrid(), 6, 12, 'E');
  const game = quietGame({ grid });
  game.player.dir = 'up';
  const bullet = game.fireTank(game.player);
  assert.ok(bullet);
  bullet.x = 6 * TILE + TILE / 2;
  bullet.y = 12 * TILE + TILE / 2;
  game.update(0.01, {});
  assert.equal(game.map.baseAlive, true);
  assert.equal(game.state, STATE_PLAYING);
});