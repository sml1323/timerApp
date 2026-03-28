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
    feedbackMessage: '수고했어요. 한 걸음 더 나아갔습니다.',
    primaryActionLabel: '휴식 시작',
    nextPhaseType: 'break',
  },
  break: {
    durationLabel: '휴식 완료',
    feedbackMessage: '휴식이 끝났어요. 다시 집중할 준비가 됐습니다.',
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

  return phaseType === 'break' ? '휴식 중' : '집중 진행 중';
}

export function getPhaseStartErrorMessage(phaseType: SessionPhaseType): string {
  return phaseType === 'break'
    ? '휴식 세션을 시작하는 중 예기치 않은 오류가 발생했습니다.'
    : '다음 학습 세션을 시작하는 중 예기치 않은 오류가 발생했습니다.';
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
    feedbackMessage: '괜찮아요. 이번 주 안에 다시 시작할 수 있어요.',
    recoveryHint: getWeeklyRecoveryHint(),
    primaryActionLabel: '다시 시작',
    secondaryActionLabel: '다른 주제 선택',
    tertiaryActionLabel: '오늘은 여기까지',
  };
}

/**
 * 이번 주 남은 목표 안내 힌트.
 * Epic 4(주간 목표)/5(통계) 미구현 → 정적 문구 사용.
 * 향후 실데이터 연동 시 이 함수만 교체하면 된다.
 */
export function getWeeklyRecoveryHint(): string {
  return '중단된 세션은 안전하게 저장됩니다. 준비되면 언제든 다시 시작하세요.';
}
