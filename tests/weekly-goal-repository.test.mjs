import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Tauri IPC Mocking for @tauri-apps/plugin-sql
globalThis.window = globalThis;

let mockDbState = {
  selectResults: [],
  executeResult: [1, 0],
  lastQuery: '',
  lastBinds: []
};

globalThis.__TAURI_INTERNALS__ = {
  invoke: async (cmd, args) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') {
      mockDbState.lastQuery = args.query;
      mockDbState.lastBinds = args.values;
      if (args.query.includes('SELECT id FROM weekly_goals WHERE topic_id')) {
        return mockDbState.selectResults;
      }
      return mockDbState.selectResults;
    }
    if (cmd === 'plugin:sql|execute') {
      mockDbState.lastQuery = args.query;
      mockDbState.lastBinds = args.values;
      return mockDbState.executeResult;
    }
    return null;
  }
};

// Import the repository after mocking the environment
import { 
  createWeeklyGoal, 
  updateWeeklyGoal, 
  findByTopicAndWeek,
  findAllByWeek
} from '../.test-dist/src/domain/goals/weekly-goal-repository.js';
import { ERROR_CODES } from '../.test-dist/src/shared/lib/errors.js';

beforeEach(() => {
  // Reset mock state before each test
  mockDbState.selectResults = [];
  mockDbState.executeResult = [1, 0];
  mockDbState.lastQuery = '';
  mockDbState.lastBinds = [];
});

test('createWeeklyGoal creates and returns a goal', async () => {
  let callCount = 0;
  globalThis.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') {
      callCount++;
      if (callCount === 1) return []; // duplicate check returns empty
      return [{
        id: 'mock-id',
        topic_id: 'topic-1',
        week_start_at_ms: 1000,
        target_minutes: 60,
        created_at_ms: 2000,
        updated_at_ms: 2000
      }]; // insert check returns row
    }
    if (cmd === 'plugin:sql|execute') return [1, 0];
  };

  const input = { topicId: 'topic-1', weekStartAtMs: 1000, targetMinutes: 60 };
  const res = await createWeeklyGoal(input);
  if (!res.ok) console.log('CREATE ERROR:', res);

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.topicId, 'topic-1');
    assert.equal(res.data.targetMinutes, 60);
  }
});

test('createWeeklyGoal fails if duplicate exists', async () => {
  globalThis.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') {
      return [{ id: 'existing-id' }];
    }
    return { rowsAffected: 0 };
  };

  const input = { topicId: 'topic-1', weekStartAtMs: 1000, targetMinutes: 60 };
  const res = await createWeeklyGoal(input);

  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.code, ERROR_CODES.VALIDATION_ERROR);
    assert.match(res.message, /weekly goal already exists/i);
  }
});

test('updateWeeklyGoal updates targetMinutes', async () => {
  let callCount = 0;
  globalThis.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') {
      callCount++;
      return [{
        id: 'mock-id',
        topic_id: 'topic-1',
        week_start_at_ms: 1000,
        target_minutes: 120, // updated value
        created_at_ms: 2000,
        updated_at_ms: 3000
      }];
    }
    if (cmd === 'plugin:sql|execute') {
      mockDbState.lastQuery = args.query;
      mockDbState.lastBinds = args.values;
      return [1, 0];
    }
  };

  const res = await updateWeeklyGoal('mock-id', { targetMinutes: 120 });
  if (!res.ok) console.log('UPDATE ERROR:', res);

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.targetMinutes, 120);
  }
  assert.ok(mockDbState.lastQuery.includes('UPDATE weekly_goals SET target_minutes = $1'));
  assert.equal(mockDbState.lastBinds[0], 120);
});

test('findByTopicAndWeek returns null if no record', async () => {
  globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') return [];
  };

  const res = await findByTopicAndWeek('topic-99', 1234);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data, null);
  }
});

test('findAllByWeek returns multiple goals', async () => {
  globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
    if (cmd === 'plugin:sql|load') return 'db-mock';
    if (cmd === 'plugin:sql|select') {
      return [
        { id: '1', topic_id: 't1', week_start_at_ms: 100, target_minutes: 10, created_at_ms: 1, updated_at_ms: 1 },
        { id: '2', topic_id: 't2', week_start_at_ms: 100, target_minutes: 20, created_at_ms: 1, updated_at_ms: 1 }
      ];
    }
  };

  const res = await findAllByWeek(100);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.length, 2);
    assert.equal(res.data[0].topicId, 't1');
    assert.equal(res.data[1].topicId, 't2');
  }
});
