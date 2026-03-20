import type { GoalProgress } from '../goal-service';
import styles from './GoalProgressInline.module.css';

interface GoalProgressInlineProps {
  progress: GoalProgress;
  variant?: 'default' | 'compact';
}

function getProgressMessage(progress: GoalProgress, variant: 'default' | 'compact'): string {
  const { targetMinutes, actualMinutes, remainingMinutes, isAchieved } = progress;

  if (variant === 'compact') {
    return `${actualMinutes}/${targetMinutes}분`;
  }

  if (actualMinutes === 0) {
    return `이번 주 ${targetMinutes}분 목표, 시작해볼까요?`;
  }

  if (isAchieved && actualMinutes > targetMinutes) {
    const excess = actualMinutes - targetMinutes;
    return `목표를 ${excess}분 초과 달성했어요`;
  }

  if (isAchieved) {
    return '이번 주 목표 달성! 🎉';
  }

  return `이번 주 ${remainingMinutes}분 남았어요`;
}

export function GoalProgressInline({ progress, variant = 'default' }: GoalProgressInlineProps) {
  const { actualMinutes, targetMinutes, progressPercent, isAchieved } = progress;
  const message = getProgressMessage(progress, variant);
  const isExceeded = actualMinutes > targetMinutes;

  const barClassName = [
    styles.bar,
    isAchieved ? styles.barAchieved : '',
    isExceeded ? styles.barExceeded : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'compact') {
    return (
      <div className={styles.compact}>
        <div className={styles.miniBarTrack}>
          <div
            className={barClassName}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`목표 진행률 ${progressPercent}%`}
          />
        </div>
        <span className={styles.compactText}>{message}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.barTrack}>
        <div
          className={barClassName}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`목표 진행률 ${progressPercent}%`}
        />
      </div>
      <div className={styles.details}>
        <span className={styles.timeText}>
          {actualMinutes}분 / {targetMinutes}분
        </span>
        <span className={styles.percentText}>{progressPercent}%</span>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
