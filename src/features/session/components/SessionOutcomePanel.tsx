import { Button } from '../../../shared/ui/Button/Button';
import speakCharacter from '../../../assets/characters/speak.svg';
import defaultCharacter from '../../../assets/characters/default.svg';
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
  /** recovery variant: 이번 주 남은 목표 힌트 */
  recoveryHint?: string;
  /** recovery variant: 다른 주제 선택 핸들러 */
  onSelectOtherTopic?: () => void;
}

function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;
}

export function SessionOutcomePanel({
  variant,
  topicName,
  durationSec,
  durationLabel,
  feedbackMessage,
  primaryActionLabel,
  onPrimaryAction,
  onViewStats,
  onGoHome,
  isBusy = false,
  recoveryHint,
  onSelectOtherTopic,
}: SessionOutcomePanelProps) {
  const durationText = formatDuration(durationSec);
  const isRecovery = variant === 'recovery';

  return (
    <div className={`${styles.panel} ${isRecovery ? styles.recoveryPanel : ''}`} role="status" aria-live="polite">
      <img
        src={isRecovery ? defaultCharacter : speakCharacter}
        alt=""
        className={styles.character}
        aria-hidden="true"
      />
      <p className={styles.feedbackMessage}>{feedbackMessage}</p>

      <div className={styles.summary}>
        <p className={styles.topicName}>{topicName}</p>
        <p className={styles.duration}>{durationText} {durationLabel}</p>
      </div>

      {isRecovery && recoveryHint && (
        <p className={styles.recoveryHint}>{recoveryHint}</p>
      )}

      <div className={styles.actions}>
        <Button variant="primary" onClick={onPrimaryAction} isLoading={isBusy}>
          {primaryActionLabel}
        </Button>
        {isRecovery ? (
          <>
            <Button variant="secondary" onClick={onSelectOtherTopic ?? onGoHome} disabled={isBusy}>
              다른 주제 선택
            </Button>
            <Button variant="text" onClick={onGoHome} disabled={isBusy}>
              오늘은 여기까지
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onViewStats} disabled={isBusy}>
              통계 보기
            </Button>
            <Button variant="text" onClick={onGoHome} disabled={isBusy}>
              홈으로
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
