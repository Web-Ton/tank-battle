import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TileMap,
  parseGrid,
  TILE_EMPTY,
  TILE_BRICK,
  TILE_STEEL,
  TILE_BASE,
} from '../js/map.js';
import { emptyGrid, setCell, gridWithBase } from './helpers.js';
import { ROWS } from '../js/config.js';

test('parseGrid converts characters into tile constants', () => {
  const grid = parseGrid(setCell(emptyGrid(), 0, 0, 'B'));
  assert.equal(grid[0][0], TILE_BRICK);
  assert.equal(grid[0][1], TILE_EMPTY);
  assert.throws(() => parseGrid(['~~~~~']), /invalid/i);
});

test('parseGrid rejects grids with wrong dimensions', () => {
  assert.throws(() => parseGrid(['..']), /rows|size/i);
});

test('tileAt treats out of bounds as steel wall', () => {
  const map = new TileMap(emptyGrid());
  assert.equal(map.tileAt(-1, 0), TILE_STEEL);
  assert.equal(map.tileAt(0, -1), TILE_STEEL);
  assert.equal(map.tileAt(999, 0), TILE_STEEL);
});

test('hitting a brick destroys it, steel blocks, base is destroyed', () => {
  let grid = setCell(emptyGrid(), 3, 3, 'B');
  grid = setCell(grid, 4, 3, 'S');
  grid = setCell(grid, 5, 3, 'E');
  const map = new TileMap(grid);
  assert.equal(map.hit(3, 3), 'destroyed');
  assert.equal(map.tileAt(3, 3), TILE_EMPTY);
  assert.equal(map.hit(4, 3), 'blocked');
  assert.equal(map.tileAt(4, 3), TILE_STEEL);
  assert.equal(map.baseAlive, true);
  assert.equal(map.hit(5, 3), 'base');
  assert.equal(map.baseAlive, false);
  assert.equal(map.hit(0, 0), 'none');
});

test('baseAlive reflects presence of base tiles', () => {
  assert.equal(new TileMap(gridWithBase()).baseAlive, true);
  assert.equal(new TileMap(emptyGrid()).baseAlive, false);
});