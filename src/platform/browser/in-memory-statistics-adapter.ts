/**
 * 브라우저 QA mode용 in-memory Statistics persistence adapter.
 * statistics-repository.ts와 동일한 함수 시그니처를 제공한다.
 * raw SQL을 해석하지 않고, in-memory session store에서 도메인 로직을 직접 구현한다.
 */
import type { TodayStudySummary, WeeklyStudySummary, TopicStudySummary } from '../../domain/statistics/statistics';
import { ok, type Result } from '../../shared/lib/result';
import { getSessionStore } from './in-memory-session-adapter';
import { findAllTopics } from './in-memory-topic-adapter';

export async function getTodayStudySummary(
  todayStartMs: number
): Promise<Result<TodayStudySummary>> {
  const todayEndMs = todayStartMs + 24 * 60 * 60 * 1000;
  const sessions = getSessionStore();

  let totalSeconds = 0;
  let sessionCount = 0;

  for (const s of sessions) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= todayStartMs &&
      s.startedAtMs < todayEndMs
    ) {
      totalSeconds += s.plannedDurationSec;
      sessionCount++;
    }
  }

  return ok({
    totalMinutes: Math.round(totalSeconds / 60),
    sessionCount,
  });
}

export async function getWeeklyStudySummary(
  weekStartAtMs: number
): Promise<Result<WeeklyStudySummary>> {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  const sessions = getSessionStore();

  let totalSeconds = 0;
  let sessionCount = 0;

  for (const s of sessions) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      totalSeconds += s.plannedDurationSec;
      sessionCount++;
    }
  }

  return ok({
    totalMinutes: Math.round(totalSeconds / 60),
    sessionCount,
  });
}

export async function getStudyByTopic(): Promise<Result<TopicStudySummary[]>> {
  const sessions = getSessionStore();
  const topicsResult = await findAllTopics(false);

  // 활성 주제 이름 맵
  const topicNameMap = new Map<string, string>();
  if (topicsResult.ok) {
    for (const topic of topicsResult.data) {
      topicNameMap.set(topic.id, topic.name);
    }
  }

  // 주제별 집계
  const aggregates = new Map<string, { totalSeconds: number; sessionCount: number }>();

  for (const s of sessions) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      topicNameMap.has(s.topicId) // 활성 주제만
    ) {
      const existing = aggregates.get(s.topicId) ?? { totalSeconds: 0, sessionCount: 0 };
      existing.totalSeconds += s.plannedDurationSec;
      existing.sessionCount++;
      aggregates.set(s.topicId, existing);
    }
  }

  // total_seconds 내림차순 정렬
  const result: TopicStudySummary[] = [...aggregates.entries()]
    .map(([topicId, agg]) => ({
      topicId,
      topicName: topicNameMap.get(topicId) ?? '',
      totalMinutes: Math.round(agg.totalSeconds / 60),
      sessionCount: agg.sessionCount,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  return ok(result);
}
