import test from 'node:test';
import assert from 'node:assert/strict';

test('load repo', async () => {
  await import('../.test-dist/src/domain/goals/weekly-goal-repository.js');
});
