import { getTodayStudySummary, getWeeklyStudySummary, getStudyByTopic } from '../../platform/browser/statistics-adapter';
import { getTodayStartAtMs, getWeekStartAtMs } from '../../shared/lib/dates';
import { ok, err, type Result } from '../../shared/lib/result';
import type { TodayStudySummary, WeeklyStudySummary, TopicStudySummary } from '../../domain/statistics/statistics';

export interface StatsPageData {
  today: TodayStudySummary;           // { totalMinutes, sessionCount }
  weekly: WeeklyStudySummary;         // { totalMinutes, sessionCount }
  byTopic: TopicStudySummary[];       // [{ topicId, topicName, totalMinutes, sessionCount }]
  totalMinutesAllTime: number;        // 전체 기간 누적 분 (byTopic 합산)
  totalSessionsAllTime: number;       // 전체 기간 세션 수 (byTopic 합산)
  hasData: boolean;                   // 세션 기록이 하나라도 있는지
}

export async function loadStatsPageData(): Promise<Result<StatsPageData>> {
  try {
    const todayStartMs = getTodayStartAtMs();
    const weekStartMs = getWeekStartAtMs();

    const [todayResult, weeklyResult, topicResult] = await Promise.all([
      getTodayStudySummary(todayStartMs),
      getWeeklyStudySummary(weekStartMs),
      getStudyByTopic(),
    ]);

    if (!todayResult.ok) return todayResult;
    if (!weeklyResult.ok) return weeklyResult;
    if (!topicResult.ok) return topicResult;

    const byTopic = topicResult.data;
    const totalMinutesAllTime = byTopic.reduce((sum, t) => sum + t.totalMinutes, 0);
    const totalSessionsAllTime = byTopic.reduce((sum, t) => sum + t.sessionCount, 0);

    const hasData = todayResult.data.sessionCount > 0
      || weeklyResult.data.sessionCount > 0
      || byTopic.length > 0;

    return ok({
      today: todayResult.data,
      weekly: weeklyResult.data,
      byTopic,
      totalMinutesAllTime,
      totalSessionsAllTime,
      hasData,
    });
  } catch (error) {
    return err(
      'UNEXPECTED_ERROR',
      `An error occurred while loading statistics data: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
