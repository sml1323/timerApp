import { createWeeklyGoal, updateWeeklyGoal, findByTopicAndWeek, findAllByWeek } from '../../platform/browser/goal-adapter';
import { getWeekStartAtMs } from '../../shared/lib/dates';
import type { WeeklyGoal } from '../../domain/goals/weekly-goal';
import type { Result } from '../../shared/lib/result';

/** 현재 주의 특정 주제 목표 조회 */
export async function loadGoalForTopicThisWeek(topicId: string): Promise<Result<WeeklyGoal | null>> {
  const weekStartAtMs = getWeekStartAtMs();
  return findByTopicAndWeek(topicId, weekStartAtMs);
}

/** 목표 저장 (신규이면 create, 기존이면 update) */
export async function saveGoal(topicId: string, targetMinutes: number): Promise<Result<WeeklyGoal>> {
  const weekStartAtMs = getWeekStartAtMs();
  const existing = await findByTopicAndWeek(topicId, weekStartAtMs);
  if (!existing.ok) return existing as Result<WeeklyGoal>;

  if (existing.data) {
    return updateWeeklyGoal(existing.data.id, { targetMinutes });
  }
  return createWeeklyGoal({ topicId, weekStartAtMs, targetMinutes });
}

/** 현재 주의 모든 목표 조회 */
export async function loadAllGoalsThisWeek(): Promise<Result<WeeklyGoal[]>> {
  const weekStartAtMs = getWeekStartAtMs();
  return findAllByWeek(weekStartAtMs);
}
