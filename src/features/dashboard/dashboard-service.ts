import { getTodayStudySummary, getWeeklyStudySummary } from '../../platform/browser/statistics-adapter';
import { loadGoalProgressThisWeek } from '../goals/goal-service';
import { getTodayStartAtMs, getWeekStartAtMs } from '../../shared/lib/dates';
import { ok, err, type Result } from '../../shared/lib/result';

export interface DashboardData {
  todayMinutes: number;
  todaySessionCount: number;
  weeklyMinutes: number;
  weeklySessionCount: number;
  totalTargetMinutes: number;     // 이번 주 모든 목표의 합
  weeklyProgressPercent: number;  // 0~100+ (100 초과 가능)
  remainingMinutes: number;       // 남은 목표 분 (0 이상)
  goalCount: number;              // 설정된 목표 수
  achievedGoalCount: number;      // 달성한 목표 수
  hasData: boolean;               // 세션 기록 또는 목표가 하나라도 있는지
}

export async function loadDashboardData(): Promise<Result<DashboardData>> {
  try {
    const todayStartMs = getTodayStartAtMs();
    const weekStartMs = getWeekStartAtMs();

    const [todayResult, weeklyResult, goalResult] = await Promise.all([
      getTodayStudySummary(todayStartMs),
      getWeeklyStudySummary(weekStartMs),
      loadGoalProgressThisWeek(),
    ]);

    if (!todayResult.ok) return todayResult;
    if (!weeklyResult.ok) return weeklyResult;
    if (!goalResult.ok) return goalResult;

    const goals = goalResult.data;
    const totalTargetMinutes = goals.reduce((sum, g) => sum + g.targetMinutes, 0);
    const weeklyMinutes = weeklyResult.data.totalMinutes;
    const weeklyProgressPercent = totalTargetMinutes > 0
      ? Math.round((weeklyMinutes / totalTargetMinutes) * 100)
      : 0;
    const remainingMinutes = Math.max(0, totalTargetMinutes - weeklyMinutes);
    const achievedGoalCount = goals.filter(g => g.isAchieved).length;

    const hasData = todayResult.data.sessionCount > 0
      || weeklyResult.data.sessionCount > 0
      || goals.length > 0;

    return ok({
      todayMinutes: todayResult.data.totalMinutes,
      todaySessionCount: todayResult.data.sessionCount,
      weeklyMinutes,
      weeklySessionCount: weeklyResult.data.sessionCount,
      totalTargetMinutes,
      weeklyProgressPercent,
      remainingMinutes,
      goalCount: goals.length,
      achievedGoalCount,
      hasData,
    });
  } catch (error) {
    return err(
      'UNEXPECTED_ERROR',
      `대시보드 데이터 로드 중 오류: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
