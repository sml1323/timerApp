import {
  createSession,
  completeSession as completeSessionRecord,
  interruptSession as interruptSessionRecord,
} from '../../domain/sessions/session-repository';
import type { CreateSessionInput } from '../../domain/sessions/session';
import type { Result } from '../../shared/lib/result';
import type { Session } from '../../domain/sessions/session';
import { useSessionStore } from './state/sessionStore';
import { sendSessionNotification } from '../../platform/tauri/notification-client';

/** 기본 포모도로 학습 시간 (25분 = 1500초) */
export const DEFAULT_STUDY_DURATION_SEC = 25 * 60;

/**
 * 학습 세션을 시작한다.
 * session-repository를 호출하여 DB에 세션을 생성한다.
 */
export async function beginStudySession(
  topicId: string,
  topicName: string | null,
  plannedDurationSec: number = DEFAULT_STUDY_DURATION_SEC,
): Promise<Result<Session>> {
  const input: CreateSessionInput = {
    topicId,
    phaseType: 'study',
    plannedDurationSec,
  };
  const result = await createSession(input);

  if (result.ok) {
    const { setSelectedTopic, startSession } = useSessionStore.getState();
    setSelectedTopic(topicId, topicName ?? '');
    startSession(result.data);
  }

  return result;
}

/**
 * 진행 중인 학습 세션을 완료 처리한다.
 * DB 반영이 성공한 경우에만 sessionStore를 completed로 전환한다.
 */
export async function completeStudySession(sessionId: string): Promise<Result<Session>> {
  const result = await completeSessionRecord({ sessionId });

  if (result.ok) {
    useSessionStore.getState().endSession(result.data);

    // 알림은 보조 기능 — fire-and-forget
    const topicName = useSessionStore.getState().selectedTopicName ?? '';
    const durationMin = Math.round(result.data.plannedDurationSec / 60);
    sendSessionNotification('세션 완료', `${topicName} — ${durationMin}분 학습 완료`);
  }

  return result;
}

/**
 * 진행 중인 학습 세션을 중단 처리한다.
 * DB 반영이 성공한 경우에만 sessionStore를 interrupted로 전환한다.
 */
export async function interruptStudySession(sessionId: string): Promise<Result<Session>> {
  const result = await interruptSessionRecord({ sessionId });

  if (result.ok) {
    useSessionStore.getState().interruptCurrentSession();
  }

  return result;
}
