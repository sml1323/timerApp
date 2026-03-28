import { select } from '../../platform/tauri/sql-client';
import { ok, err, type Result } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';

/** 주간 주제별 학습 누적 분 */
export interface WeeklyStudyByTopic {
  topicId: string;
  totalMinutes: number;
}

function getActualDurationSecondsSql(): string {
  return `CASE
    WHEN ended_at_ms IS NOT NULL AND ended_at_ms >= started_at_ms
      THEN ROUND((ended_at_ms - started_at_ms) / 1000.0)
    ELSE planned_duration_sec
  END`;
}

/**
 * 특정 주 범위의 종료된 study 세션을 주제별로 그룹화하여 실제 총 학습 분을 반환한다.
 * - phase_type = 'study' (휴식 제외)
 * - status IN ('completed', 'interrupted') (running 제외)
 * - started_at_ms 범위: [weekStartAtMs, weekStartAtMs + 7일)
 */
export async function getWeeklyStudyMinutesByTopic(
  weekStartAtMs: number
): Promise<Result<Map<string, number>>> {
  try {
    const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
    const durationSql = getActualDurationSecondsSql();
    const rows = await select<{ topic_id: string; total_seconds: number }>(
      `SELECT topic_id, SUM(${durationSql}) AS total_seconds
       FROM sessions
       WHERE phase_type = 'study'
         AND status IN ('completed', 'interrupted')
         AND started_at_ms >= $1
         AND started_at_ms < $2
       GROUP BY topic_id`,
      [weekStartAtMs, weekEndAtMs],
    );

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.topic_id, Math.round(row.total_seconds / 60));
    }
    return ok(map);
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading weekly study statistics: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
