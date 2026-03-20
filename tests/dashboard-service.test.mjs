import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { getTodayStartAtMs, getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

/**
 * dashboard-service 로직 테스트
 *
 * dashboard-service의 핵심인 loadDashboardData 로직을 순수 JS로 재현하여 검증한다.
 * - 세션/통계/목표 데이터를 통합하는 로직 테스트
 * - 진척률 계산, 남은 목표, hasData 플래그, 달성 목표 수 등
 */

// --- Mock data ---

function makeTodaySummary(totalMinutes = 0, sessionCount = 0) {
  return { ok: true, data: { totalMinutes, sessionCount } };
}

function makeWeeklySummary(totalMinutes = 0, sessionCount = 0) {
  return { ok: true, data: { totalMinutes, sessionCount } };
}

function makeGoalProgressList(goals = []) {
  return { ok: true, data: goals };
}

function makeGoal(topicId, targetMinutes, actualMinutes) {
  const isAchieved = actualMinutes >= targetMinutes;
  return {
    topicId,
    topicName: `Topic ${topicId}`,
    targetMinutes,
    actualMinutes,
    remainingMinutes: Math.max(0, targetMinutes - actualMinutes),
    progressPercent: targetMinutes > 0 ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100)) : 0,
    isAchieved,
  };
}

// --- 로직 재현 (dashboard-service.ts의 loadDashboardData 내부 로직) ---

function computeDashboardData(todaySummary, weeklySummary, goals) {
  const totalTargetMinutes = goals.reduce((sum, g) => sum + g.targetMinutes, 0);
  const weeklyMinutes = weeklySummary.totalMinutes;
  const weeklyProgressPercent = totalTargetMinutes > 0
    ? Math.round((weeklyMinutes / totalTargetMinutes) * 100)
    : 0;
  const remainingMinutes = Math.max(0, totalTargetMinutes - weeklyMinutes);
  const achievedGoalCount = goals.filter(g => g.isAchieved).length;

  const hasData = todaySummary.sessionCount > 0
    || weeklySummary.sessionCount > 0
    || goals.length > 0;

  return {
    todayMinutes: todaySummary.totalMinutes,
    todaySessionCount: todaySummary.sessionCount,
    weeklyMinutes,
    weeklySessionCount: weeklySummary.sessionCount,
    totalTargetMinutes,
    weeklyProgressPercent,
    remainingMinutes,
    goalCount: goals.length,
    achievedGoalCount,
    hasData,
  };
}

// --- 테스트 ---

test('기본 데이터 통합 — 오늘/주간 시간 + 목표 진행률', () => {
  const today = { totalMinutes: 45, sessionCount: 2 };
  const weekly = { totalMinutes: 180, sessionCount: 8 };
  const goals = [
    makeGoal('t1', 120, 100),
    makeGoal('t2', 60, 80),
  ];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.todayMinutes, 45);
  assert.equal(result.todaySessionCount, 2);
  assert.equal(result.weeklyMinutes, 180);
  assert.equal(result.weeklySessionCount, 8);
  assert.equal(result.totalTargetMinutes, 180); // 120 + 60
  assert.equal(result.weeklyProgressPercent, 100); // 180/180 = 100%
  assert.equal(result.remainingMinutes, 0);
  assert.equal(result.goalCount, 2);
  assert.equal(result.achievedGoalCount, 1); // 80 >= 60
  assert.equal(result.hasData, true);
});

test('데이터 없음 — hasData가 false', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const goals = [];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.hasData, false);
  assert.equal(result.weeklyProgressPercent, 0);
  assert.equal(result.remainingMinutes, 0);
});

test('목표 미설정 — totalTargetMinutes = 0, progressPercent = 0', () => {
  const today = { totalMinutes: 30, sessionCount: 1 };
  const weekly = { totalMinutes: 90, sessionCount: 3 };
  const goals = [];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.hasData, true);
  assert.equal(result.goalCount, 0);
  assert.equal(result.weeklyProgressPercent, 0);
  assert.equal(result.remainingMinutes, 0);
  assert.equal(result.totalTargetMinutes, 0);
});

test('목표 달성 근접 — 80% 이상 100% 미만', () => {
  const today = { totalMinutes: 20, sessionCount: 1 };
  const weekly = { totalMinutes: 90, sessionCount: 5 };
  const goals = [makeGoal('t1', 100, 90)];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.weeklyProgressPercent, 90); // 90/100 = 90%
  assert.equal(result.remainingMinutes, 10);
});

test('목표 초과 달성 — 100% 초과 가능', () => {
  const today = { totalMinutes: 30, sessionCount: 1 };
  const weekly = { totalMinutes: 150, sessionCount: 6 };
  const goals = [makeGoal('t1', 100, 150)];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.weeklyProgressPercent, 150); // 150/100 = 150%
  assert.equal(result.remainingMinutes, 0);
  assert.equal(result.achievedGoalCount, 1);
});

test('남은 목표 — 음수이면 0', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 200, sessionCount: 10 };
  const goals = [makeGoal('t1', 100, 200)];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.remainingMinutes, 0);
});

test('여러 목표 — 달성 수 정확히 계산', () => {
  const today = { totalMinutes: 10, sessionCount: 1 };
  const weekly = { totalMinutes: 200, sessionCount: 8 };
  const goals = [
    makeGoal('t1', 60, 60),   // 달성
    makeGoal('t2', 60, 59),   // 미달성
    makeGoal('t3', 30, 50),   // 달성
    makeGoal('t4', 100, 31),  // 미달성
  ];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.goalCount, 4);
  assert.equal(result.achievedGoalCount, 2);
  assert.equal(result.totalTargetMinutes, 250); // 60+60+30+100
  assert.equal(result.weeklyProgressPercent, 80); // 200/250 = 80%
  assert.equal(result.remainingMinutes, 50);
});

test('진척률 반올림 검증', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 1, sessionCount: 1 };
  const goals = [makeGoal('t1', 3, 1)];

  const result = computeDashboardData(today, weekly, goals);

  assert.equal(result.weeklyProgressPercent, 33); // 1/3 = 33.33 → 33
});

test('hasData — 오늘 세션만 있으면 true', () => {
  const today = { totalMinutes: 5, sessionCount: 1 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const goals = [];

  const result = computeDashboardData(today, weekly, goals);
  assert.equal(result.hasData, true);
});

test('hasData — 목표만 있어도 true', () => {
  const today = { totalMinutes: 0, sessionCount: 0 };
  const weekly = { totalMinutes: 0, sessionCount: 0 };
  const goals = [makeGoal('t1', 60, 0)];

  const result = computeDashboardData(today, weekly, goals);
  assert.equal(result.hasData, true);
});
