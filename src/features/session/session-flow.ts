import type { SessionPhaseType } from '../../domain/sessions/session';

interface SessionOutcomeContent {
  durationLabel: string;
  feedbackMessage: string;
  primaryActionLabel: string;
  nextPhaseType: SessionPhaseType;
}

const OUTCOME_CONTENT: Record<SessionPhaseType, SessionOutcomeContent> = {
  study: {
    durationLabel: '학습 완료',
    feedbackMessage: '수고했어요! 한 걸음 전진했습니다.',
    primaryActionLabel: '휴식 시작',
    nextPhaseType: 'break',
  },
  break: {
    durationLabel: '휴식 완료',
    feedbackMessage: '좋아요. 다시 집중할 준비가 되었어요.',
    primaryActionLabel: '다음 학습 시작',
    nextPhaseType: 'study',
  },
};

export function getOutcomeContent(phaseType: SessionPhaseType): SessionOutcomeContent {
  return OUTCOME_CONTENT[phaseType];
}

export function getSessionStatusText(
  phaseType: SessionPhaseType,
  remainingSec: number,
): string {
  if (remainingSec <= 0) {
    return '세션 완료';
  }

  return phaseType === 'break' ? '휴식 진행 중' : '집중 진행 중';
}

export function getPhaseStartErrorMessage(phaseType: SessionPhaseType): string {
  return phaseType === 'break'
    ? '휴식 세션 시작 중 예상치 못한 오류가 발생했습니다.'
    : '다음 학습 세션 시작 중 예상치 못한 오류가 발생했습니다.';
}

/** 중단 후 recovery variant에 사용할 콘텐츠 */
export interface InterruptedOutcomeContent {
  feedbackMessage: string;
  recoveryHint: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  tertiaryActionLabel: string;
}

export function getInterruptedOutcomeContent(): InterruptedOutcomeContent {
  return {
    feedbackMessage: '괜찮아요, 이번 주 안에 다시 이어갈 수 있어요.',
    recoveryHint: getWeeklyRecoveryHint(),
    primaryActionLabel: '바로 재시작',
    secondaryActionLabel: '다른 주제 선택',
    tertiaryActionLabel: '오늘은 종료',
  };
}

/**
 * 이번 주 남은 목표 안내 힌트.
 * Epic 4(주간 목표)/5(통계) 미구현 → 정적 문구 사용.
 * 향후 실데이터 연동 시 이 함수만 교체하면 된다.
 */
export function getWeeklyRecoveryHint(): string {
  return '중단해도 괜찮아요. 언제든 다시 시작할 수 있습니다.';
}
