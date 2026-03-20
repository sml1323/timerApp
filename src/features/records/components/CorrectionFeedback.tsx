import { useEffect, useRef, useCallback } from 'react';
import speakCharacter from '../../../assets/characters/speak.svg';
import styles from './CorrectionFeedback.module.css';

interface CorrectionFeedbackProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function CorrectionFeedback({ isVisible, onDismiss }: CorrectionFeedbackProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(onDismiss, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, onDismiss]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDismiss();
    }
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={styles.feedback}
      role="status"
      aria-live="polite"
      tabIndex={0}
      onClick={onDismiss}
      onKeyDown={handleKeyDown}
    >
      <img
        src={speakCharacter}
        alt=""
        aria-hidden="true"
        className={styles.character}
      />
      <p className={styles.message}>기록이 수정되었습니다. 통계에 반영되었어요.</p>
    </div>
  );
}
