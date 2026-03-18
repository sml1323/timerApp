import { CharacterStatePanel } from './CharacterStatePanel';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './SessionOutcomePanel.module.css';

interface SessionOutcomePanelProps {
  variant: 'success' | 'recovery';
  topicName: string;
  durationSec: number;
  onNextSession: () => void;
  onViewStats: () => void;
  onGoHome: () => void;
}

const FEEDBACK_MESSAGES: Record<'success' | 'recovery', string> = {
  success: '수고했어요! 한 걸음 전진했습니다.',
  recovery: '', // Story 3.5에서 구현
};

function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;
}

export function SessionOutcomePanel({
  variant,
  topicName,
  durationSec,
  onNextSession,
  onViewStats,
  onGoHome,
}: SessionOutcomePanelProps) {
  const feedbackMessage = FEEDBACK_MESSAGES[variant] || FEEDBACK_MESSAGES.success;
  const durationText = formatDuration(durationSec);

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      <CharacterStatePanel state="speak" message={feedbackMessage} />

      <div className={styles.summary}>
        <p className={styles.topicName}>{topicName}</p>
        <p className={styles.duration}>{durationText} 학습 완료</p>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onNextSession}>
          다음 세션 시작
        </Button>
        <Button variant="secondary" onClick={onViewStats}>
          통계 보기
        </Button>
        <Button variant="text" onClick={onGoHome}>
          홈으로
        </Button>
      </div>
    </div>
  );
}
