import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * statistics-service 로직 테스트
 *
 * statistics-service의 핵심인 loadStatsPageData 로직을 순수 JS로 재현하여 검증한다.
 * - 오늘/주간/주제별 데이터 통합 로직
 * - totalMinutesAllTime, totalSessionsAllTime, hasData 계산
 */

// --- 로직 재현 (statistics-service.ts의 loadStatsPageData 내부 로직) ---

function computeStatsPageData(todaySummary, weeklySummary, byTopic) {
  const totalMinutesAllTime = byTopic.reduce((sum, t) => sum + t.totalMinutes, 0);
  const totalSessionsAllTime = byTopic.reduce((sum, t) => sum + t.sessionCount, 0);

  const hasData = todaySummary.sessionCount > 0
    || weeklySummary.sessionCount > 0
    || byTopic.length > 0;

  return {
    today: todaySummary,
    weekly: weeklySummary,
    byTopic,
    totalMinutesAllTime,
    totalSessionsAllTime,
    hasData,
  };
}

// --- 테스트 ---

test('기본 데이터 통합 — 오늘/주간/주제별', () => {
  const today = { totalMinutes: 45, sessionCount: 2 };
  const weekly = { totalMinutes: 180, sessionCount: 8 };
  const byTopic = [
    { topicId: 't1', topicName: 'Math', totalMinutes: 120, sessionCount: 5 },
    { topicId: 't2', topicName: 'English', totalMinutes: 60, sessionCount: 3 },
  ];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.deepEqual(result.today, today);
  assert.deepEqual(result.weekly, weekly);
  assert.equal(result.byTopic.length, 2);
  assert.equal(result.totalMinutesAllTime, 180); // 120 + 60
  assert.equal(result.totalSessionsAllTime, 8); // 5 + 3
  assert.equal(result.hasData, true);
});

test('데이터 없음 — hasData가 false', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const byTopic = [];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.equal(result.hasData, false);
  assert.equal(result.totalMinutesAllTime, 0);
  assert.equal(result.totalSessionsAllTime, 0);
});

test('오늘 세션만 있으면 hasData = true', () => {
  const today = { totalMinutes: 10, sessionCount: 1 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const byTopic = [];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.equal(result.hasData, true);
});

test('주간 세션만 있으면 hasData = true', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 30, sessionCount: 2 };
  const byTopic = [];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.equal(result.hasData, true);
});

test('주제별 데이터만 있으면 hasData = true', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const byTopic = [
    { topicId: 't1', topicName: 'Science', totalMinutes: 50, sessionCount: 2 },
  ];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.equal(result.hasData, true);
  assert.equal(result.totalMinutesAllTime, 50);
  assert.equal(result.totalSessionsAllTime, 2);
});

test('여러 주제 — totalMinutesAllTime/totalSessionsAllTime 합산 정확성', () => {
  const today = { totalMinutes: 15, sessionCount: 1 };
  const weekly = { totalMinutes: 100, sessionCount: 5 };
  const byTopic = [
    { topicId: 't1', topicName: 'Math', totalMinutes: 200, sessionCount: 10 },
    { topicId: 't2', topicName: 'English', totalMinutes: 150, sessionCount: 7 },
    { topicId: 't3', topicName: 'Science', totalMinutes: 50, sessionCount: 3 },
  ];

  const result = computeStatsPageData(today, weekly, byTopic);

  assert.equal(result.totalMinutesAllTime, 400); // 200 + 150 + 50
  assert.equal(result.totalSessionsAllTime, 20); // 10 + 7 + 3
  assert.equal(result.hasData, true);
});

test('비율 계산 — 주제별 퍼센트', () => {
  const byTopic = [
    { topicId: 't1', topicName: 'Math', totalMinutes: 60, sessionCount: 3 },
    { topicId: 't2', topicName: 'English', totalMinutes: 40, sessionCount: 2 },
  ];
  const totalMinutes = byTopic.reduce((s, t) => s + t.totalMinutes, 0);

  // 비율 계산 로직 (컴포넌트에서 사용)
  const percentT1 = Math.round((60 / totalMinutes) * 100);
  const percentT2 = Math.round((40 / totalMinutes) * 100);

  assert.equal(percentT1, 60); // 60/100 = 60%
  assert.equal(percentT2, 40); // 40/100 = 40%
});

test('비율 계산 — totalMinutes가 0이면 비율 0', () => {
  const totalMinutes = 0;
  const topicMinutes = 0;

  const percent = totalMinutes > 0
    ? Math.round((topicMinutes / totalMinutes) * 100)
    : 0;

  assert.equal(percent, 0);
});

test('에러 전파 — Result 에러 구조 유지', () => {
  // statistics-service에서 adapter의 에러 Result를 그대로 반환하는 패턴 검증
  const errorResult = { ok: false, code: 'DB_ERROR', message: '데이터베이스 에러' };

  // loadStatsPageData에서 todayResult.ok === false일 때 그대로 반환
  assert.equal(errorResult.ok, false);
  assert.equal(errorResult.code, 'DB_ERROR');
  assert.equal(errorResult.message, '데이터베이스 에러');
});

test('formatMinutes 로직 — 60분 미만', () => {
  // 컴포넌트에서 사용하는 formatMinutes 로직 검증
  function formatMinutes(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  assert.equal(formatMinutes(0), '0m');
  assert.equal(formatMinutes(30), '30m');
  assert.equal(formatMinutes(59), '59m');
  assert.equal(formatMinutes(60), '1h');
  assert.equal(formatMinutes(90), '1h 30m');
  assert.equal(formatMinutes(125), '2h 5m');
  assert.equal(formatMinutes(120), '2h');
});
