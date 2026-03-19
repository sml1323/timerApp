/**
 * 런타임 환경에 따라 올바른 Goal repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
import type { WeeklyGoal, CreateWeeklyGoalInput, UpdateWeeklyGoalInput } from '../../domain/goals/weekly-goal';
import type { Result } from '../../shared/lib/result';

export interface GoalRepositoryAdapter {
  createWeeklyGoal(input: CreateWeeklyGoalInput): Promise<Result<WeeklyGoal>>;
  updateWeeklyGoal(id: string, input: UpdateWeeklyGoalInput): Promise<Result<WeeklyGoal>>;
  findByTopicAndWeek(topicId: string, weekStartAtMs: number): Promise<Result<WeeklyGoal | null>>;
  findAllByWeek(weekStartAtMs: number): Promise<Result<WeeklyGoal[]>>;
}

let adapter: GoalRepositoryAdapter | null = null;

async function getAdapter(): Promise<GoalRepositoryAdapter> {
  if (adapter) return adapter;

  if (isTauriRuntime()) {
    const mod = await import('../../domain/goals/weekly-goal-repository');
    adapter = mod;
  } else {
    const mod = await import('./in-memory-goal-adapter');
    adapter = mod;
  }

  return adapter;
}

export async function createWeeklyGoal(input: CreateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  return (await getAdapter()).createWeeklyGoal(input);
}

export async function updateWeeklyGoal(id: string, input: UpdateWeeklyGoalInput): Promise<Result<WeeklyGoal>> {
  return (await getAdapter()).updateWeeklyGoal(id, input);
}

export async function findByTopicAndWeek(topicId: string, weekStartAtMs: number): Promise<Result<WeeklyGoal | null>> {
  return (await getAdapter()).findByTopicAndWeek(topicId, weekStartAtMs);
}

export async function findAllByWeek(weekStartAtMs: number): Promise<Result<WeeklyGoal[]>> {
  return (await getAdapter()).findAllByWeek(weekStartAtMs);
}
