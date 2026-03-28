import {
  findSessionsByDateRange,
  reassignSessionTopic,
} from '../../platform/browser/session-adapter';
import { findAllTopics } from '../../platform/browser/topic-adapter';
import type { Result } from '../../shared/lib/result';
import type { Session } from '../../domain/sessions/session';
import { ok, err } from '../../shared/lib/result';

export interface SessionRecordItem {
  session: Session;
  topicName: string;
}

/**
 * 최근 세션 기록 목록을 로드한다.
 * - 학습 세션(study)만, 완료 또는 중단 상태만 표시
 * - 주제명을 조인
 */
export async function loadSessionRecords(): Promise<Result<SessionRecordItem[]>> {
  // 최근 30일 범위 조회 (충분한 기록 확보)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const [sessionsResult, topicsResult] = await Promise.all([
    findSessionsByDateRange(thirtyDaysAgo, now),
    findAllTopics(),
  ]);

  if (!sessionsResult.ok) return err(sessionsResult.code, sessionsResult.message);
  if (!topicsResult.ok) return err(topicsResult.code, topicsResult.message);

  const topicMap = new Map<string, string>();
  for (const topic of topicsResult.data) {
    topicMap.set(topic.id, topic.name);
  }

  const records: SessionRecordItem[] = sessionsResult.data
    .filter((s) => s.phaseType === 'study' && (s.status === 'completed' || s.status === 'interrupted'))
    .map((session) => ({
      session,
      topicName: topicMap.get(session.topicId) ?? 'Deleted Topic',
    }));

  return ok(records);
}

/**
 * 세션 기록의 주제를 변경한다.
 */
export async function reassignRecordTopic(
  sessionId: string,
  newTopicId: string,
): Promise<Result<Session>> {
  return reassignSessionTopic({ sessionId, newTopicId });
}
