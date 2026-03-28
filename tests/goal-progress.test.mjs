import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * goal-progress 로직 테스트
 *
 * loadGoalProgressThisWeek 의 핵심 로직을 검증한다:
 * - 진행률 계산 (actual/target)
 * - 0분 / 100% / 초과 달성 경계값
 * - remainingMinutes 계산
 * - 목표 없는 주제 제외
 *
 * 테스트 환경에서의 import chain 이슈를 피하기 위해
 * 순수 JS로 서비스 로직을 재현한다.
 */

import { getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

// --- in-memory stores ---
let goalStore = [];
let sessionStore = [];
let topicStore = [];

function resetStores() {
  goalStore = [];
  sessionStore = [];
  topicStore = [];
}

function addGoal({ topicId, targetMinutes }) {
  const weekStartAtMs = getWeekStartAtMs();
  const goal = { id: crypto.randomUUID(), topicId, weekStartAtMs, targetMinutes, createdAtMs: Date.now(), updatedAtMs: Date.now() };
  goalStore.push(goal);
  return goal;
}

function addTopic(id, name) {
  topicStore.push({ id, name, status: 'active', createdAtMs: Date.now(), updatedAtMs: Date.now() });
}

function addSession({ topicId, phaseType, status, plannedDurationSec, actualDurationSec = plannedDurationSec }) {
  const weekStart = getWeekStartAtMs();
  sessionStore.push({
    id: crypto.randomUUID(),
    topicId,
    phaseType,
    status,
    plannedDurationSec,
    startedAtMs: weekStart + 1000,
    endedAtMs: status === 'running' ? null : weekStart + 1000 + actualDurationSec * 1000,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  });
}

// --- 로직 재현 ---

async function findAllByWeek(weekStartAtMs) {
  return { ok: true, data: goalStore.filter((g) => g.weekStartAtMs === weekStartAtMs) };
}

async function getWeeklyStudyMinutesByTopic(weekStartAtMs) {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  const secondsByTopic = new Map();

  for (const s of sessionStore) {
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

async function findAllTopics() {
  return { ok: true, data: topicStore };
}

async function loadGoalProgressThisWeek() {
  const weekStartAtMs = getWeekStartAtMs();

  const goalsResult = await findAllByWeek(weekStartAtMs);
  if (!goalsResult.ok) return goalsResult;

  const goals = goalsResult.data;
  if (goals.length === 0) return { ok: true, data: [] };

  const studyResult = await getWeeklyStudyMinutesByTopic(weekStartAtMs);
  if (!studyResult.ok) return studyResult;

  const studyMap = studyResult.data;

  const topicsResult = await findAllTopics();
  if (!topicsResult.ok) return topicsResult;

  const topicNameMap = new Map();
  for (const topic of topicsResult.data) {
    topicNameMap.set(topic.id, topic.name);
  }

  const progressList = goals.map((goal) => {
    const actualMinutes = studyMap.get(goal.topicId) ?? 0;
    const targetMinutes = goal.targetMinutes;
    const remainingMinutes = Math.max(0, targetMinutes - actualMinutes);
    const progressPercent = targetMinutes > 0
      ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100))
      : 0;

    return {
      topicId: goal.topicId,
      topicName: topicNameMap.get(goal.topicId) ?? '',
      targetMinutes,
      actualMinutes,
      remainingMinutes,
      progressPercent,
      isAchieved: actualMinutes >= targetMinutes,
    };
  });

  return { ok: true, data: progressList };
}

// --- 테스트 ---

beforeEach(() => {
  resetStores();
});

test('loadGoalProgressThisWeek — 목표 없으면 빈 배열 반환', async () => {
  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 0);
});

test('loadGoalProgressThisWeek — 0분 학습 시 progressPercent=0, remainingMinutes=target', async () => {
  addTopic('topic-1', '수학');
  addGoal({ topicId: 'topic-1', targetMinutes: 120 });

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);

  const progress = result.data[0];
  assert.equal(progress.topicId, 'topic-1');
  assert.equal(progress.topicName, '수학');
  assert.equal(progress.targetMinutes, 120);
  assert.equal(progress.actualMinutes, 0);
  assert.equal(progress.remainingMinutes, 120);
  assert.equal(progress.progressPercent, 0);
  assert.equal(progress.isAchieved, false);
});

test('loadGoalProgressThisWeek — 부분 달성 시 진행률 계산', async () => {
  addTopic('topic-1', '영어');
  addGoal({ topicId: 'topic-1', targetMinutes: 100 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 3600 }); // 60분

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  const progress = result.data[0];
  assert.equal(progress.actualMinutes, 60);
  assert.equal(progress.remainingMinutes, 40);
  assert.equal(progress.progressPercent, 60);
  assert.equal(progress.isAchieved, false);
});

test('loadGoalProgressThisWeek — 100% 달성 시 isAchieved=true', async () => {
  addTopic('topic-1', '과학');
  addGoal({ topicId: 'topic-1', targetMinutes: 25 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 1500 }); // 25분

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  const progress = result.data[0];
  assert.equal(progress.actualMinutes, 25);
  assert.equal(progress.remainingMinutes, 0);
  assert.equal(progress.progressPercent, 100);
  assert.equal(progress.isAchieved, true);
});

test('loadGoalProgressThisWeek — 초과 달성 시 progressPercent=100, isAchieved=true, remainingMinutes=0', async () => {
  addTopic('topic-1', '국어');
  addGoal({ topicId: 'topic-1', targetMinutes: 25 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 3000 }); // 50분

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  const progress = result.data[0];
  assert.equal(progress.actualMinutes, 50);
  assert.equal(progress.remainingMinutes, 0);
  assert.equal(progress.progressPercent, 100); // min(100, ...)
  assert.equal(progress.isAchieved, true);
});

test('loadGoalProgressThisWeek — 목표 없는 주제의 세션은 결과에 포함 안됨', async () => {
  addTopic('topic-1', '수학');
  addTopic('topic-2', '영어');
  addGoal({ topicId: 'topic-1', targetMinutes: 60 });
  // topic-2에는 목표 없음, 세션만 있음
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 1500 });

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].topicId, 'topic-1');
});

test('loadGoalProgressThisWeek — 여러 주제의 진행 상태 동시 계산', async () => {
  addTopic('topic-1', '수학');
  addTopic('topic-2', '영어');
  addGoal({ topicId: 'topic-1', targetMinutes: 60 });
  addGoal({ topicId: 'topic-2', targetMinutes: 120 });
  addSession({ topicId: 'topic-1', phaseType: 'study', status: 'completed', plannedDurationSec: 3600 }); // 60분
  addSession({ topicId: 'topic-2', phaseType: 'study', status: 'completed', plannedDurationSec: 3600 }); // 60분

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 2);

  const p1 = result.data.find((p) => p.topicId === 'topic-1');
  const p2 = result.data.find((p) => p.topicId === 'topic-2');

  assert.equal(p1.isAchieved, true);  // 60/60
  assert.equal(p2.isAchieved, false); // 60/120
  assert.equal(p2.progressPercent, 50);
  assert.equal(p2.remainingMinutes, 60);
});

test('loadGoalProgressThisWeek — 바로 중단한 세션은 목표 진행 시간을 거의 올리지 않는다', async () => {
  addTopic('topic-1', '물리');
  addGoal({ topicId: 'topic-1', targetMinutes: 25 });
  addSession({
    topicId: 'topic-1',
    phaseType: 'study',
    status: 'interrupted',
    plannedDurationSec: 1500,
    actualDurationSec: 0,
  });

  const result = await loadGoalProgressThisWeek();

  assert.equal(result.ok, true);
  const progress = result.data[0];
  assert.equal(progress.actualMinutes, 0);
  assert.equal(progress.remainingMinutes, 25);
  assert.equal(progress.progressPercent, 0);
  assert.equal(progress.isAchieved, false);
});
