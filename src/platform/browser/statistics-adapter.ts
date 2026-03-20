/**
 * 런타임 환경에 따라 올바른 Statistics repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
import type { TodayStudySummary, WeeklyStudySummary, TopicStudySummary } from '../../domain/statistics/statistics';
import type { Result } from '../../shared/lib/result';

export interface StatisticsRepositoryAdapter {
  getTodayStudySummary(todayStartMs: number): Promise<Result<TodayStudySummary>>;
  getWeeklyStudySummary(weekStartAtMs: number): Promise<Result<WeeklyStudySummary>>;
  getStudyByTopic(): Promise<Result<TopicStudySummary[]>>;
}

let adapter: StatisticsRepositoryAdapter | null = null;

async function getAdapter(): Promise<StatisticsRepositoryAdapter> {
  if (adapter) return adapter;

  if (isTauriRuntime()) {
    const mod = await import('../../domain/statistics/statistics-repository');
    adapter = mod;
  } else {
    const mod = await import('./in-memory-statistics-adapter');
    adapter = mod;
  }

  return adapter;
}

export async function getTodayStudySummary(todayStartMs: number): Promise<Result<TodayStudySummary>> {
  return (await getAdapter()).getTodayStudySummary(todayStartMs);
}

export async function getWeeklyStudySummary(weekStartAtMs: number): Promise<Result<WeeklyStudySummary>> {
  return (await getAdapter()).getWeeklyStudySummary(weekStartAtMs);
}

export async function getStudyByTopic(): Promise<Result<TopicStudySummary[]>> {
  return (await getAdapter()).getStudyByTopic();
}
