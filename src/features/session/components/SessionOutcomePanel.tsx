import { CharacterStatePanel } from './CharacterStatePanel';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './SessionOutcomePanel.module.css';

interface SessionOutcomePanelProps {
  variant: 'success' | 'recovery';
  topicName: string;
  durationSec: number;
  durationLabel: string;
  feedbackMessage: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onViewStats: () => void;
  onGoHome: () => void;
  isBusy?: boolean;
}

function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;
}

export function SessionOutcomePanel({
  variant: _variant,
  topicName,
  durationSec,
  durationLabel,
  feedbackMessage,
  primaryActionLabel,
  onPrimaryAction,
  onViewStats,
  onGoHome,
  isBusy = false,
}: SessionOutcomePanelProps) {
  const durationText = formatDuration(durationSec);

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      <CharacterStatePanel state="speak" message={feedbackMessage} />

      <div className={styles.summary}>
        <p className={styles.topicName}>{topicName}</p>
        <p className={styles.duration}>{durationText} {durationLabel}</p>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onPrimaryAction} isLoading={isBusy}>
          {primaryActionLabel}
        </Button>
        <Button variant="secondary" onClick={onViewStats} disabled={isBusy}>
          통계 보기
        </Button>
        <Button variant="text" onClick={onGoHome} disabled={isBusy}>
          홈으로
        </Button>
      </div>
    </div>
  );
}
