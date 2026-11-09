import { TILE, COLS, ROWS } from './config.js';

export const TILE_EMPTY = 0;
export const TILE_BRICK = 1;
export const TILE_STEEL = 2;
export const TILE_BASE = 3;

const CHAR_TO_TILE = {
  '.': TILE_EMPTY,
  B: TILE_BRICK,
  S: TILE_STEEL,
  E: TILE_BASE,
  p: TILE_EMPTY,
  x: TILE_EMPTY,
};

export function parseGrid(rows) {
  if (!Array.isArray(rows) || rows.length !== ROWS) {
    throw new Error(`invalid map: expected ${ROWS} rows, got ${rows.length}`);
  }
  return rows.map((row, rowIndex) => {
    if (typeof row !== 'string' || row.length !== COLS) {
      throw new Error(`invalid map: row ${rowIndex} must have ${COLS} columns`);
    }
    return row.split('').map((char) => {
      const tile = CHAR_TO_TILE[char];
      if (tile === undefined) {
        throw new Error(`invalid map char '${char}' at row ${rowIndex}`);
      }
      return tile;
    });
  });
}

export class TileMap {
  constructor(rows) {
    this.grid = parseGrid(rows);
    this.baseCells = [];
    this.baseDestroyed = false;
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        if (this.grid[row][col] === TILE_BASE) {
          this.baseCells.push({ col, row });
        }
      }
    }
  }

  get baseAlive() {
    return !this.baseDestroyed && this.baseCells.length > 0;
  }

  tileAt(col, row) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) {
      return TILE_STEEL;
    }
    return this.grid[row][col];
  }

  setTile(col, row, type) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return;
    this.grid[row][col] = type;
  }

  hit(col, row) {
    const type = this.tileAt(col, row);
    if (type === TILE_BRICK) {
      this.setTile(col, row, TILE_EMPTY);
      return 'destroyed';
    }
    if (type === TILE_STEEL) {
      return 'blocked';
    }
    if (type === TILE_BASE) {
      this.setTile(col, row, TILE_EMPTY);
      this.baseCells = this.baseCells.filter((cell) => cell.col !== col || cell.row !== row);
      this.baseDestroyed = true;
      return 'base';
    }
    return 'none';
  }
}

export function tileRect(col, row) {
  return { x: col * TILE, y: row * TILE, w: TILE, h: TILE };
}

export function tilesInRect(map, rect) {
  const tiles = [];
  const startCol = Math.floor(rect.x / TILE);
  const endCol = Math.floor((rect.x + rect.w - 1) / TILE);
  const startRow = Math.floor(rect.y / TILE);
  const endRow = Math.floor((rect.y + rect.h - 1) / TILE);
  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      tiles.push({ col, row, type: map.tileAt(col, row) });
    }
  }
  return tiles;
}