const OUTCOME_CONTENT = {
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
export function getOutcomeContent(phaseType) {
    return OUTCOME_CONTENT[phaseType];
}
export function getSessionStatusText(phaseType, remainingSec) {
    if (remainingSec <= 0) {
        return '세션 완료';
    }
    return phaseType === 'break' ? '휴식 진행 중' : '집중 진행 중';
}
export function getPhaseStartErrorMessage(phaseType) {
    return phaseType === 'break'
        ? '휴식 세션 시작 중 예상치 못한 오류가 발생했습니다.'
        : '다음 학습 세션 시작 중 예상치 못한 오류가 발생했습니다.';
}
