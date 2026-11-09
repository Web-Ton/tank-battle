import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseDirection, isAligned, shouldFire, aimDirection } from '../js/ai.js';

const allowAll = () => true;

test('chooseDirection moves toward the target on the dominant axis', () => {
  const dir = chooseDirection({ dir: 'up', dx: -100, dy: 10, canMove: allowAll, rng: () => 0.99 });
  assert.equal(dir, 'left');
});

test('chooseDirection picks a passable alternative when preferred is blocked', () => {
  const canMove = (d) => d !== 'left';
  const dir = chooseDirection({ dir: 'up', dx: -100, dy: 10, canMove, rng: () => 0.1 });
  assert.notEqual(dir, 'left');
  assert.ok(['up', 'down', 'right'].includes(dir));
});

test('chooseDirection falls back to current direction when nothing else is passable', () => {
  const canMove = (d) => d === 'up';
  const dir = chooseDirection({ dir: 'up', dx: -100, dy: -100, canMove, rng: () => 0.5 });
  assert.equal(dir, 'up');
});

test('isAligned compares centres with a tolerance', () => {
  assert.equal(isAligned({ x: 100, y: 0, w: 10 }, { x: 103, y: 50, w: 10 }), true);
  assert.equal(isAligned({ x: 100, y: 0, w: 10 }, { x: 130, y: 50, w: 10 }), false);
});

test('shouldFire triggers on aligned target or random chance', () => {
  const self = { x: 100, y: 100, w: 28, h: 28 };
  const aligned = { x: 104, y: 300, w: 28, h: 28 };
  const far = { x: 400, y: 400, w: 28, h: 28 };
  assert.equal(shouldFire(self, aligned, 0, () => 1), true);
  assert.equal(shouldFire(self, far, 0, () => 0.99), false);
  assert.equal(shouldFire(self, far, 0, () => 0.01), true);
});

test('aimDirection reports the direction along the aligned axis only', () => {
  const self = { x: 100, y: 100, w: 28, h: 28 };
  assert.equal(aimDirection(self, { x: 104, y: 300, w: 28, h: 28 }), 'down');
  assert.equal(aimDirection(self, { x: 104, y: -100, w: 28, h: 28 }), 'up');
  assert.equal(aimDirection(self, { x: 300, y: 104, w: 28, h: 28 }), 'right');
  assert.equal(aimDirection(self, { x: -100, y: 104, w: 28, h: 28 }), 'left');
  assert.equal(aimDirection(self, { x: 300, y: 300, w: 28, h: 28 }), null);
});