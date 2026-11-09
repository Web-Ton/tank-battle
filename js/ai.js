import { DIR_ORDER, OPPOSITE } from './config.js';

function center(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

export function isAligned(a, b, tolerance = 6) {
  const ca = center(a);
  const cb = center(b);
  return Math.abs(ca.x - cb.x) <= tolerance || Math.abs(ca.y - cb.y) <= tolerance;
}

/**
 * 目标与自身在某一轴上对齐时，返回沿该轴指向目标的开火方向；两轴都未对齐返回 null。
 * 两轴同时对齐（贴合）时按 preferred（当前朝向）优先，避免选到无关轴向。
 */
export function aimDirection(self, target, preferred = null, tolerance = 6) {
  const ca = center(self);
  const cb = center(target);
  const dx = cb.x - ca.x;
  const dy = cb.y - ca.y;
  const candidates = [];
  if (Math.abs(dx) <= tolerance) candidates.push(dy < 0 ? 'up' : 'down');
  if (Math.abs(dy) <= tolerance) candidates.push(dx < 0 ? 'left' : 'right');
  if (preferred && candidates.includes(preferred)) return preferred;
  return candidates[0] ?? null;
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