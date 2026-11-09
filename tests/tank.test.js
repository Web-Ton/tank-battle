import test from 'node:test';
import assert from 'node:assert/strict';
import { Tank } from '../js/tank.js';
import { Bullet } from '../js/bullet.js';
import { TileMap } from '../js/map.js';
import { emptyGrid, setCell } from './helpers.js';
import { TILE, TANK_SIZE, BULLET_SIZE } from '../js/config.js';

test('tank moves along its facing direction', () => {
  const tank = new Tank({ x: 40, y: 40, dir: 'right', speed: 100 });
  const map = new TileMap(emptyGrid());
  assert.equal(tank.move(0.5, map), true);
  assert.ok(tank.x > 40);
  assert.equal(tank.dir, 'right');
});

test('tank is blocked by walls and stays in place', () => {
  const map = new TileMap(setCell(emptyGrid(), 2, 0, 'S'));
  const tank = new Tank({ x: 20, y: 0, dir: 'right', speed: 100 });
  const before = { ...tank.rect };
  tank.move(1, map);
  assert.deepEqual(tank.rect, before);
});

test('tank is blocked by another tank and by world edge', () => {
  const map = new TileMap(emptyGrid());
  const a = new Tank({ x: 40, y: 40, dir: 'right', speed: 100 });
  const b = { x: 40 + TANK_SIZE - 2, y: 40, w: TANK_SIZE, h: TANK_SIZE };
  assert.equal(a.move(1, map, [b]), false);
  const edge = new Tank({ x: 0, y: 0, dir: 'left', speed: 100 });
  assert.equal(edge.move(1, map), false);
});

test('bullet moves along its direction and exposes a centred rect', () => {
  const bullet = new Bullet({ x: 100, y: 100, dir: 'up', speed: 200, owner: 'player' });
  const rect = bullet.rect;
  assert.equal(rect.w, BULLET_SIZE);
  assert.equal(rect.x, 100 - BULLET_SIZE / 2);
  bullet.move(0.5);
  assert.ok(bullet.y < 100);
});

test('tank rect follows pixel position', () => {
  const tank = new Tank({ x: TILE, y: TILE, dir: 'up', speed: 1 });
  assert.deepEqual(tank.rect, { x: TILE, y: TILE, w: TANK_SIZE, h: TANK_SIZE });
});