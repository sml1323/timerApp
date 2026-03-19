import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

mock.module('../.test-dist/src/platform/tauri/sql-client.js', {
  namedExports: {
    select: async () => [{ 
      id: 'mocked-id', 
      topic_id: 'some-topic', 
      week_start_at_ms: 123, 
      target_minutes: 60, 
      created_at_ms: 100, 
      updated_at_ms: 100 
    }],
    execute: async () => {},
  },
});

test('mock test', async () => {
  const repo = await import('../.test-dist/src/domain/goals/weekly-goal-repository.js');
  const res = await repo.findByTopicAndWeek('some-topic', 123);
  console.log('Result:', res);
  assert.equal(res.ok, true);
  assert.equal(res.value.id, 'mocked-id');
});
