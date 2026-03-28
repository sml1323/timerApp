import { useEffect, useRef } from 'react';
import styles from './KebabMenu.module.css';

type OverlayType = 'stats' | 'topics' | 'goals' | 'records';

interface KebabMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenOverlay: (type: OverlayType) => void;
  onInterrupt?: () => void;
  showInterrupt: boolean;
  isBusy?: boolean;
}

export function KebabMenu({
  open,
  onClose,
  onOpenOverlay,
  onInterrupt,
  showInterrupt,
  isBusy = false,
}: KebabMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleItem = (type: OverlayType) => {
    onClose();
    onOpenOverlay(type);
  };

  return (
    <div className={styles.menu} ref={menuRef} role="menu">
      <button className={styles.item} onClick={() => handleItem('stats')} type="button" role="menuitem">
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="8" width="3" height="7" rx="1" fill="currentColor" />
            <rect x="6.5" y="4" width="3" height="11" rx="1" fill="currentColor" />
            <rect x="12" y="1" width="3" height="14" rx="1" fill="currentColor" />
          </svg>
        </span>
        통계
      </button>
      <button className={styles.item} onClick={() => handleItem('topics')} type="button" role="menuitem">
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
          </svg>
        </span>
        주제 관리
      </button>
      <button className={styles.item} onClick={() => handleItem('goals')} type="button" role="menuitem">
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
        </span>
        주간 목표
      </button>
      <button className={styles.item} onClick={() => handleItem('records')} type="button" role="menuitem">
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 2h10v12H3z" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
            <path d="M5 5h6M5 8h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </span>
        기록
      </button>
      {showInterrupt && (
        <button
          className={`${styles.item} ${styles.danger}`}
          onClick={() => { onClose(); onInterrupt?.(); }}
          type="button"
          role="menuitem"
          disabled={isBusy}
        >
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
            </svg>
          </span>
          세션 종료
        </button>
      )}
    </div>
  );
}
