/**
 * 브라우저 QA mode용 in-memory Goal persistence adapter.
 * weekly-goal-repository.ts와 동일한 함수 시그니처를 제공한다.
 * raw SQL을 해석하지 않고, 도메인 로직을 직접 구현한다.
 */
import type { WeeklyGoal, CreateWeeklyGoalInput, UpdateWeeklyGoalInput } from '../../domain/goals/weekly-goal';
import { ok, err, type Result } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import { CreateWeeklyGoalSchema, UpdateWeeklyGoalSchema } from '../../domain/goals/weekly-goal-schema';

/** in-memory 저장소 */
const store: WeeklyGoal[] = [];

/** seed 데이터를 추가한다 (QA mode 초기화용) */
export function seedGoals(goals: WeeklyGoal[]): void {
  store.length = 0;
  store.push(...goals);
}

export async function createWeeklyGoal(input: CreateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  const parsed = CreateWeeklyGoalSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { topicId, weekStartAtMs, targetMinutes } = parsed.data;

  // 동일 topic + week 중복 확인
  const duplicate = store.find((g) => g.topicId === topicId && g.weekStartAtMs === weekStartAtMs);
  if (duplicate) {
    return err(ERROR_CODES.VALIDATION_ERROR, '해당 주제에 이미 이번 주 목표가 설정되어 있습니다');
  }

  const now = Date.now();
  const goal: WeeklyGoal = {
    id: crypto.randomUUID(),
    topicId,
    weekStartAtMs,
    targetMinutes,
    createdAtMs: now,
    updatedAtMs: now,
  };
  store.push(goal);
  return ok(goal);
}

export async function updateWeeklyGoal(id: string, input: UpdateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  const parsed = UpdateWeeklyGoalSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { targetMinutes } = parsed.data;

  const index = store.findIndex((g) => g.id === id);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, '주간 목표를 찾을 수 없습니다');
  }

  const updated = { ...store[index], targetMinutes, updatedAtMs: Date.now() };
  store[index] = updated;
  return ok(updated);
}

export async function findByTopicAndWeek(topicId: string, weekStartAtMs: number): Promise<Result<WeeklyGoal | null>> {
  const goal = store.find((g) => g.topicId === topicId && g.weekStartAtMs === weekStartAtMs);
  return ok(goal ?? null);
}

export async function findAllByWeek(weekStartAtMs: number): Promise<Result<WeeklyGoal[]>> {
  const goals = store.filter((g) => g.weekStartAtMs === weekStartAtMs);
  return ok(goals);
}
