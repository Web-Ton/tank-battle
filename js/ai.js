import { DIR_ORDER, OPPOSITE } from './config.js';

function center(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

export function isAligned(a, b, tolerance = 6) {
  const ca = center(a);
  const cb = center(b);
  return Math.abs(ca.x - cb.x) <= tolerance || Math.abs(ca.y - cb.y) <= tolerance;
}

export function chooseDirection({ dir, dx, dy, canMove, rng = Math.random }) {
  const horizontal = dx < 0 ? 'left' : 'right';
  const vertical = dy < 0 ? 'up' : 'down';
  const primary = Math.abs(dx) >= Math.abs(dy) ? horizontal : vertical;
  const secondary = primary === horizontal ? vertical : horizontal;

  if (canMove(primary)) return primary;
  if (canMove(secondary) && rng() > 0.25) return secondary;
  if (canMove(dir)) return dir;
  const reverse = OPPOSITE[dir];
  if (canMove(reverse)) return reverse;
  for (const candidate of DIR_ORDER) {
    if (canMove(candidate)) return candidate;
  }
  return dir;
}

export function shouldFire(self, target, cooldown, rng = Math.random) {
  if (cooldown > 0) return false;
  if (isAligned(self, target)) return true;
  return rng() < 0.02;
}