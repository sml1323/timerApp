import test from 'node:test';
import assert from 'node:assert/strict';
import { toWeeklyGoal, toWeeklyGoalRow } from '../.test-dist/src/domain/goals/weekly-goal-mappers.js';

// ─── toWeeklyGoal ───

test('toWeeklyGoal converts DB row to TS object', () => {
  const row = {
    id: 'goal-1',
    topic_id: 'topic-1',
    week_start_at_ms: 1710720000000,
    target_minutes: 60,
    created_at_ms: 1710720000000,
    updated_at_ms: 1710720000001,
  };

  const result = toWeeklyGoal(row);

  assert.deepEqual(result, {
    id: 'goal-1',
    topicId: 'topic-1',
    weekStartAtMs: 1710720000000,
    targetMinutes: 60,
    createdAtMs: 1710720000000,
    updatedAtMs: 1710720000001,
  });
});

test('toWeeklyGoal maps all snake_case fields to camelCase', () => {
  const row = {
    id: 'x',
    topic_id: 'y',
    week_start_at_ms: 100,
    target_minutes: 30,
    created_at_ms: 200,
    updated_at_ms: 300,
  };

  const goal = toWeeklyGoal(row);

  // snake_case 키는 없어야 한다
  assert.equal('topic_id' in goal, false);
  assert.equal('week_start_at_ms' in goal, false);
  assert.equal('target_minutes' in goal, false);
  assert.equal('created_at_ms' in goal, false);
  assert.equal('updated_at_ms' in goal, false);

  // camelCase 키만 존재
  assert.equal(goal.topicId, 'y');
  assert.equal(goal.weekStartAtMs, 100);
  assert.equal(goal.targetMinutes, 30);
  assert.equal(goal.createdAtMs, 200);
  assert.equal(goal.updatedAtMs, 300);
});

// ─── toWeeklyGoalRow ───

test('toWeeklyGoalRow converts full TS object to DB row', () => {
  const goal = {
    id: 'goal-2',
    topicId: 'topic-2',
    weekStartAtMs: 1710720000000,
    targetMinutes: 120,
    createdAtMs: 1710720000000,
    updatedAtMs: 1710720000001,
  };

  const row = toWeeklyGoalRow(goal);

  assert.deepEqual(row, {
    id: 'goal-2',
    topic_id: 'topic-2',
    week_start_at_ms: 1710720000000,
    target_minutes: 120,
    created_at_ms: 1710720000000,
    updated_at_ms: 1710720000001,
  });
});

test('toWeeklyGoalRow handles partial input (only targetMinutes)', () => {
  const partial = { targetMinutes: 90 };
  const row = toWeeklyGoalRow(partial);

  assert.deepEqual(row, { target_minutes: 90 });
});

test('toWeeklyGoalRow returns empty object for empty input', () => {
  const row = toWeeklyGoalRow({});
  assert.deepEqual(row, {});
});

test('toWeeklyGoalRow ignores undefined fields', () => {
  const partial = {
    id: 'goal-3',
    topicId: undefined,
    targetMinutes: 45,
  };

  const row = toWeeklyGoalRow(partial);

  assert.equal(row.id, 'goal-3');
  assert.equal(row.target_minutes, 45);
  assert.equal('topic_id' in row, false);
});
