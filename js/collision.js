import { TILE, COLS, ROWS } from './config.js';
import { TILE_BRICK, TILE_STEEL, TILE_BASE, tilesInRect } from './map.js';

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function isInsideWorld(rect) {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.w <= COLS * TILE &&
    rect.y + rect.h <= ROWS * TILE
  );
}

export function isSolidTile(type) {
  return type === TILE_BRICK || type === TILE_STEEL || type === TILE_BASE;
}

export function tilesBlocking(map, rect) {
  return tilesInRect(map, rect).filter((tile) => isSolidTile(tile.type));
}

export function canTankOccupy(map, rect, others = []) {
  if (!isInsideWorld(rect)) return false;
  if (tilesBlocking(map, rect).length > 0) return false;
  return !others.some((other) => rectsOverlap(rect, other));
}