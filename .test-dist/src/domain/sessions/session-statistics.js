import { select } from '../../platform/tauri/sql-client';
import { ok, err } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
/**
 * 특정 주 범위의 completed study 세션을 주제별로 그룹화하여 총 학습 분을 반환한다.
 * - phase_type = 'study' (휴식 제외)
 * - status = 'completed' (interrupted/running 제외)
 * - started_at_ms 범위: [weekStartAtMs, weekStartAtMs + 7일)
 */
export async function getWeeklyStudyMinutesByTopic(weekStartAtMs) {
    try {
        const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
        const rows = await select(`SELECT topic_id, SUM(planned_duration_sec) AS total_seconds
       FROM sessions
       WHERE phase_type = 'study'
         AND status = 'completed'
         AND started_at_ms >= $1
         AND started_at_ms < $2
       GROUP BY topic_id`, [weekStartAtMs, weekEndAtMs]);
        const map = new Map();
        for (const row of rows) {
            map.set(row.topic_id, Math.round(row.total_seconds / 60));
        }
        return ok(map);
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주간 학습 통계 조회 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    }
}
