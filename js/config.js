export const TILE = 32;
export const COLS = 13;
export const ROWS = 13;
export const TANK_SIZE = 28;
export const BULLET_SIZE = 6;

export const PLAYER_SPEED = 96;
export const ENEMY_SPEED = 64;
export const BULLET_SPEED = 300;

export const PLAYER_LIVES = 3;
export const PLAYER_FIRE_COOLDOWN = 0.35;
export const ENEMY_FIRE_COOLDOWN = 1.2;
export const ENEMY_SCORE = 100;
export const MAX_ACTIVE_ENEMIES = 3;

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const DIR_ORDER = ['up', 'down', 'left', 'right'];

export const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export const PLAYER_SPAWN = { col: 3, row: 12 };
export const ENEMY_SPAWNS = [
  { col: 0, row: 0 },
  { col: 3, row: 0 },
  { col: 12, row: 0 },
];

export const LEVELS = [
  {
    name: '前哨',
    grid: [
      '.............',
      '.BB.BB.BB.BB.',
      '.BB.BB.BB.BB.',
      '.............',
      '.BB.SS.SS.BB.',
      '.BB.SS.SS.BB.',
      '.............',
      '.BB.BB.BB.BB.',
      '.BB.BB.BB.BB.',
      '.....B.......',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '迷宫',
    grid: [
      '..B.......B..',
      '.B.B.BBB.B.B.',
      '.B.B.....B.B.',
      '...B.SSS.B...',
      'BB.....x...BB',
      '.....SSS.....',
      'BB.....x...BB',
      '...B.SSS.B...',
      '.B.B.....B.B.',
      '.B.B.BBB.B.B.',
      '..B.......B..',
      '.....BBB.....',
      '...p.BEB.....',
    ],
  },
  {
    name: '钢堡',
    grid: [
      '.............',
      '.S.S.S.S.S.S.',
      '.S.S.S.S.S.S.',
      '.............',
      '.BB.BBB.BB...',
      '.BB.B...BB...',
      '.............',
      '...BB.BB.BB..',
      '...BB.BB.BB..',
      '.............',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
];

export function enemyTotalForLevel(levelIndex) {
  return 4 + levelIndex * 2;
}