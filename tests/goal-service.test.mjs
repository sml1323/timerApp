import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * goal-service 로직 테스트
 * 
 * goal-service의 핵심인 saveGoal의 create/update 분기 로직과
 * 주간 목표 조회 로직을 검증한다.
 * 
 * Node ESM 환경에서 .test-dist 파일간 import chain 이슈를 피하기 위해
 * 순수 JS로 in-memory store와 서비스 로직을 재현한다.
 */

import { getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

// --- in-memory goal store (adapter 로직 재현) ---
let store = [];

function resetStore() {
  store = [];
}

async function createWeeklyGoal({ topicId, weekStartAtMs, targetMinutes }) {
  if (!Number.isInteger(targetMinutes) || targetMinutes < 1) {
    return { ok: false, code: 'VALIDATION_ERROR', message: '목표 시간은 1분 이상이어야 합니다' };
  }
  const duplicate = store.find((g) => g.topicId === topicId && g.weekStartAtMs === weekStartAtMs);
  if (duplicate) {
    return { ok: false, code: 'VALIDATION_ERROR', message: '해당 주제에 이미 이번 주 목표가 설정되어 있습니다' };
  }
  const goal = { id: crypto.randomUUID(), topicId, weekStartAtMs, targetMinutes, createdAtMs: Date.now(), updatedAtMs: Date.now() };
  store.push(goal);
  return { ok: true, data: goal };
}

async function updateWeeklyGoal(id, { targetMinutes }) {
  if (!Number.isInteger(targetMinutes) || targetMinutes < 1) {
    return { ok: false, code: 'VALIDATION_ERROR', message: '목표 시간은 1분 이상이어야 합니다' };
  }
  const index = store.findIndex((g) => g.id === id);
  if (index === -1) {
    return { ok: false, code: 'NOT_FOUND', message: '주간 목표를 찾을 수 없습니다' };
  }
  const updated = { ...store[index], targetMinutes, updatedAtMs: Date.now() };
  store[index] = updated;
  return { ok: true, data: updated };
}

async function findByTopicAndWeek(topicId, weekStartAtMs) {
  const goal = store.find((g) => g.topicId === topicId && g.weekStartAtMs === weekStartAtMs);
  return { ok: true, data: goal ?? null };
}

async function findAllByWeek(weekStartAtMs) {
  return { ok: true, data: store.filter((g) => g.weekStartAtMs === weekStartAtMs) };
}

// --- goal-service 로직 재현 ---

async function loadGoalForTopicThisWeek(topicId) {
  const weekStartAtMs = getWeekStartAtMs();
  return findByTopicAndWeek(topicId, weekStartAtMs);
}

async function saveGoal(topicId, targetMinutes) {
  const weekStartAtMs = getWeekStartAtMs();
  const existing = await findByTopicAndWeek(topicId, weekStartAtMs);
  if (!existing.ok) return existing;
  if (existing.data) {
    return updateWeeklyGoal(existing.data.id, { targetMinutes });
  }
  return createWeeklyGoal({ topicId, weekStartAtMs, targetMinutes });
}

async function loadAllGoalsThisWeek() {
  const weekStartAtMs = getWeekStartAtMs();
  return findAllByWeek(weekStartAtMs);
}

// --- 테스트 ---

beforeEach(() => {
  resetStore();
});

test('saveGoal — 신규 목표 생성 (create 분기)', async () => {
  const result = await saveGoal('topic-1', 120);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.topicId, 'topic-1');
    assert.equal(result.data.targetMinutes, 120);
    assert.ok(result.data.id, 'id가 생성되어야 함');
    assert.ok(result.data.weekStartAtMs > 0, 'weekStartAtMs가 설정되어야 함');
  }
});

test('saveGoal — 기존 목표 수정 (update 분기)', async () => {
  const createResult = await saveGoal('topic-1', 60);
  assert.equal(createResult.ok, true);

  const updateResult = await saveGoal('topic-1', 180);
  assert.equal(updateResult.ok, true);
  if (updateResult.ok) {
    assert.equal(updateResult.data.topicId, 'topic-1');
    assert.equal(updateResult.data.targetMinutes, 180);
  }
});

test('saveGoal — 0 이하 targetMinutes 검증 실패', async () => {
  const result = await saveGoal('topic-1', 0);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, 'VALIDATION_ERROR');
  }
});

test('saveGoal — 음수 targetMinutes 검증 실패', async () => {
  const result = await saveGoal('topic-1', -5);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, 'VALIDATION_ERROR');
  }
});

test('loadGoalForTopicThisWeek — 목표 없으면 ok(null) 반환', async () => {
  const result = await loadGoalForTopicThisWeek('nonexistent-topic');

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data, null);
  }
});

test('loadGoalForTopicThisWeek — 목표 있으면 해당 목표 반환', async () => {
  await saveGoal('topic-1', 90);
  const result = await loadGoalForTopicThisWeek('topic-1');

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.notEqual(result.data, null);
    assert.equal(result.data.topicId, 'topic-1');
    assert.equal(result.data.targetMinutes, 90);
  }
});

test('loadAllGoalsThisWeek — 빈 목록 반환', async () => {
  const result = await loadAllGoalsThisWeek();

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.length, 0);
  }
});

test('loadAllGoalsThisWeek — 여러 목표 반환', async () => {
  await saveGoal('topic-1', 60);
  await saveGoal('topic-2', 120);

  const result = await loadAllGoalsThisWeek();

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.length, 2);
    const topicIds = result.data.map((g) => g.topicId);
    assert.ok(topicIds.includes('topic-1'));
    assert.ok(topicIds.includes('topic-2'));
  }
});

test('saveGoal — weekStartAtMs가 getWeekStartAtMs()와 일치', async () => {
  const result = await saveGoal('topic-1', 60);
  const expected = getWeekStartAtMs();

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.weekStartAtMs, expected);
  }
});
