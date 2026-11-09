import {
  TILE,
  TANK_SIZE,
  LEVELS,
  DIRS,
  PLAYER_SPEED,
  ENEMY_SPEED,
  BULLET_SPEED,
  PLAYER_LIVES,
  PLAYER_FIRE_COOLDOWN,
  ENEMY_FIRE_COOLDOWN,
  ENEMY_SCORE,
  MAX_ACTIVE_ENEMIES,
  PLAYER_SPAWN,
  ENEMY_SPAWNS,
  enemyTotalForLevel,
} from './config.js';
import { TileMap, tileRect, tilesInRect, TILE_BASE } from './map.js';
import { Tank } from './tank.js';
import { Bullet } from './bullet.js';
import { canTankOccupy, rectsOverlap, isInsideWorld } from './collision.js';
import { chooseDirection, isAligned, shouldFire, aimDirection } from './ai.js';

export const STATE_PLAYING = 'playing';
export const STATE_CLEAR = 'levelclear';
export const STATE_LOST = 'lost';

const BULLET_STEP = 4;

export class Game {
  constructor({
    levelIndex = 0,
    score = 0,
    lives = PLAYER_LIVES,
    grid = null,
    spawn = true,
    enemyTotal = null,
    rng = Math.random,
  } = {}) {
    this.rng = rng;
    this.spawnEnabled = spawn;
    this.levelIndex = levelIndex;
    this.score = score;
    this.lives = lives;
    this.enemyTotal = enemyTotal === null ? enemyTotalForLevel(levelIndex) : enemyTotal;
    this.state = STATE_PLAYING;
    this.spawnAttempt = 0;
    this.spawnTimer = 0;
    this.resetLevel(grid);
  }

  get levelNumber() {
    return this.levelIndex + 1;
  }

  get level() {
    return LEVELS[this.levelIndex % LEVELS.length];
  }

  get remainingEnemies() {
    return this.spawnQueue + this.enemies.length;
  }

  resetLevel(grid = null) {
    this.map = new TileMap(grid || this.level.grid);
    this.player = this.createPlayer();
    this.enemies = [];
    this.bullets = [];
    this.spawnQueue = this.enemyTotal;
    this.spawnTimer = 0;
    this.state = STATE_PLAYING;
    if (this.spawnEnabled) {
      this.spawnEnemy();
      this.spawnTimer = 2;
    }
  }

  createPlayer() {
    const tank = this.makeTank(PLAYER_SPAWN.col, PLAYER_SPAWN.row, {
      faction: 'player',
      speed: PLAYER_SPEED,
      dir: 'up',
    });
    tank.cooldown = 0;
    return tank;
  }

  createEnemy(col = 0, row = 0) {
    const tank = this.makeTank(col, row, {
      faction: 'enemy',
      speed: ENEMY_SPEED,
      dir: 'down',
    });
    tank.cooldown = 0;
    return tank;
  }

  makeTank(col, row, options) {
    const offset = (TILE - TANK_SIZE) / 2;
    return new Tank({ x: col * TILE + offset, y: row * TILE + offset, ...options });
  }

  spawnEnemy() {
    if (this.spawnQueue <= 0 || this.enemies.length >= MAX_ACTIVE_ENEMIES) return false;
    const others = [this.player, ...this.enemies].map((tank) => tank.rect);
    for (let attempt = 0; attempt < ENEMY_SPAWNS.length; attempt += 1) {
      const slot = ENEMY_SPAWNS[(this.spawnAttempt + attempt) % ENEMY_SPAWNS.length];
      const enemy = this.createEnemy(slot.col, slot.row);
      if (canTankOccupy(this.map, enemy.rect, others)) {
        this.spawnAttempt = (this.spawnAttempt + attempt + 1) % ENEMY_SPAWNS.length;
        this.enemies.push(enemy);
        this.spawnQueue -= 1;
        return true;
      }
    }
    return false;
  }

  fireTank(tank) {
    if (!tank || tank.cooldown > 0) return null;
    const vector = DIRS[tank.dir];
    const rect = tank.rect;
    const bullet = new Bullet({
      x: rect.x + rect.w / 2 + vector.x * (rect.w / 2),
      y: rect.y + rect.h / 2 + vector.y * (rect.h / 2),
      dir: tank.dir,
      speed: BULLET_SPEED,
      owner: tank === this.player ? 'player' : 'enemy',
    });
    tank.cooldown = tank === this.player ? PLAYER_FIRE_COOLDOWN : ENEMY_FIRE_COOLDOWN;
    this.bullets.push(bullet);
    return bullet;
  }

  update(dt, input = {}) {
    if (this.state !== STATE_PLAYING) return;
    this.updatePlayer(dt, input);
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.checkLevelClear();
  }

  updatePlayer(dt, input) {
    if (!this.player) return;
    this.player.cooldown = Math.max(0, this.player.cooldown - dt);
    let dir = null;
    if (input.up) dir = 'up';
    else if (input.down) dir = 'down';
    else if (input.left) dir = 'left';
    else if (input.right) dir = 'right';
    if (dir) {
      this.player.setDirection(dir);
      this.player.move(dt, this.map, this.enemies.map((enemy) => enemy.rect));
    }
    if (input.fire) this.fireTank(this.player);
  }

  updateEnemies(dt) {
    this.spawnTimer -= dt;
    if (
      this.spawnEnabled &&
      this.spawnTimer <= 0 &&
      this.spawnQueue > 0 &&
      this.enemies.length < MAX_ACTIVE_ENEMIES
    ) {
      this.spawnEnemy();
      this.spawnTimer = 2;
    }

    for (const enemy of this.enemies) {
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      const baseRect = this.baseRect();
      const target = baseRect && this.rng() < 0.5 ? baseRect : this.player ? this.player.rect : baseRect;
      if (!target) continue;

      const dx = target.x + target.w / 2 - (enemy.x + enemy.rect.w / 2);
      const dy = target.y + target.h / 2 - (enemy.y + enemy.rect.h / 2);
      const others = this.othersFor(enemy);
      const canMove = (dir) => {
        const vector = DIRS[dir];
        const probe = {
          x: enemy.x + vector.x * BULLET_STEP,
          y: enemy.y + vector.y * BULLET_STEP,
          w: enemy.rect.w,
          h: enemy.rect.h,
        };
        return canTankOccupy(this.map, probe, others);
      };
      const dir = chooseDirection({ dir: enemy.dir, dx, dy, canMove, rng: this.rng });
      enemy.setDirection(dir);
      enemy.move(dt, this.map, others);

      const aimedAt = isAligned(enemy.rect, target)
        ? target
        : baseRect && isAligned(enemy.rect, baseRect)
          ? baseRect
          : null;
      const aimDir = aimedAt ? aimDirection(enemy.rect, aimedAt, 6, enemy.dir) : null;
      if (aimDir && enemy.dir === aimDir && shouldFire(enemy.rect, aimedAt, enemy.cooldown, this.rng)) {
        this.fireTank(enemy);
      }
    }
  }

  othersFor(enemy) {
    return [this.player, ...this.enemies]
      .filter((tank) => tank && tank !== enemy)
      .map((tank) => tank.rect);
  }

  baseRect() {
    const cell = this.map.baseCells[0];
    return cell ? tileRect(cell.col, cell.row) : null;
  }

  updateBullets(dt) {
    const survivors = [];
    for (const bullet of this.bullets) {
      const distance = bullet.speed * dt;
      const steps = Math.max(1, Math.ceil(distance / BULLET_STEP));
      const step = distance / steps;
      let alive = true;
      for (let i = 0; i < steps && alive; i += 1) {
        bullet.move(step / bullet.speed);
        alive = this.resolveBullet(bullet);
      }
      if (alive && isInsideWorld(bullet.rect)) survivors.push(bullet);
    }
    this.bullets = survivors;
  }

  resolveBullet(bullet) {
    const rect = bullet.rect;
    if (!isInsideWorld(rect)) return false;

    for (const tile of tilesInRect(this.map, rect)) {
      if (tile.type === 0) continue;
      if (tile.type === TILE_BASE && bullet.owner === 'player') return false;
      const result = this.map.hit(tile.col, tile.row);
      if (result === 'base') {
        this.state = STATE_LOST;
        return false;
      }
      if (result === 'destroyed' || result === 'blocked') return false;
    }

    if (bullet.owner === 'player') {
      const enemy = this.enemies.find((candidate) => rectsOverlap(rect, candidate.rect));
      if (enemy) {
        this.killEnemy(enemy);
        return false;
      }
    } else if (this.player && rectsOverlap(rect, this.player.rect)) {
      this.killPlayer();
      return false;
    }
    return true;
  }

  killEnemy(enemy) {
    this.enemies = this.enemies.filter((candidate) => candidate !== enemy);
    this.score += ENEMY_SCORE;
  }

  killPlayer() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.state = STATE_LOST;
      return;
    }
    this.player = this.createPlayer();
  }

  checkLevelClear() {
    if (this.state !== STATE_PLAYING) return;
    if (this.spawnQueue <= 0 && this.enemies.length === 0) {
      this.state = STATE_CLEAR;
    }
  }

  nextLevel() {
    this.levelIndex += 1;
    this.enemyTotal = enemyTotalForLevel(this.levelIndex);
    this.resetLevel();
  }

  restart() {
    this.levelIndex = 0;
    this.enemyTotal = enemyTotalForLevel(0);
    this.score = 0;
    this.lives = PLAYER_LIVES;
    this.resetLevel();
  }
}