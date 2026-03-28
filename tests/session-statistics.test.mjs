import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * session-statistics 로직 테스트
 * 
 * getWeeklyStudyMinutesByTopic 의 핵심 로직을 검증한다:
 * - 학습(study) 세션만 집계
 * - 종료된(completed/interrupted) 세션만 포함
 * - 실제 소요 시간(endedAtMs - startedAtMs) 기준 집계
 * - 주간 범위 필터링
 * - 주제별 그룹 집계
 *
 * in-memory-session-adapter의 getWeeklyStudyMinutesByTopic을
 * 순수 JS로 재현하여 테스트한다.
 */

import { getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

// --- in-memory session store 재현 ---
let store = [];

function resetStore() {
  store = [];
}

function addSession({ topicId, phaseType, status, plannedDurationSec, startedAtMs, actualDurationSec = plannedDurationSec }) {
  store.push({
    id: crypto.randomUUID(),
    topicId,
    phaseType,
    status,
    plannedDurationSec,
    startedAtMs,
    endedAtMs: status === 'running' ? null : startedAtMs + actualDurationSec * 1000,
    createdAtMs: startedAtMs,
    updatedAtMs: startedAtMs,
  });
}

// --- getWeeklyStudyMinutesByTopic 로직 재현 ---
async function getWeeklyStudyMinutesByTopic(weekStartAtMs) {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  const secondsByTopic = new Map();

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      (s.status === 'completed' || s.status === 'interrupted') &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      const durationSec = s.endedAtMs !== null && s.endedAtMs >= s.startedAtMs
        ? Math.round((s.endedAtMs - s.startedAtMs) / 1000)
        : s.plannedDurationSec;
      secondsByTopic.set(s.topicId, (secondsByTopic.get(s.topicId) ?? 0) + durationSec);
    }
  }

  const map = new Map();
  for (const [topicId, totalSeconds] of secondsByTopic.entries()) {
    map.set(topicId, Math.round(totalSeconds / 60));
  }
  return { ok: true, data: map };
}

// --- 테스트 ---

beforeEach(() => {
  resetStore();
});

test('getWeeklyStudyMinutesByTopic — 학습 세션만 집계, 휴식(break) 제외', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'break', status: 'completed', plannedDurationSec: 300, startedAtMs: weekStart + 2000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 25); // 1500/60 = 25분, break 제외
});

test('getWeeklyStudyMinutesByTopic — 종료된 세션만 포함, running 제외', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'interrupted', plannedDurationSec: 1500, startedAtMs: weekStart + 2000, actualDurationSec: 300 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'running', plannedDurationSec: 1500, startedAtMs: weekStart + 3000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 30); // 25분 + 5분
});

test('getWeeklyStudyMinutesByTopic — 주간 범위 필터링 (범위 밖 세션 제외)', async () => {
  const weekStart = getWeekStartAtMs();
  const prevWeek = weekStart - 7 * 24 * 60 * 60 * 1000;
  const nextWeek = weekStart + 7 * 24 * 60 * 60 * 1000;

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: prevWeek + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: nextWeek + 1000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 25); // 이번 주 것만
});

test('getWeeklyStudyMinutesByTopic — 주제별 그룹 집계', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 2000 });
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 3000, startedAtMs: weekStart + 3000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 50); // 25 + 25
  assert.equal(result.data.get('topic-2'), 50); // 3000/60
});

test('getWeeklyStudyMinutesByTopic — 세션 없으면 빈 Map 반환', async () => {
  const weekStart = getWeekStartAtMs();

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.size, 0);
});

test('getWeeklyStudyMinutesByTopic — 실제 소요 시간이 계획 시간보다 짧으면 실제 시간만 반영', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({
    topicId: 'topic-1',
    phaseType: 'study',
    status: 'interrupted',
    plannedDurationSec: 1500,
    startedAtMs: weekStart + 1000,
    actualDurationSec: 0,
  });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 0);
});
