import { select } from '../../platform/tauri/sql-client';
import { ok, err, type Result } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import type { TodayStudySummary, WeeklyStudySummary, TopicStudySummary } from './statistics';
import {
  toTodayStudySummary,
  toWeeklyStudySummary,
  toTopicStudySummary,
  type StudySummaryRow,
  type TopicStudySummaryRow,
} from './statistics-mappers';

function getActualDurationSecondsSql(tableAlias?: string): string {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  return `CASE
    WHEN ${prefix}ended_at_ms IS NOT NULL AND ${prefix}ended_at_ms >= ${prefix}started_at_ms
      THEN ROUND((${prefix}ended_at_ms - ${prefix}started_at_ms) / 1000.0)
    ELSE ${prefix}planned_duration_sec
  END`;
}

/**
 * 오늘(자정~자정) 종료된 study 세션의 실제 누적 시간과 세션 수를 반환한다.
 * @param todayStartMs — 오늘 자정의 epoch ms
 */
export async function getTodayStudySummary(
  todayStartMs: number
): Promise<Result<TodayStudySummary>> {
  try {
    const todayEndMs = todayStartMs + 24 * 60 * 60 * 1000;
    const durationSql = getActualDurationSecondsSql();
    const rows = await select<StudySummaryRow>(
      `SELECT COALESCE(SUM(${durationSql}), 0) AS total_seconds,
              COUNT(*) AS session_count
       FROM sessions
       WHERE phase_type = 'study'
         AND status IN ('completed', 'interrupted')
         AND started_at_ms >= $1
         AND started_at_ms < $2`,
      [todayStartMs, todayEndMs],
    );
    return ok(toTodayStudySummary(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading today's statistics: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 이번 주 종료된 study 세션의 실제 누적 시간과 세션 수를 반환한다.
 * @param weekStartAtMs — 월요일 00:00 UTC epoch ms
 */
export async function getWeeklyStudySummary(
  weekStartAtMs: number
): Promise<Result<WeeklyStudySummary>> {
  try {
    const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
    const durationSql = getActualDurationSecondsSql();
    const rows = await select<StudySummaryRow>(
      `SELECT COALESCE(SUM(${durationSql}), 0) AS total_seconds,
              COUNT(*) AS session_count
       FROM sessions
       WHERE phase_type = 'study'
         AND status IN ('completed', 'interrupted')
         AND started_at_ms >= $1
         AND started_at_ms < $2`,
      [weekStartAtMs, weekEndAtMs],
    );
    return ok(toWeeklyStudySummary(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading weekly statistics: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 전체 기간의 주제별 종료된 study 세션 실제 누적 시간과 세션 수를 반환한다.
 * topic name은 topics 테이블 JOIN으로 가져온다.
 */
export async function getStudyByTopic(): Promise<Result<TopicStudySummary[]>> {
  try {
    const durationSql = getActualDurationSecondsSql('s');
    const rows = await select<TopicStudySummaryRow>(
      `SELECT s.topic_id, t.name AS topic_name,
              COALESCE(SUM(${durationSql}), 0) AS total_seconds,
              COUNT(*) AS session_count
       FROM sessions s
       JOIN topics t ON s.topic_id = t.id
       WHERE s.phase_type = 'study'
         AND s.status IN ('completed', 'interrupted')
         AND t.is_archived = 0
       GROUP BY s.topic_id, t.name
       ORDER BY total_seconds DESC`,
    );
    return ok(rows.map(toTopicStudySummary));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading statistics by topic: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
