import { select, execute } from '../../platform/tauri/sql-client';
import { ok, err, type Result } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import type { Session, CreateSessionInput, CompleteSessionInput, InterruptSessionInput, ReassignSessionTopicInput } from './session';
import { type SessionRow, toSession } from './session-mappers';
import { CreateSessionSchema, CompleteSessionSchema, InterruptSessionSchema, ReassignSessionTopicSchema } from './session-schema';
import { validateTransition } from './session-transitions';

const SINGLE_RUNNING_SESSION_INDEX = 'idx_sessions_single_running';

function isSingleRunningSessionConstraintError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes(SINGLE_RUNNING_SESSION_INDEX) ||
    message.includes('UNIQUE constraint failed: sessions.status')
  );
}

/**
 * 새 세션을 생성한다.
 * - Zod 검증 → topicId 존재 확인 → 진행 중인 세션 확인 → INSERT (status='running') → 생성된 row 반환
 */
export async function createSession(input: CreateSessionInput): Promise<Result<Session>> {
  try {
    // 1. Zod 입력 검증
    const parsed = CreateSessionSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
    }
    const { topicId, phaseType, plannedDurationSec } = parsed.data;

    // 2. topicId 존재 확인
    const topicRows = await select<{ id: string }>('SELECT id FROM topics WHERE id = $1', [topicId]);
    if (topicRows.length === 0) {
      return err(ERROR_CODES.NOT_FOUND, 'Topic not found');
    }

    // 3. 현재 running 세션 존재 확인
    const runningRows = await select<{ id: string }>(
      "SELECT id FROM sessions WHERE status = 'running' LIMIT 1",
    );
    if (runningRows.length > 0) {
      return err(ERROR_CODES.SESSION_STATE_CONFLICT, 'A session is already running');
    }

    // 4. ID 및 타임스탬프 생성
    const id = crypto.randomUUID();
    const now = Date.now();

    // 5. INSERT (MVP: 바로 running 상태로 시작)
    try {
      await execute(
        'INSERT INTO sessions (id, topic_id, phase_type, status, started_at_ms, planned_duration_sec, ended_at_ms, created_at_ms, updated_at_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [id, topicId, phaseType, 'running', now, plannedDurationSec, null, now, now],
      );
    } catch (error) {
      if (isSingleRunningSessionConstraintError(error)) {
        return err(ERROR_CODES.SESSION_STATE_CONFLICT, 'A session is already running');
      }
      throw error;
    }

    // 6. 삽입된 row 조회 후 반환
    const rows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, 'Failed to load the session after creation');
    }

    return ok(toSession(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while creating the session: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * ID로 세션을 조회한다.
 */
export async function findSessionById(id: string): Promise<Result<Session>> {
  try {
    const rows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return err(ERROR_CODES.NOT_FOUND, 'Session not found');
    }
    return ok(toSession(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading the session: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 세션을 완료한다.
 * - Zod 검증 → 존재 확인 → 상태 전이 검증(running→completed) → UPDATE → 갱신된 row 반환
 */
export async function completeSession(input: CompleteSessionInput): Promise<Result<Session>> {
  try {
    // 1. Zod 입력 검증
    const parsed = CompleteSessionSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
    }
    const { sessionId } = parsed.data;

    // 2. running 상태일 때만 원자적으로 UPDATE
    const now = Date.now();
    const updateResult = await execute(
      'UPDATE sessions SET status = $1, ended_at_ms = $2, updated_at_ms = $3 WHERE id = $4 AND status = $5',
      ['completed', now, now, sessionId, 'running'],
    );
    if (updateResult.rowsAffected === 0) {
      const existResult = await findSessionById(sessionId);
      if (!existResult.ok) {
        return existResult;
      }

      const transitionResult = validateTransition(existResult.data.status, 'completed');
      if (!transitionResult.ok) {
        return err(transitionResult.code, transitionResult.message);
      }

      return err(ERROR_CODES.PERSISTENCE_ERROR, 'The completed session update was not applied');
    }

    // 3. 갱신된 row 조회 후 반환
    const rows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, 'Failed to load the session after completion');
    }

    return ok(toSession(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while completing the session: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 세션을 중단한다.
 * - Zod 검증 → 존재 확인 → 상태 전이 검증(running→interrupted) → UPDATE → 갱신된 row 반환
 */
export async function interruptSession(input: InterruptSessionInput): Promise<Result<Session>> {
  try {
    // 1. Zod 입력 검증
    const parsed = InterruptSessionSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
    }
    const { sessionId } = parsed.data;

    // 2. running 상태일 때만 원자적으로 UPDATE
    const now = Date.now();
    const updateResult = await execute(
      'UPDATE sessions SET status = $1, ended_at_ms = $2, updated_at_ms = $3 WHERE id = $4 AND status = $5',
      ['interrupted', now, now, sessionId, 'running'],
    );
    if (updateResult.rowsAffected === 0) {
      const existResult = await findSessionById(sessionId);
      if (!existResult.ok) {
        return existResult;
      }

      const transitionResult = validateTransition(existResult.data.status, 'interrupted');
      if (!transitionResult.ok) {
        return err(transitionResult.code, transitionResult.message);
      }

      return err(ERROR_CODES.PERSISTENCE_ERROR, 'The interrupted session update was not applied');
    }

    // 3. 갱신된 row 조회 후 반환
    const rows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, 'Failed to load the session after interruption');
    }

    return ok(toSession(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while interrupting the session: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 날짜 범위로 세션을 조회한다.
 * @param startMs 시작 시간 (포함) — Unix epoch milliseconds
 * @param endMs 종료 시간 (미포함) — Unix epoch milliseconds
 */
export async function findSessionsByDateRange(startMs: number, endMs: number): Promise<Result<Session[]>> {
  try {
    const rows = await select<SessionRow>(
      'SELECT * FROM sessions WHERE started_at_ms >= $1 AND started_at_ms < $2 ORDER BY started_at_ms DESC',
      [startMs, endMs],
    );
    const sessions = rows.map(toSession);
    return ok(sessions);
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while loading sessions: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 완료/중단된 세션의 주제를 변경한다.
 * - Zod 검증 → 세션 존재+완료/중단 확인 → 새 topicId 존재 확인 → UPDATE topic_id → 갱신된 row 반환
 */
export async function reassignSessionTopic(input: ReassignSessionTopicInput): Promise<Result<Session>> {
  try {
    const parsed = ReassignSessionTopicSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
    }
    const { sessionId, newTopicId } = parsed.data;

    // 1. 세션 존재 + 상태 확인
    const sessionRows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (sessionRows.length === 0) {
      return err(ERROR_CODES.NOT_FOUND, 'Session not found');
    }
    const session = toSession(sessionRows[0]);
    if (session.status !== 'completed' && session.status !== 'interrupted') {
      return err(ERROR_CODES.SESSION_STATE_CONFLICT, 'Only completed or interrupted sessions can change topics');
    }

    // 2. 새 topicId 존재 확인
    const topicRows = await select<{ id: string }>('SELECT id FROM topics WHERE id = $1', [newTopicId]);
    if (topicRows.length === 0) {
      return err(ERROR_CODES.NOT_FOUND, 'Topic not found');
    }

    // 3. UPDATE topic_id
    const now = Date.now();
    await execute(
      'UPDATE sessions SET topic_id = $1, updated_at_ms = $2 WHERE id = $3',
      [newTopicId, now, sessionId],
    );

    // 4. 갱신된 row 반환
    const rows = await select<SessionRow>('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, 'Failed to load the session after updating it');
    }
    return ok(toSession(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while changing the session topic: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 방치된 running 세션을 interrupted로 일괄 전환한다.
 * 앱 부트스트랩 시 호출하여 비정상 종료로 남은 세션을 정리한다.
 */
export async function recoverAbandonedSessions(): Promise<Result<number>> {
  try {
    const now = Date.now();
    const result = await execute(
      "UPDATE sessions SET status = 'interrupted', ended_at_ms = $1, updated_at_ms = $2 WHERE status = 'running'",
      [now, now],
    );
    return ok(result.rowsAffected);
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `An error occurred while recovering abandoned sessions: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
