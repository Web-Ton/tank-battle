import { BULLET_SIZE, BULLET_SPEED, DIRS } from './config.js';

export class Bullet {
  constructor({ x, y, dir = 'up', speed = BULLET_SPEED, owner = 'player' }) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.owner = owner;
  }

  get rect() {
    return { x: this.x - BULLET_SIZE / 2, y: this.y - BULLET_SIZE / 2, w: BULLET_SIZE, h: BULLET_SIZE };
  }

  move(dt) {
    const vector = DIRS[this.dir];
    this.x += vector.x * this.speed * dt;
    this.y += vector.y * this.speed * dt;
  }
}