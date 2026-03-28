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

const SEGMENT_COUNT = 4;

export function SessionFocusTimer({
  phaseType,
  formattedTime,
  progressPercent,
  topicName,
  remainingSec,
  onInterrupt,
  isBusy = false,
}: SessionFocusTimerProps) {
  const statusText = getSessionStatusText(phaseType, remainingSec);
  const clampedProgress = Math.max(0, Math.min(progressPercent, 100));
  const completedSegments = Math.min(
    SEGMENT_COUNT,
    Math.floor(clampedProgress / (100 / SEGMENT_COUNT)),
  );
  const activeSegment = clampedProgress >= 100
    ? -1
    : Math.min(SEGMENT_COUNT - 1, Math.floor(clampedProgress / (100 / SEGMENT_COUNT)));
  const remainingLabel = remainingSec > 0
    ? `${Math.ceil(remainingSec / 60)}분 남음`
    : '완료 준비됨';
  const phaseLabel = phaseType === 'study' ? '학습 집중' : '휴식 중';
  const topicLabel = topicName || (phaseType === 'study' ? '현재 집중' : '짧은 휴식');

  return (
    <div className={styles.timerContainer}>
      <section className={styles.timerCard} aria-label="집중 타이머">
        <div className={styles.timerHeader}>
          <span className={styles.phaseLabel}>{phaseLabel}</span>
          <p className={styles.topicName} title={topicLabel}>
            {topicLabel}
          </p>
        </div>

        <div className={styles.timeDisplay}>
          <div className={styles.breathingWrapper}>
            <span
              className={styles.timerText}
              role="timer"
              aria-live="polite"
              aria-label={`남은 시간 ${formattedTime}`}
            >
              {formattedTime}
            </span>
          </div>
          <p className={styles.statusText} aria-live="polite">
            {statusText}
          </p>
        </div>

        <div className={styles.segmentRail} aria-hidden="true">
          {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
            const stateClass = index < completedSegments
              ? styles.segmentDone
              : index === activeSegment
                ? styles.segmentActive
                : styles.segmentIdle;

            return (
              <span
                key={index}
                className={`${styles.segment} ${stateClass}`}
              />
            );
          })}
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaText}>{remainingLabel}</span>
          <span className={styles.metaDivider} aria-hidden="true" />
          <span className={styles.metaText}>{Math.round(clampedProgress)}% 완료</span>
        </div>

        <button
          className={styles.interruptButton}
          onClick={onInterrupt}
          type="button"
          disabled={isBusy}
        >
          세션 종료
        </button>
      </section>
    </div>
  );
}
