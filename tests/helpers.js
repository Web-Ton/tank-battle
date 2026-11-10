import { COLS, ROWS } from '../js/config.js';

export function emptyGrid() {
  return Array.from({ length: ROWS }, () => '.'.repeat(COLS));
}

export function gridWithBase() {
  const rows = emptyGrid().map((row) => row.split(''));
  rows[ROWS - 1][6] = 'E';
  return rows.map((r) => r.join(''));
}

export function setCell(rows, col, row, ch) {
  const copy = rows.map((r) => r.split(''));
  copy[row][col] = ch;
  return copy.map((r) => r.join(''));
}