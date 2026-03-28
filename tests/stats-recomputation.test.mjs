/**
 * stats-recomputation.test.mjs
 * Story 6.2 — 기록 수정 후 통계 재계산 검증
 *
 * reassignSessionTopic 후 통계 쿼리가 올바르게 재계산되는지 검증한다.
 * in-memory adapter들을 임포트하여 실제 애플리케이션 코드를 테스트한다.
 */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { getTodayStartAtMs, getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';
import { createSession, completeSession, reassignSessionTopic, getSessionStore, setTopicExistsCheck } from '../.test-dist/src/platform/browser/in-memory-session-adapter.js';
import { getTodayStudySummary, getWeeklyStudySummary, getStudyByTopic } from '../.test-dist/src/platform/browser/in-memory-statistics-adapter.js';
import { createTopic, getTopicStore } from '../.test-dist/src/platform/browser/in-memory-topic-adapter.js';

// --- 테스트용 유틸리티 ---

function resetStores() {
  getSessionStore().length = 0;
  getTopicStore().length = 0;
  setTopicExistsCheck(() => true); // In-memory session adapter에서 주제 검증 무시용 (기본값 복원)
}

async function setupTopic(id, name) {
  // in-memory-topic-adapter의 createTopic은 id를 자동 생성하므로 스토어에 직접 삽입
  const topic = {
    id,
    name,
    color: '#000000',
    isArchived: 0,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now()
  };
  getTopicStore().push(topic);
  return topic;
}

async function addCompletedSession({
  topicId,
  plannedDurationSec = 1500,
  startedAtMs = Date.now(),
  actualDurationSec = plannedDurationSec,
}) {
  // createSession -> completeSession 흐름으로 테스트
  const createResult = await createSession({
    topicId,
    phaseType: 'study',
    plannedDurationSec
  });
  assert.ok(createResult.ok);
  
  const session = createResult.data;
  // 시간 조작 (실제 startedAtMs 세팅)
  session.startedAtMs = startedAtMs;
  
  const completeResult = await completeSession({ sessionId: session.id });
  assert.ok(completeResult.ok);

  const completedSession = completeResult.data;
  completedSession.startedAtMs = startedAtMs;
  completedSession.endedAtMs = startedAtMs + actualDurationSec * 1000;
  completedSession.updatedAtMs = completedSession.endedAtMs;
  return completedSession;
}

// --- 테스트 ---

beforeEach(() => {
  resetStores();
  // Session 생성 시 주제가 존재하는지 확인하는 로직을 in-memory-topic-adapter 스토어를 바라보게 설정
  setTopicExistsCheck((id) => getTopicStore().some(t => t.id === id));
});

test('주제 변경 후 getTodayStudySummary — 총 학습 시간 불변', async () => {
  await setupTopic('topic-A', 'Topic A');
  await setupTopic('topic-B', 'Topic B');

  const todayStart = getTodayStartAtMs();
  const sessionTime = todayStart + 1000;

  const session = await addCompletedSession({
    topicId: 'topic-A',
    plannedDurationSec: 1500,
    startedAtMs: sessionTime,
  });

  // 변경 전 통계
  const beforeStats = (await getTodayStudySummary(todayStart)).data;
  assert.equal(beforeStats.totalMinutes, 25);
  assert.equal(beforeStats.sessionCount, 1);

  // topic A → topic B 변경
  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-B',
  });
  assert.ok(result.ok);

  // 변경 후 통계 — 총 학습 시간은 동일해야 함
  const afterStats = (await getTodayStudySummary(todayStart)).data;
  assert.equal(afterStats.totalMinutes, 25, '총 학습 시간은 변동 없어야 한다');
  assert.equal(afterStats.sessionCount, 1, '세션 수도 변동 없어야 한다');
});

test('주제 변경 후 getStudyByTopic — topic A 감소, topic B 증가', async () => {
  await setupTopic('topic-A', 'Topic A');
  await setupTopic('topic-B', 'Topic B');

  const todayStart = getTodayStartAtMs();

  const session = await addCompletedSession({
    topicId: 'topic-A',
    plannedDurationSec: 1500,
    startedAtMs: todayStart + 1000,
  });

  // 변경 전: topic A에 25분
  const beforeByTopic = (await getStudyByTopic()).data;
  const topicABefore = beforeByTopic.find((t) => t.topicId === 'topic-A');
  const topicBBefore = beforeByTopic.find((t) => t.topicId === 'topic-B');
  assert.equal(topicABefore?.totalMinutes, 25);
  assert.equal(topicBBefore, undefined, 'topic B에는 기록이 없어야 한다');

  // topic A → topic B 변경
  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-B',
  });
  assert.ok(result.ok);

  // 변경 후: topic A 감소, topic B 증가
  const afterByTopic = (await getStudyByTopic()).data;
  const topicAAfter = afterByTopic.find((t) => t.topicId === 'topic-A');
  const topicBAfter = afterByTopic.find((t) => t.topicId === 'topic-B');
  assert.equal(topicAAfter, undefined, 'topic A에서 기록이 사라져야 한다');
  assert.equal(topicBAfter?.totalMinutes, 25, 'topic B에 25분이 이동해야 한다');
});

test('주제 변경 후 주간 통계도 동일하게 재계산', async () => {
  await setupTopic('topic-A', 'Topic A');
  await setupTopic('topic-C', 'Topic C');

  const weekStart = getWeekStartAtMs();

  const session = await addCompletedSession({
    topicId: 'topic-A',
    plannedDurationSec: 3000, // 50분
    startedAtMs: weekStart + 1000,
  });

  // 변경 전 주간 통계
  const beforeWeekly = (await getWeeklyStudySummary(weekStart)).data;
  assert.equal(beforeWeekly.totalMinutes, 50);
  assert.equal(beforeWeekly.sessionCount, 1);

  // topic A → topic C 변경
  const result = await reassignSessionTopic({
    sessionId: session.id,
    newTopicId: 'topic-C',
  });
  assert.ok(result.ok);

  // 변경 후 주간 통계 — 총 시간 불변
  const afterWeekly = (await getWeeklyStudySummary(weekStart)).data;
  assert.equal(afterWeekly.totalMinutes, 50, '주간 총 학습 시간은 변동 없어야 한다');
  assert.equal(afterWeekly.sessionCount, 1, '주간 세션 수도 변동 없어야 한다');

  // 주제별 확인
  const afterByTopic = (await getStudyByTopic()).data;
  const topicA = afterByTopic.find((t) => t.topicId === 'topic-A');
  const topicC = afterByTopic.find((t) => t.topicId === 'topic-C');
  assert.equal(topicA, undefined, 'topic A에서 기록이 사라져야 한다');
  assert.equal(topicC?.totalMinutes, 50, 'topic C에 50분이 이동해야 한다');
});

test('여러 세션 중 하나만 변경 — 나머지 세션 통계 유지', async () => {
  await setupTopic('topic-A', 'Topic A');
  await setupTopic('topic-B', 'Topic B');

  const todayStart = getTodayStartAtMs();

  // topic A에 세션 2개 추가
  const session1 = await addCompletedSession({
    topicId: 'topic-A',
    plannedDurationSec: 1500, // 25분
    startedAtMs: todayStart + 1000,
  });
  await addCompletedSession({
    topicId: 'topic-A',
    plannedDurationSec: 1500, // 25분
    startedAtMs: todayStart + 100000,
  });

  // 변경 전: topic A에 50분
  const beforeByTopic = (await getStudyByTopic()).data;
  assert.equal(beforeByTopic.find((t) => t.topicId === 'topic-A')?.totalMinutes, 50);

  // session1만 topic B로 변경
  const result = await reassignSessionTopic({
    sessionId: session1.id,
    newTopicId: 'topic-B',
  });
  assert.ok(result.ok);

  // 변경 후: topic A에 25분, topic B에 25분
  const afterByTopic = (await getStudyByTopic()).data;
  assert.equal(afterByTopic.find((t) => t.topicId === 'topic-A')?.totalMinutes, 25, 'topic A에 25분 남아야 한다');
  assert.equal(afterByTopic.find((t) => t.topicId === 'topic-B')?.totalMinutes, 25, 'topic B에 25분 이동해야 한다');

  // 총 시간 불변
  const totalStats = (await getTodayStudySummary(todayStart)).data;
  assert.equal(totalStats.totalMinutes, 50, '총 학습 시간은 50분으로 유지');
  assert.equal(totalStats.sessionCount, 2, '세션 수는 2로 유지');
});
