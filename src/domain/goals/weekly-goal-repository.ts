import { select, execute } from '../../platform/tauri/sql-client.js';
import { ok, err, type Result } from '../../shared/lib/result.js';
import { ERROR_CODES } from '../../shared/lib/errors.js';
import type { WeeklyGoal, CreateWeeklyGoalInput, UpdateWeeklyGoalInput } from './weekly-goal.js';
import { type WeeklyGoalRow, toWeeklyGoal } from './weekly-goal-mappers.js';
import { CreateWeeklyGoalSchema, UpdateWeeklyGoalSchema } from './weekly-goal-schema.js';

/**
 * 새 주간 목표를 생성한다.
 * - Zod 검증 → 동일 topic+week 중복 확인 → INSERT → 생성된 row 반환
 */
export async function createWeeklyGoal(input: CreateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  try {
    // 1. Zod 입력 검증
    const parsed = CreateWeeklyGoalSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
    }
    const { topicId, weekStartAtMs, targetMinutes } = parsed.data;

    // 2. 동일 topic + week 중복 확인
    const duplicates = await select<WeeklyGoalRow>(
      'SELECT id FROM weekly_goals WHERE topic_id = $1 AND week_start_at_ms = $2',
      [topicId, weekStartAtMs],
    );
    if (duplicates.length > 0) {
      return err(ERROR_CODES.VALIDATION_ERROR, '해당 주제에 이미 이번 주 목표가 설정되어 있습니다');
    }

    // 3. ID 및 타임스탬프 생성
    const id = crypto.randomUUID();
    const now = Date.now();

    // 4. INSERT
    await execute(
      'INSERT INTO weekly_goals (id, topic_id, week_start_at_ms, target_minutes, created_at_ms, updated_at_ms) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, topicId, weekStartAtMs, targetMinutes, now, now],
    );

    // 5. 삽입된 row 조회 후 반환
    const rows = await select<WeeklyGoalRow>('SELECT * FROM weekly_goals WHERE id = $1', [id]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, '주간 목표 생성 후 조회에 실패했습니다');
    }

    return ok(toWeeklyGoal(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `주간 목표 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 주간 목표를 수정한다.
 * - Zod 검증 → 존재 확인 → UPDATE(targetMinutes, updatedAtMs만) → 갱신된 row 반환
 */
export async function updateWeeklyGoal(id: string, input: UpdateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  try {
    // 1. Zod 입력 검증
    const parsed = UpdateWeeklyGoalSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
    }
    const { targetMinutes } = parsed.data;

    // 2. 존재 확인
    const existing = await select<WeeklyGoalRow>('SELECT * FROM weekly_goals WHERE id = $1', [id]);
    if (existing.length === 0) {
      return err(ERROR_CODES.NOT_FOUND, '주간 목표를 찾을 수 없습니다');
    }

    // 3. UPDATE (targetMinutes, updatedAtMs만)
    const now = Date.now();
    await execute(
      'UPDATE weekly_goals SET target_minutes = $1, updated_at_ms = $2 WHERE id = $3',
      [targetMinutes, now, id],
    );

    // 4. 갱신된 row 조회 후 반환
    const rows = await select<WeeklyGoalRow>('SELECT * FROM weekly_goals WHERE id = $1', [id]);
    if (rows.length === 0) {
      return err(ERROR_CODES.PERSISTENCE_ERROR, '주간 목표 수정 후 조회에 실패했습니다');
    }

    return ok(toWeeklyGoal(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `주간 목표 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 특정 주제의 특정 주 목표를 조회한다.
 * - 결과가 없으면 ok(null) 반환 — 목표가 없는 상태는 정상이다
 */
export async function findByTopicAndWeek(topicId: string, weekStartAtMs: number): Promise<Result<WeeklyGoal | null>> {
  try {
    const rows = await select<WeeklyGoalRow>(
      'SELECT * FROM weekly_goals WHERE topic_id = $1 AND week_start_at_ms = $2',
      [topicId, weekStartAtMs],
    );

    if (rows.length === 0) {
      return ok(null);
    }

    return ok(toWeeklyGoal(rows[0]));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `주간 목표 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * 특정 주의 모든 주제 목표를 조회한다.
 * - 빈 배열은 에러가 아님 → ok([]) 반환
 */
export async function findAllByWeek(weekStartAtMs: number): Promise<Result<WeeklyGoal[]>> {
  try {
    const rows = await select<WeeklyGoalRow>(
      'SELECT * FROM weekly_goals WHERE week_start_at_ms = $1',
      [weekStartAtMs],
    );

    return ok(rows.map(toWeeklyGoal));
  } catch (error) {
    return err(
      ERROR_CODES.PERSISTENCE_ERROR,
      `주간 목표 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
