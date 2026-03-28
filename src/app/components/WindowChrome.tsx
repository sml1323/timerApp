import styles from './WindowChrome.module.css';

interface WindowChromeProps {
  onKebabToggle: () => void;
  kebabOpen: boolean;
  onDismiss?: () => void;
  showDismiss?: boolean;
  onReset?: () => void;
  showReset?: boolean;
}

export function WindowChrome({ onKebabToggle, kebabOpen, onDismiss, showDismiss = false, onReset, showReset = false }: WindowChromeProps) {
  return (
    <div className={styles.chrome} data-tauri-drag-region>
      <div className={styles.leftGroup}>
        {showDismiss && onDismiss && (
          <button
            className={styles.actionBtn}
            onClick={onDismiss}
            type="button"
            aria-label="세션 중단"
            title="세션 중단"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {showReset && onReset && (
          <button
            className={styles.actionBtn}
            onClick={onReset}
            type="button"
            aria-label="타이머 초기화"
            title="타이머 초기화"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 1.5V5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.1 8.5A5.5 5.5 0 1 0 3 4L1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <button
        className={styles.kebabBtn}
        onClick={onKebabToggle}
        type="button"
        aria-label="메뉴"
        aria-expanded={kebabOpen}
      >
        <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="9" r="2" />
          <circle cx="2" cy="16" r="2" />
        </svg>
      </button>
    </div>
  );
}
