import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS,
  COLS,
  ROWS,
  MAX_ACTIVE_ENEMIES,
  ENEMY_SPAWNS,
  PLAYER_SPAWN,
  enemyTotalForLevel,
} from '../js/config.js';
import { TileMap } from '../js/map.js';

const LEVEL_COUNT = 10;
const ENEMIES_PER_LEVEL = 20;
const MAX_ON_FIELD = 4;

function cellsOf(level) {
  return level.grid.map((row) => row.split(''));
}

function findCells(level, char) {
  const found = [];
  cellsOf(level).forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === char) found.push({ col: colIndex, row: rowIndex });
    });
  });
  return found;
}

function reachable(level, from, to) {
  const grid = cellsOf(level);
  const passable = (col, row) =>
    col >= 0 && row >= 0 && col < COLS && row < ROWS && grid[row][col] !== 'S';
  const seen = new Set([`${from.col},${from.row}`]);
  const queue = [from];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (cell.col === to.col && cell.row === to.row) return true;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { col: cell.col + dc, row: cell.row + dr };
      const key = `${next.col},${next.row}`;
      if (seen.has(key) || !passable(next.col, next.row)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return false;
}

test('本期关卡数定稿为 10 关', () => {
  assert.equal(LEVELS.length, LEVEL_COUNT);
});

test('每关总敌数均为 20 辆', () => {
  for (const level of LEVELS) {
    assert.equal(level.enemyTotal, ENEMIES_PER_LEVEL, `${level.name} 敌数应为 20`);
  }
});

test('同屏敌坦克上限为 4 辆', () => {
  assert.equal(MAX_ACTIVE_ENEMIES, MAX_ON_FIELD);
});

test('enemyTotalForLevel 读取关卡配置', () => {
  LEVELS.forEach((level, index) => {
    assert.equal(enemyTotalForLevel(index), level.enemyTotal);
  });
  assert.equal(enemyTotalForLevel(0), ENEMIES_PER_LEVEL);
  assert.equal(enemyTotalForLevel(LEVELS.length - 1), ENEMIES_PER_LEVEL);
});

test('enemyTotalForLevel 越界返回 0，不回绕复用关卡', () => {
  for (const index of [LEVELS.length, LEVELS.length + 5, 99, -1, -5, 1.5, Number.NaN, undefined, null, '2']) {
    assert.equal(enemyTotalForLevel(index), 0, `索引 ${String(index)} 应返回 0`);
  }
});

test('每关地图为 13x13 且含唯一基地与出生点', () => {
  for (const level of LEVELS) {
    assert.equal(typeof level.name, 'string');
    assert.ok(level.name.length > 0);
    assert.equal(level.grid.length, ROWS, `${level.name} 行数`);
    for (const row of level.grid) {
      assert.equal(row.length, COLS, `${level.name} 列数`);
    }
    assert.equal(findCells(level, 'E').length, 1, `${level.name} 应含 1 个基地`);
    assert.equal(findCells(level, 'p').length, 1, `${level.name} 应含 1 个出生点`);
    assert.doesNotThrow(() => new TileMap(level.grid));
    assert.equal(new TileMap(level.grid).baseAlive, true);
  }
});

test('10 关地图互不重复', () => {
  const signatures = LEVELS.map((level) => level.grid.join('|'));
  assert.equal(new Set(signatures).size, LEVELS.length);
});

test('每关出生点与敌方出生点均可通行', () => {
  for (const level of LEVELS) {
    const grid = cellsOf(level);
    assert.equal(grid[PLAYER_SPAWN.row][PLAYER_SPAWN.col], 'p', `${level.name} 玩家出生点`);
    for (const spawn of ENEMY_SPAWNS) {
      const cell = grid[spawn.row][spawn.col];
      assert.ok(!'BSE'.includes(cell), `${level.name} 敌方出生点 (${spawn.col},${spawn.row}) 被墙阻挡`);
    }
  }
});

test('每个敌方出生点到基地均存在可达通道', () => {
  for (const level of LEVELS) {
    const [base] = findCells(level, 'E');
    for (const spawn of ENEMY_SPAWNS) {
      assert.ok(reachable(level, spawn, base), `${level.name} 出生点 (${spawn.col},${spawn.row}) 无法抵达基地`);
    }
    assert.ok(reachable(level, PLAYER_SPAWN, base), `${level.name} 玩家出生点无法抵达基地`);
  }
});
