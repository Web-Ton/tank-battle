import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rectsOverlap,
  isInsideWorld,
  canTankOccupy,
  tilesBlocking,
} from '../js/collision.js';
import { tileRect } from '../js/map.js';
import { TileMap } from '../js/map.js';
import { TILE, TANK_SIZE, COLS, ROWS } from '../js/config.js';
import { emptyGrid, setCell } from './helpers.js';

test('rectsOverlap detects intersection and separation', () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.equal(rectsOverlap(a, { x: 5, y: 5, w: 10, h: 10 }), true);
  assert.equal(rectsOverlap(a, { x: 10, y: 0, w: 10, h: 10 }), false);
  assert.equal(rectsOverlap(a, { x: 11, y: 0, w: 10, h: 10 }), false);
});

test('isInsideWorld rejects out of bounds rectangles', () => {
  const inside = { x: 0, y: 0, w: TANK_SIZE, h: TANK_SIZE };
  assert.equal(isInsideWorld(inside), true);
  assert.equal(isInsideWorld({ x: -1, y: 0, w: TANK_SIZE, h: TANK_SIZE }), false);
  const max = { x: COLS * TILE - TANK_SIZE, y: ROWS * TILE - TANK_SIZE, w: TANK_SIZE, h: TANK_SIZE };
  assert.equal(isInsideWorld(max), true);
  assert.equal(isInsideWorld({ ...max, x: max.x + 1 }), false);
});

test('tileRect maps grid cells to pixel rectangles', () => {
  assert.deepEqual(tileRect(2, 3), { x: 2 * TILE, y: 3 * TILE, w: TILE, h: TILE });
});

test('canTankOccupy blocks brick, steel, base and other tanks', () => {
  let grid = setCell(emptyGrid(), 2, 2, 'B');
  grid = setCell(grid, 5, 5, 'S');
  grid = setCell(grid, 6, 6, 'E');
  const map = new TileMap(grid);
  const free = { x: 0, y: 0, w: TANK_SIZE, h: TANK_SIZE };
  assert.equal(canTankOccupy(map, free), true);
  assert.equal(canTankOccupy(map, { x: 2 * TILE, y: 2 * TILE, w: TANK_SIZE, h: TANK_SIZE }), false);
  assert.equal(canTankOccupy(map, { x: 5 * TILE, y: 5 * TILE, w: TANK_SIZE, h: TANK_SIZE }), false);
  assert.equal(canTankOccupy(map, { x: 6 * TILE, y: 6 * TILE, w: TANK_SIZE, h: TANK_SIZE }), false);
  assert.equal(
    canTankOccupy(map, free, [{ x: 4, y: 4, w: 10, h: 10 }]),
    false,
  );
});

test('tilesBlocking reports solid tiles under a rect', () => {
  const grid = setCell(emptyGrid(), 1, 1, 'B');
  const map = new TileMap(grid);
  const blocked = tilesBlocking(map, { x: TILE, y: TILE, w: TILE, h: TILE });
  assert.deepEqual(blocked, [{ col: 1, row: 1, type: 1 }]);
});