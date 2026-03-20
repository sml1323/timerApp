import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * statistics-repository 로직 테스트
 *
 * getTodayStudySummary, getWeeklyStudySummary, getStudyByTopic 의 핵심 로직을 검증한다:
 * - 학습(study) 세션만 집계, 휴식(break) 제외
 * - 완료(completed) 세션만 포함, interrupted/running 제외
 * - 날짜 범위 필터링
 * - 주제별 그룹 집계 (활성 주제만)
 * - plannedDurationSec 기반 분 변환 정확성
 *
 * in-memory 방식으로 SQL 집계 로직을 재현하여 테스트한다.
 */

import { getWeekStartAtMs, getTodayStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

// --- in-memory store & topics ---
let store = [];
let topics = [];

function resetStore() {
  store = [];
  topics = [
    { id: 'topic-1', name: '자료구조', isArchived: false },
    { id: 'topic-2', name: '알고리즘', isArchived: false },
    { id: 'topic-3', name: '운영체제', isArchived: true },
  ];
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

// --- 로직 재현 ---

async function getTodayStudySummary(todayStartMs) {
  const todayEndMs = todayStartMs + 24 * 60 * 60 * 1000;
  let totalSeconds = 0;
  let sessionCount = 0;

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= todayStartMs &&
      s.startedAtMs < todayEndMs
    ) {
      totalSeconds += s.plannedDurationSec;
      sessionCount++;
    }
  }

  return { ok: true, data: { totalMinutes: Math.round(totalSeconds / 60), sessionCount } };
}

async function getWeeklyStudySummary(weekStartAtMs) {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  let totalSeconds = 0;
  let sessionCount = 0;

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      totalSeconds += s.plannedDurationSec;
      sessionCount++;
    }
  }

  return { ok: true, data: { totalMinutes: Math.round(totalSeconds / 60), sessionCount } };
}

async function getStudyByTopic() {
  const topicNameMap = new Map();
  for (const t of topics) {
    if (!t.isArchived) {
      topicNameMap.set(t.id, t.name);
    }
  }

  const aggregates = new Map();
  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      topicNameMap.has(s.topicId)
    ) {
      const existing = aggregates.get(s.topicId) ?? { totalSeconds: 0, sessionCount: 0 };
      existing.totalSeconds += s.plannedDurationSec;
      existing.sessionCount++;
      aggregates.set(s.topicId, existing);
    }
  }

  const result = [...aggregates.entries()]
    .map(([topicId, agg]) => ({
      topicId,
      topicName: topicNameMap.get(topicId) ?? '',
      totalMinutes: Math.round(agg.totalSeconds / 60),
      sessionCount: agg.sessionCount,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  return { ok: true, data: result };
}

// --- 테스트 ---

beforeEach(() => {
  resetStore();
});

// ===== getTodayStudySummary =====

test('getTodayStudySummary — 오늘 study completed만 집계', async () => {
  const todayStart = getTodayStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: todayStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: todayStart + 2000 });

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 50); // (1500+1500)/60
  assert.equal(result.data.sessionCount, 2);
});

test('getTodayStudySummary — break 세션 제외', async () => {
  const todayStart = getTodayStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: todayStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'break', status: 'completed', plannedDurationSec: 300, startedAtMs: todayStart + 2000 });

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 25);
  assert.equal(result.data.sessionCount, 1);
});

test('getTodayStudySummary — interrupted/running 세션 제외', async () => {
  const todayStart = getTodayStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: todayStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'interrupted', plannedDurationSec: 1500, startedAtMs: todayStart + 2000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'running', plannedDurationSec: 1500, startedAtMs: todayStart + 3000 });

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 25);
  assert.equal(result.data.sessionCount, 1);
});

test('getTodayStudySummary — 세션 없을 때 0 반환', async () => {
  const todayStart = getTodayStartAtMs();

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 0);
  assert.equal(result.data.sessionCount, 0);
});

test('getTodayStudySummary — 어제 세션은 제외', async () => {
  const todayStart = getTodayStartAtMs();
  const yesterdayMs = todayStart - 3600 * 1000; // 어제

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: yesterdayMs });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: todayStart + 1000 });

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 25);
  assert.equal(result.data.sessionCount, 1);
});

// ===== getWeeklyStudySummary =====

test('getWeeklyStudySummary — 주간 study completed 집계', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 3000, startedAtMs: weekStart + 2000 });

  const result = await getWeeklyStudySummary(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 75); // (1500+3000)/60
  assert.equal(result.data.sessionCount, 2);
});

test('getWeeklyStudySummary — 주간 범위 밖 세션 제외', async () => {
  const weekStart = getWeekStartAtMs();
  const prevWeek = weekStart - 7 * 24 * 60 * 60 * 1000;
  const nextWeek = weekStart + 7 * 24 * 60 * 60 * 1000;

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: prevWeek + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: nextWeek + 1000 });

  const result = await getWeeklyStudySummary(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 25);
  assert.equal(result.data.sessionCount, 1);
});

test('getWeeklyStudySummary — study만, completed만', async () => {
  const weekStart = getWeekStartAtMs();

  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: weekStart + 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'break', status: 'completed', plannedDurationSec: 300, startedAtMs: weekStart + 2000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'interrupted', plannedDurationSec: 1500, startedAtMs: weekStart + 3000 });

  const result = await getWeeklyStudySummary(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 25);
  assert.equal(result.data.sessionCount, 1);
});

test('getWeeklyStudySummary — 세션 없을 때 0 반환', async () => {
  const weekStart = getWeekStartAtMs();

  const result = await getWeeklyStudySummary(weekStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 0);
  assert.equal(result.data.sessionCount, 0);
});

// ===== getStudyByTopic =====

test('getStudyByTopic — 주제별 그룹핑 및 누적', async () => {
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 2000 });
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 3000, startedAtMs: 3000 });

  const result = await getStudyByTopic();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 2);

  const topic1 = result.data.find((t) => t.topicId === 'topic-1');
  const topic2 = result.data.find((t) => t.topicId === 'topic-2');

  assert.equal(topic1.topicName, '자료구조');
  assert.equal(topic1.totalMinutes, 50); // (1500+1500)/60
  assert.equal(topic1.sessionCount, 2);

  assert.equal(topic2.topicName, '알고리즘');
  assert.equal(topic2.totalMinutes, 50); // 3000/60
  assert.equal(topic2.sessionCount, 1);
});

test('getStudyByTopic — 아카이브 주제 제외', async () => {
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 1000 });
  addSession({ topicId: 'topic-3', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 2000 }); // 아카이브 주제

  const result = await getStudyByTopic();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].topicId, 'topic-1');
});

test('getStudyByTopic — break 제외, interrupted 제외', async () => {
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 1000 });
  addSession({ topicId: 'topic-1', phaseType: 'break', status: 'completed', plannedDurationSec: 300, startedAtMs: 2000 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'interrupted', plannedDurationSec: 1500, startedAtMs: 3000 });

  const result = await getStudyByTopic();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].totalMinutes, 25);
  assert.equal(result.data[0].sessionCount, 1);
});

test('getStudyByTopic — 세션 없으면 빈 배열 반환', async () => {
  const result = await getStudyByTopic();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 0);
});

test('getStudyByTopic — 결과가 totalMinutes 내림차순 정렬', async () => {
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500, startedAtMs: 1000 });
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 3000, startedAtMs: 2000 });

  const result = await getStudyByTopic();

  assert.equal(result.ok, true);
  assert.equal(result.data[0].topicId, 'topic-2'); // 50분 > 25분
  assert.equal(result.data[1].topicId, 'topic-1');
});

test('getTodayStudySummary — plannedDurationSec 기반 분 변환 반올림', async () => {
  const todayStart = getTodayStartAtMs();

  // 1530초 = 25.5분 → 반올림 → 26분
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1530, startedAtMs: todayStart + 1000 });

  const result = await getTodayStudySummary(todayStart);

  assert.equal(result.ok, true);
  assert.equal(result.data.totalMinutes, 26);
});