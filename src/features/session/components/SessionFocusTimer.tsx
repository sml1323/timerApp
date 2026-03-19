import type { SessionPhaseType } from '../../../domain/sessions/session';
import { getSessionStatusText } from '../session-flow';
import styles from './SessionFocusTimer.module.css';

interface SessionFocusTimerProps {
  phaseType: SessionPhaseType;
  formattedTime: string;
  progressPercent: number;
  topicName: string;
  remainingSec: number;
  onInterrupt: () => void;
  isBusy?: boolean;
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SessionFocusTimer({
  phaseType,
  formattedTime,
  progressPercent,
  topicName,
  remainingSec,
  onInterrupt,
  isBusy = false,
}: SessionFocusTimerProps) {
  const dashOffset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;
  const statusText = getSessionStatusText(phaseType, remainingSec);

  return (
    <div className={styles.timerContainer}>
      <div className={styles.progressRing}>
        <svg
          className={styles.progressSvg}
          width="220"
          height="220"
          viewBox="0 0 220 220"
          aria-hidden="true"
        >
          <circle className={styles.progressTrack} cx="110" cy="110" r={RADIUS} />
          <circle
            className={styles.progressFill}
            cx="110"
            cy="110"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className={styles.timeDisplay}>
          <span
            className={styles.time}
            role="timer"
            aria-live="polite"
            aria-label={`남은 시간 ${formattedTime}`}
          >
            {formattedTime}
          </span>
          <span className={styles.topicName} title={topicName}>
            {topicName}
          </span>
        </div>
      </div>

      <p className={styles.statusText} aria-live="polite">
        {statusText}
      </p>

      <button
        className={styles.interruptButton}
        onClick={onInterrupt}
        type="button"
        disabled={isBusy}
      >
        중단
      </button>
    </div>
  );
}
