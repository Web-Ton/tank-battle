import { TANK_SIZE, DIRS, PLAYER_SPEED } from './config.js';
import { canTankOccupy } from './collision.js';

const STEP = 4;

export class Tank {
  constructor({ x, y, dir = 'up', speed = PLAYER_SPEED, size = TANK_SIZE, faction = 'player' }) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.speed = speed;
    this.size = size;
    this.faction = faction;
    this.cooldown = 0;
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.size, h: this.size };
  }

  setDirection(dir) {
    if (DIRS[dir]) this.dir = dir;
  }

  move(dt, map, others = []) {
    const vector = DIRS[this.dir];
    const distance = this.speed * dt;
    if (distance <= 0) return false;

    const steps = Math.max(1, Math.ceil(distance / STEP));
    const step = distance / steps;
    const samples = [];
    for (let i = 1; i <= steps; i += 1) {
      samples.push({ x: this.x + vector.x * step * i, y: this.y + vector.y * step * i, w: this.size, h: this.size });
    }
    if (!samples.every((rect) => canTankOccupy(map, rect, others))) {
      return false;
    }
    this.x = samples[samples.length - 1].x;
    this.y = samples[samples.length - 1].y;
    return true;
  }
}