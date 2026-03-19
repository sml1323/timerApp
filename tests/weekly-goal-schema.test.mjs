import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateWeeklyGoalSchema,
  UpdateWeeklyGoalSchema,
} from '../.test-dist/src/domain/goals/weekly-goal-schema.js';

// ─── CreateWeeklyGoalSchema ───

test('CreateWeeklyGoalSchema accepts valid input', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 1710720000000,
    targetMinutes: 60,
  });
  assert.equal(result.success, true);
});

test('CreateWeeklyGoalSchema rejects empty topicId', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: '',
    weekStartAtMs: 1710720000000,
    targetMinutes: 60,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects negative weekStartAtMs', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: -1,
    targetMinutes: 60,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects zero weekStartAtMs', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 0,
    targetMinutes: 60,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects non-integer weekStartAtMs', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 1710720000000.5,
    targetMinutes: 60,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects zero targetMinutes', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 1710720000000,
    targetMinutes: 0,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects negative targetMinutes', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 1710720000000,
    targetMinutes: -10,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects non-integer targetMinutes', () => {
  const result = CreateWeeklyGoalSchema.safeParse({
    topicId: 'abc-123',
    weekStartAtMs: 1710720000000,
    targetMinutes: 30.5,
  });
  assert.equal(result.success, false);
});

test('CreateWeeklyGoalSchema rejects missing fields', () => {
  const result = CreateWeeklyGoalSchema.safeParse({});
  assert.equal(result.success, false);
});

// ─── UpdateWeeklyGoalSchema ───

test('UpdateWeeklyGoalSchema accepts valid targetMinutes', () => {
  const result = UpdateWeeklyGoalSchema.safeParse({ targetMinutes: 120 });
  assert.equal(result.success, true);
});

test('UpdateWeeklyGoalSchema accepts minimum targetMinutes (1)', () => {
  const result = UpdateWeeklyGoalSchema.safeParse({ targetMinutes: 1 });
  assert.equal(result.success, true);
});

test('UpdateWeeklyGoalSchema rejects zero targetMinutes', () => {
  const result = UpdateWeeklyGoalSchema.safeParse({ targetMinutes: 0 });
  assert.equal(result.success, false);
});

test('UpdateWeeklyGoalSchema rejects negative targetMinutes', () => {
  const result = UpdateWeeklyGoalSchema.safeParse({ targetMinutes: -5 });
  assert.equal(result.success, false);
});

test('UpdateWeeklyGoalSchema rejects non-integer targetMinutes', () => {
  const result = UpdateWeeklyGoalSchema.safeParse({ targetMinutes: 1.5 });
  assert.equal(result.success, false);
});
