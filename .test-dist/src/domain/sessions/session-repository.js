import { select, execute } from '../../platform/tauri/sql-client';
import { ok, err } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import { toSession } from './session-mappers';
import { CreateSessionSchema, CompleteSessionSchema, InterruptSessionSchema } from './session-schema';
import { validateTransition } from './session-transitions';
const SINGLE_RUNNING_SESSION_INDEX = 'idx_sessions_single_running';
function isSingleRunningSessionConstraintError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return (message.includes(SINGLE_RUNNING_SESSION_INDEX) ||
        message.includes('UNIQUE constraint failed: sessions.status'));
}
/**
 * 새 세션을 생성한다.
 * - Zod 검증 → topicId 존재 확인 → 진행 중인 세션 확인 → INSERT (status='running') → 생성된 row 반환
 */
export async function createSession(input) {
    try {
        // 1. Zod 입력 검증
        const parsed = CreateSessionSchema.safeParse(input);
        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
        }
        const { topicId, phaseType, plannedDurationSec } = parsed.data;
        // 2. topicId 존재 확인
        const topicRows = await select('SELECT id FROM topics WHERE id = $1', [topicId]);
        if (topicRows.length === 0) {
            return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
        }
        // 3. 현재 running 세션 존재 확인
        const runningRows = await select("SELECT id FROM sessions WHERE status = 'running' LIMIT 1");
        if (runningRows.length > 0) {
            return err(ERROR_CODES.SESSION_STATE_CONFLICT, '이미 진행 중인 세션이 있습니다');
        }
        // 4. ID 및 타임스탬프 생성
        const id = crypto.randomUUID();
        const now = Date.now();
        // 5. INSERT (MVP: 바로 running 상태로 시작)
        try {
            await execute('INSERT INTO sessions (id, topic_id, phase_type, status, started_at_ms, planned_duration_sec, ended_at_ms, created_at_ms, updated_at_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [id, topicId, phaseType, 'running', now, plannedDurationSec, null, now, now]);
        }
        catch (error) {
            if (isSingleRunningSessionConstraintError(error)) {
                return err(ERROR_CODES.SESSION_STATE_CONFLICT, '이미 진행 중인 세션이 있습니다');
            }
            throw error;
        }
        // 6. 삽입된 row 조회 후 반환
        const rows = await select('SELECT * FROM sessions WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 생성 후 조회에 실패했습니다');
        }
        return ok(toSession(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `세션 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * ID로 세션을 조회한다.
 */
export async function findSessionById(id) {
    try {
        const rows = await select('SELECT * FROM sessions WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.NOT_FOUND, '세션을 찾을 수 없습니다');
        }
        return ok(toSession(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `세션 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 세션을 완료한다.
 * - Zod 검증 → 존재 확인 → 상태 전이 검증(running→completed) → UPDATE → 갱신된 row 반환
 */
export async function completeSession(input) {
    try {
        // 1. Zod 입력 검증
        const parsed = CompleteSessionSchema.safeParse(input);
        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
        }
        const { sessionId } = parsed.data;
        // 2. running 상태일 때만 원자적으로 UPDATE
        const now = Date.now();
        const updateResult = await execute('UPDATE sessions SET status = $1, ended_at_ms = $2, updated_at_ms = $3 WHERE id = $4 AND status = $5', ['completed', now, now, sessionId, 'running']);
        if (updateResult.rowsAffected === 0) {
            const existResult = await findSessionById(sessionId);
            if (!existResult.ok) {
                return existResult;
            }
            const transitionResult = validateTransition(existResult.data.status, 'completed');
            if (!transitionResult.ok) {
                return err(transitionResult.code, transitionResult.message);
            }
            return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 완료 업데이트가 적용되지 않았습니다');
        }
        // 3. 갱신된 row 조회 후 반환
        const rows = await select('SELECT * FROM sessions WHERE id = $1', [sessionId]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 완료 후 조회에 실패했습니다');
        }
        return ok(toSession(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `세션 완료 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 세션을 중단한다.
 * - Zod 검증 → 존재 확인 → 상태 전이 검증(running→interrupted) → UPDATE → 갱신된 row 반환
 */
export async function interruptSession(input) {
    try {
        // 1. Zod 입력 검증
        const parsed = InterruptSessionSchema.safeParse(input);
        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
        }
        const { sessionId } = parsed.data;
        // 2. running 상태일 때만 원자적으로 UPDATE
        const now = Date.now();
        const updateResult = await execute('UPDATE sessions SET status = $1, ended_at_ms = $2, updated_at_ms = $3 WHERE id = $4 AND status = $5', ['interrupted', now, now, sessionId, 'running']);
        if (updateResult.rowsAffected === 0) {
            const existResult = await findSessionById(sessionId);
            if (!existResult.ok) {
                return existResult;
            }
            const transitionResult = validateTransition(existResult.data.status, 'interrupted');
            if (!transitionResult.ok) {
                return err(transitionResult.code, transitionResult.message);
            }
            return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 중단 업데이트가 적용되지 않았습니다');
        }
        // 3. 갱신된 row 조회 후 반환
        const rows = await select('SELECT * FROM sessions WHERE id = $1', [sessionId]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 중단 후 조회에 실패했습니다');
        }
        return ok(toSession(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `세션 중단 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 날짜 범위로 세션을 조회한다.
 * @param startMs 시작 시간 (포함) — Unix epoch milliseconds
 * @param endMs 종료 시간 (미포함) — Unix epoch milliseconds
 */
export async function findSessionsByDateRange(startMs, endMs) {
    try {
        const rows = await select('SELECT * FROM sessions WHERE started_at_ms >= $1 AND started_at_ms < $2 ORDER BY started_at_ms DESC', [startMs, endMs]);
        const sessions = rows.map(toSession);
        return ok(sessions);
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `세션 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
