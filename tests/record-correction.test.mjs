/**
 * record-correction.test.mjs
 * Story 6.1 — reassignSessionTopic 도메인 로직 테스트
 *
 * 프로젝트의 기존 테스트 패턴(session-statistics.test.mjs)을 따라
 * in-memory 저장소로 순수 JS 재현하여 테스트한다.
 */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// --- in-memory session store 재현 ---
let store = [];

const knownTopicIds = new Set(['topic-1', 'topic-2', 'topic-3']);

function resetStore() {
  store = [];
}

function addCompletedSession({ topicId, plannedDurationSec = 1500, startedAtMs = Date.now() }) {
  const session = {
    id: crypto.randomUUID(),
    topicId,
    phaseType: 'study',
    status: 'completed',
    startedAtMs,
    plannedDurationSec,
    endedAtMs: startedAtMs + plannedDurationSec * 1000,
    createdAtMs: startedAtMs,
    updatedAtMs: startedAtMs,
  };
  store.push(session);
  return session;
}

function addRunningSession({ topicId, plannedDurationSec = 1500, startedAtMs = Date.now() }) {
  const session = {
    id: crypto.randomUUID(),
    topicId,
    phaseType: 'study',
    status: 'running',
    startedAtMs,
    plannedDurationSec,
    endedAtMs: null,
    createdAtMs: startedAtMs,
    updatedAtMs: startedAtMs,
  };
  store.push(session);
  return session;
}

// --- reassignSessionTopic 로직 재현 (in-memory-session-adapter와 동일) ---
async function reassignSessionTopic({ sessionId, newTopicId }) {
  // 입력 검증
  if (!sessionId || typeof sessionId !== 'string') {
    return { ok: false, code: 'VALIDATION_ERROR', message: '세션 ID가 필요합니다' };
  }
  if (!newTopicId || typeof newTopicId !== 'string') {
    return { ok: false, code: 'VALIDATION_ERROR', message: '주제 ID가 필요합니다' };
  }

  // 세션 존재 확인
  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { ok: false, code: 'NOT_FOUND', message: '세션을 찾을 수 없습니다' };
  }

  const session = store[index];

  // 상태 확인: completed/interrupted만 허용
  if (session.status !== 'completed' && session.status !== 'interrupted') {
    return { ok: false, code: 'SESSION_STATE_CONFLICT', message: '완료되거나 중단된 세션만 주제를 변경할 수 있습니다' };
  }

  // 새 주제 존재 확인
  if (!knownTopicIds.has(newTopicId)) {
    return { ok: false, code: 'NOT_FOUND', message: '주제를 찾을 수 없습니다' };
  }

  // UPDATE
  const now = Date.now();
  const updated = { ...session, topicId: newTopicId, updatedAtMs: now };
  store[index] = updated;
  return { ok: true, data: updated };
}

// --- 테스트 ---

beforeEach(() => {
  resetStore();
});

// 7.2: 정상 주제 변경
test('reassignSessionTopic — 정상 주제 변경', async () => {
  const session = addCompletedSession({ topicId: 'topic-1' });

  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-2',
  });

  assert.ok(result.ok, '주제 변경이 성공해야 한다');
  assert.equal(result.data.topicId, 'topic-2', '변경된 topicId가 topic-2여야 한다');
  assert.equal(result.data.id, session.id, '세션 ID가 동일해야 한다');
  assert.ok(result.data.updatedAtMs >= session.updatedAtMs, 'updatedAtMs가 갱신되어야 한다');
});

// 7.3: 존재하지 않는 세션 ID → NOT_FOUND
test('reassignSessionTopic — 존재하지 않는 세션 ID → NOT_FOUND', async () => {
  const result = await reassignSessionTopic({
    sessionId: 'non-existent-session',
    newTopicId: 'topic-1',
  });

  assert.ok(!result.ok, '실패해야 한다');
  assert.equal(result.code, 'NOT_FOUND', 'NOT_FOUND 에러여야 한다');
});

// 7.4: 존재하지 않는 주제 ID → NOT_FOUND
test('reassignSessionTopic — 존재하지 않는 주제 ID → NOT_FOUND', async () => {
  const session = addCompletedSession({ topicId: 'topic-1' });

  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'non-existent-topic',
  });

  assert.ok(!result.ok, '실패해야 한다');
  assert.equal(result.code, 'NOT_FOUND', 'NOT_FOUND 에러여야 한다');
});

// 7.5: running 상태 세션 → SESSION_STATE_CONFLICT
test('reassignSessionTopic — running 상태 세션 → SESSION_STATE_CONFLICT', async () => {
  const session = addRunningSession({ topicId: 'topic-1' });

  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-2',
  });

  assert.ok(!result.ok, '실패해야 한다');
  assert.equal(result.code, 'SESSION_STATE_CONFLICT', 'SESSION_STATE_CONFLICT 에러여야 한다');
});

// 7.6: 동일 주제로 변경 시도 → 성공 (idempotent)
test('reassignSessionTopic — 동일 주제로 변경 → 성공 (idempotent)', async () => {
  const session = addCompletedSession({ topicId: 'topic-1' });

  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-1', // 같은 주제
  });

  assert.ok(result.ok, '동일 주제 변경이 성공해야 한다');
  assert.equal(result.data.topicId, 'topic-1', '동일 topicId 유지');
});

// 추가: interrupted 상태 세션 → 정상 변경
test('reassignSessionTopic — interrupted 상태 세션 → 정상 변경', async () => {
  const session = addCompletedSession({ topicId: 'topic-1' });
  // 상태를 interrupted로 변경
  store[store.length - 1] = { ...session, status: 'interrupted' };

  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-3',
  });

  assert.ok(result.ok, 'interrupted 세션 주제 변경이 성공해야 한다');
  assert.equal(result.data.topicId, 'topic-3', '변경된 topicId가 topic-3여야 한다');
});
