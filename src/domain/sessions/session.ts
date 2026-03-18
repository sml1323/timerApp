/** 세션 단계 유형 */
export type SessionPhaseType = 'study' | 'break';

/** 세션 상태 */
export type SessionStatus = 'planned' | 'running' | 'completed' | 'interrupted';

/** DB에 저장된 세션의 TypeScript 표현 */
export interface Session {
  id: string;
  topicId: string;
  phaseType: SessionPhaseType;
  status: SessionStatus;
  startedAtMs: number;
  plannedDurationSec: number;
  endedAtMs: number | null;
  createdAtMs: number;
  updatedAtMs: number;
}

/** 세션 생성 입력 */
export interface CreateSessionInput {
  topicId: string;
  phaseType: SessionPhaseType;
  plannedDurationSec: number;
}

/** 세션 완료 입력 */
export interface CompleteSessionInput {
  sessionId: string;
}

/** 세션 중단 입력 */
export interface InterruptSessionInput {
  sessionId: string;
}
