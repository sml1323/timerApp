import test from 'node:test';
import assert from 'node:assert/strict';
import { derivePosture } from '../.test-dist/src/features/session/state/derivePosture.js';

test('no session → idle', () => {
  assert.equal(derivePosture('idle', null, false), 'idle');
});

test('running + study → focus', () => {
  assert.equal(derivePosture('running', 'study', true), 'focus');
});

test('running + break → break', () => {
  assert.equal(derivePosture('running', 'break', true), 'break');
});

test('session exists but not running → paused', () => {
  assert.equal(derivePosture('running', 'study', false), 'paused');
});

test('completed → complete', () => {
  assert.equal(derivePosture('completed', null, false), 'complete');
});

test('interrupted → interrupted', () => {
  assert.equal(derivePosture('interrupted', null, false), 'interrupted');
});

test('unknown phase defaults to idle', () => {
  assert.equal(derivePosture('idle', 'study', false), 'idle');
});
