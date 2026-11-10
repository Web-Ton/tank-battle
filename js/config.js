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
export const PLAYER_RESPAWN_DELAY = 0.6;
export const ENEMY_FIRE_COOLDOWN = 1.2;
export const ENEMY_SCORE = 100;
export const MAX_ACTIVE_ENEMIES = 4;

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
    enemyTotal: 20,
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
    enemyTotal: 20,
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
    enemyTotal: 20,
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
  {
    name: '走廊',
    enemyTotal: 20,
    grid: [
      '.............',
      '.SB.SB.SB.SB.',
      '.............',
      '.SB.SB.SB.SB.',
      '.............',
      '..SS.SS.SS...',
      '.............',
      '.BB.BB.BB.BB.',
      '.............',
      '.SS.BBB.BB.S.',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '回廊',
    enemyTotal: 20,
    grid: [
      '.............',
      '.BBBB.BBBBBB.',
      '.B.........B.',
      '.B.SS...SS.B.',
      '.B.SS...SS.B.',
      '.B.........B.',
      '.B.BB.BB.BB.B',
      '.B.BB.BB.BB.B',
      '.B.........B.',
      '.BBBB.BBBBBB.',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '十字',
    enemyTotal: 20,
    grid: [
      '.............',
      '..B..BSB..B..',
      '..B..BSB..B..',
      '..B.......B..',
      '..B.BB.BB.B..',
      '.....B.B.....',
      '.SS.BB.BB.SS.',
      '.....B.B.....',
      '..B.BB.BB.B..',
      '..B.......B..',
      '..B..BBB..B..',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '岔路',
    enemyTotal: 20,
    grid: [
      '.............',
      '.BB.BBB.BBB.B',
      '.BB...B...BB.',
      '......B......',
      'BB.BB...BB.BB',
      '.....B.B.....',
      '.BB..B.B..BB.',
      '.....B.B.....',
      'BB.BB...BB.BB',
      '......B......',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '阵地',
    enemyTotal: 20,
    grid: [
      '.............',
      '..SS..B..SS..',
      '..SS..B..SS..',
      '......B......',
      '.BBB..B..BBB.',
      '...B.....B...',
      'BB.B.BBB.B.BB',
      '...B.....B...',
      '.BBB..B..BBB.',
      '......B......',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '铁幕',
    enemyTotal: 20,
    grid: [
      '.............',
      '.SS.SSS.SS.S.',
      '.SS.SSS.SS.S.',
      '...S.....S...',
      '.BBB.B.B.BBB.',
      '.B...B.B...B.',
      '.B.BBB.BBB.B.',
      '.B...B.B...B.',
      '.BBB.B.B.BBB.',
      '...S.....S...',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
  {
    name: '终局',
    enemyTotal: 20,
    grid: [
      '.............',
      'SS.B.B.B.B.SS',
      '...B.B.B.B...',
      '.BB.B...B.BB.',
      '.BB.B.B.B.BB.',
      '.....B.B.....',
      'BBB.......BBB',
      '.....B.B.....',
      '.BB.B.B.B.BB.',
      '.BB.B...B.BB.',
      '.....BBB.....',
      '.....BEB.....',
      '...p.BBB.....',
    ],
  },
];

export function enemyTotalForLevel(levelIndex) {
  if (!Number.isInteger(levelIndex) || levelIndex < 0) return 0;
  const level = LEVELS[levelIndex];
  return level ? level.enemyTotal : 0;
}