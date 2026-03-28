import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  formattedTime: string;
  progressPercent: number;
  isRunning: boolean;
  isPaused?: boolean;
  onPlay?: () => void;
  playDisabled?: boolean;
}

const SEGMENT_COUNT = 4;

export function TimerDisplay({
  formattedTime,
  progressPercent,
  isRunning,
  isPaused = false,
  onPlay,
  playDisabled = false,
}: TimerDisplayProps) {
  const clampedProgress = Math.max(0, Math.min(progressPercent, 100));
  const completedSegments = Math.min(
    SEGMENT_COUNT,
    Math.floor(clampedProgress / (100 / SEGMENT_COUNT)),
  );
  const activeSegment =
    clampedProgress >= 100
      ? -1
      : Math.min(SEGMENT_COUNT - 1, Math.floor(clampedProgress / (100 / SEGMENT_COUNT)));

  const showPauseIcon = isRunning && !isPaused;
  const label = showPauseIcon ? '일시정지' : isPaused ? '재개' : '시작';

  return (
    <div className={styles.container}>
      <span
        className={`${styles.time} ${isPaused ? styles.timePaused : ''}`}
        role="timer"
        aria-live="polite"
        aria-label={`남은 시간 ${formattedTime}`}
      >
        {formattedTime}
      </span>

      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
          const dotClass =
            i < completedSegments
              ? styles.dotDone
              : i === activeSegment
                ? styles.dotActive
                : styles.dotIdle;
          return <span key={i} className={`${styles.dot} ${dotClass}`} />;
        })}
      </div>

      <div className={styles.playArea}>
        <button
          className={styles.playBtn}
          onClick={onPlay}
          disabled={playDisabled}
          type="button"
          aria-label={label}
        >
          {showPauseIcon ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
