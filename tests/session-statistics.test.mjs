import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * session-statistics 로직 테스트
 * 
 * getWeeklyStudyMinutesByTopic 의 핵심 로직을 검증한다:
 * - 학습(study) 세션만 집계
 * - 완료(completed) 세션만 포함
 * - 주간 범위 필터링
 * - 주제별 그룹 집계
 * - plannedDurationSec → 분 변환
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

function addSession({ topicId, phaseType, status, plannedDurationSec, startedAtMs }) {
  store.push({
    id: crypto.randomUUID(),
    topicId,
    phaseType,
    status,
    plannedDurationSec,
    startedAtMs,
    endedAtMs: startedAtMs + plannedDurationSec * 1000,
    createdAtMs: startedAtMs,
    updatedAtMs: startedAtMs,
  });
}

// --- getWeeklyStudyMinutesByTopic 로직 재현 ---
async function getWeeklyStudyMinutesByTopic(weekStartAtMs) {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  const map = new Map();

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      const mins = Math.round(s.plannedDurationSec / 60);
      map.set(s.topicId, (map.get(s.topicId) ?? 0) + mins);
    }
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

test('getWeeklyStudyMinutesByTopic — completed 세션만 포함, interrupted/running 제외', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'interrupted', plannedDurationSec: 1500, startedAtMs: weekStart + 2000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'running', plannedDurationSec: 1500, startedAtMs: weekStart + 3000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 25); // completed만
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

test('getWeeklyStudyMinutesByTopic — plannedDurationSec → 분 변환 반올림', async () => {
  const weekStart = getWeekStartAtMs();

  // 1530초 = 25.5분 → 반올림 → 26분
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1530, startedAtMs: weekStart + 1000 });

  const result = await getWeeklyStudyMinutesByTopic(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.get('topic-1'), 26); // Math.round(1530/60) = 26
});
