import { TILE, COLS, ROWS, DIRS } from './config.js';
import { TILE_BRICK, TILE_STEEL, TILE_BASE } from './map.js';

const COLORS = {
  background: '#101418',
  grid: '#161d24',
  brick: '#b5542a',
  brickInset: '#8c3d1f',
  steel: '#c8d2da',
  steelInset: '#8b98a3',
  base: '#e8c547',
  player: '#5fd35f',
  playerInset: '#2f7a2f',
  enemy: '#d9d9d9',
  enemyInset: '#8a8a8a',
  bullet: '#fff3b0',
};

export function draw(ctx, game) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, COLS * TILE, ROWS * TILE);

  drawGrid(ctx);
  drawTiles(ctx, game.map);
  for (const bullet of game.bullets) drawBullet(ctx, bullet);
  for (const enemy of game.enemies) drawTank(ctx, enemy);
  if (game.player) drawTank(ctx, game.player);
}

function drawGrid(ctx) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let col = 1; col < COLS; col += 1) {
    ctx.beginPath();
    ctx.moveTo(col * TILE, 0);
    ctx.lineTo(col * TILE, ROWS * TILE);
    ctx.stroke();
  }
  for (let row = 1; row < ROWS; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, row * TILE);
    ctx.lineTo(COLS * TILE, row * TILE);
    ctx.stroke();
  }
}

function drawTiles(ctx, map) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = map.tileAt(col, row);
      if (type === TILE_BRICK) drawBrick(ctx, col, row);
      else if (type === TILE_STEEL) drawSteel(ctx, col, row);
      else if (type === TILE_BASE) drawBase(ctx, col, row);
    }
  }
}

function drawBrick(ctx, col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.fillStyle = COLORS.brick;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.brickInset;
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      ctx.fillRect(x + j * 16 + 1, y + i * 16 + 1, 14, 6);
      ctx.fillRect(x + j * 16 + 8, y + i * 16 + 8, 7, 6);
    }
  }
}

function drawSteel(ctx, col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.fillStyle = COLORS.steel;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.steelInset;
  ctx.fillRect(x + 3, y + 3, 10, 10);
  ctx.fillRect(x + 19, y + 19, 10, 10);
}

function drawBase(ctx, col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.fillStyle = COLORS.base;
  ctx.beginPath();
  ctx.moveTo(x + TILE / 2, y + 4);
  ctx.lineTo(x + TILE - 5, y + TILE - 6);
  ctx.lineTo(x + 5, y + TILE - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(x + TILE / 2 - 3, y + TILE / 2 - 2, 6, 8);
}

function drawTank(ctx, tank) {
  const { x, y, w, h } = tank.rect;
  const player = tank.faction === 'player';
  ctx.fillStyle = player ? COLORS.player : COLORS.enemy;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = player ? COLORS.playerInset : COLORS.enemyInset;
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

  const vector = DIRS[tank.dir];
  ctx.fillStyle = player ? COLORS.player : COLORS.enemy;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const barrel = 12;
  if (vector.x !== 0) {
    ctx.fillRect(vector.x > 0 ? cx : cx - barrel, cy - 3, barrel, 6);
  } else {
    ctx.fillRect(cx - 3, vector.y > 0 ? cy : cy - barrel, 6, barrel);
  }
}

function drawBullet(ctx, bullet) {
  const { x, y, w, h } = bullet.rect;
  ctx.fillStyle = COLORS.bullet;
  ctx.fillRect(x, y, w, h);
}