import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOutcomeContent,
  getPhaseStartErrorMessage,
  getSessionStatusText,
  getInterruptedOutcomeContent,
  getWeeklyRecoveryHint,
} from '../.test-dist/src/features/session/session-flow.js';

test('study completion copy starts a break session next', () => {
  const content = getOutcomeContent('study');

  assert.deepEqual(content, {
    durationLabel: '학습 완료',
    feedbackMessage: '수고했어요. 한 걸음 더 나아갔습니다.',
    primaryActionLabel: '휴식 시작',
    nextPhaseType: 'break',
  });
});

test('break completion copy returns to the next study session', () => {
  const content = getOutcomeContent('break');

  assert.deepEqual(content, {
    durationLabel: '휴식 완료',
    feedbackMessage: '휴식이 끝났어요. 다시 집중할 준비가 됐습니다.',
    primaryActionLabel: '다음 학습 시작',
    nextPhaseType: 'study',
  });
});

test('running status text reflects break sessions distinctly', () => {
  assert.equal(getSessionStatusText('study', 30), '집중 진행 중');
  assert.equal(getSessionStatusText('break', 30), '휴식 중');
});

test('status text switches to completion when time is up', () => {
  assert.equal(getSessionStatusText('study', 0), '세션 완료');
  assert.equal(getSessionStatusText('break', -1), '세션 완료');
});

test('start error copy is phase-aware', () => {
  assert.equal(
    getPhaseStartErrorMessage('break'),
    '휴식 세션을 시작하는 중 예기치 않은 오류가 발생했습니다.',
  );
  assert.equal(
    getPhaseStartErrorMessage('study'),
    '다음 학습 세션을 시작하는 중 예기치 않은 오류가 발생했습니다.',
  );
});

test('interrupted outcome content provides recovery-positive messaging', () => {
  const content = getInterruptedOutcomeContent();

  assert.equal(content.feedbackMessage, '괜찮아요. 이번 주 안에 다시 시작할 수 있어요.');
  assert.equal(content.primaryActionLabel, '다시 시작');
  assert.equal(content.secondaryActionLabel, '다른 주제 선택');
  assert.equal(content.tertiaryActionLabel, '오늘은 여기까지');
  assert.ok(content.recoveryHint.length > 0, 'recoveryHint should not be empty');
});

test('recovery messages avoid failure-inducing words', () => {
  const content = getInterruptedOutcomeContent();
  const failureWords = ['실패', '미달성', '부족'];
  const allText = `${content.feedbackMessage} ${content.recoveryHint}`;

  for (const word of failureWords) {
    assert.ok(!allText.includes(word), `Recovery content should not include "${word}"`);
  }
});

test('weekly recovery hint returns static placeholder text', () => {
  const hint = getWeeklyRecoveryHint();
  assert.equal(hint, '중단된 세션은 안전하게 저장됩니다. 준비되면 언제든 다시 시작하세요.');
});
