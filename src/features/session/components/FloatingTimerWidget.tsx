import { useState, useRef, useCallback, useEffect } from 'react';
import type { SessionPhaseType } from '../../../domain/sessions/session';
import styles from './FloatingTimerWidget.module.css';

interface FloatingTimerWidgetProps {
  phaseType: SessionPhaseType;
  formattedTime: string;
  progressPercent: number;
  topicName: string;
  isRunning: boolean;
  onInterrupt: () => void;
  onViewStats?: () => void;
  onGoHome?: () => void;
  onClose?: () => void;
  isBusy?: boolean;
}

const SEGMENT_COUNT = 4;

export function FloatingTimerWidget({
  phaseType,
  formattedTime,
  progressPercent,
  topicName,
  isRunning,
  onInterrupt,
  onViewStats,
  onGoHome,
  onClose,
  isBusy = false,
}: FloatingTimerWidgetProps) {
  const [position, setPosition] = useState(() => ({
    x: Math.max(0, Math.floor((window.innerWidth - 340) / 2)),
    y: Math.max(0, Math.floor((window.innerHeight - 320) / 3)),
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const clampedProgress = Math.max(0, Math.min(progressPercent, 100));
  const completedSegments = Math.min(
    SEGMENT_COUNT,
    Math.floor(clampedProgress / (100 / SEGMENT_COUNT)),
  );
  const activeSegment =
    clampedProgress >= 100
      ? -1
      : Math.min(SEGMENT_COUNT - 1, Math.floor(clampedProgress / (100 / SEGMENT_COUNT)));

  const topicLabel = topicName || (phaseType === 'study' ? '학습' : '휴식');

  /* ---- Entry animation on mount ---- */
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- Drag logic ---- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      const rect = widgetRef.current?.getBoundingClientRect();
      if (!rect) return;
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 280, e.clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* ---- Close menu on outside click or ESC ---- */
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div
      ref={widgetRef}
      className={`${styles.widget} ${mounted ? styles.entered : ''} ${isDragging ? styles.dragging : ''}`}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="region"
      aria-label="타이머 위젯"
    >
      {/* Close button */}
      {onClose && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="타이머 닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Menu button */}
      <div className={styles.menuAnchor} ref={menuRef}>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          type="button"
          aria-label="설정 메뉴"
          aria-expanded={menuOpen}
        >
          <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="9" r="2" />
            <circle cx="2" cy="16" r="2" />
          </svg>
        </button>

        {/* Slide menu */}
        <div className={`${styles.menu} ${menuOpen ? styles.menuVisible : ''}`}>
          {onViewStats && (
            <button className={styles.menuItem} onClick={() => { setMenuOpen(false); onViewStats(); }} type="button">
              <span className={styles.menuIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="8" width="3" height="7" rx="1" fill="currentColor" />
                  <rect x="6.5" y="4" width="3" height="11" rx="1" fill="currentColor" />
                  <rect x="12" y="1" width="3" height="14" rx="1" fill="currentColor" />
                </svg>
              </span>
              통계
            </button>
          )}
          <button
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => { setMenuOpen(false); onInterrupt(); }}
            type="button"
            disabled={isBusy}
          >
            <span className={styles.menuIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
              </svg>
            </span>
            세션 종료
          </button>
          {onGoHome && (
            <button className={styles.menuItem} onClick={() => { setMenuOpen(false); onGoHome(); }} type="button">
              <span className={styles.menuIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L8 2L14 8M4 7V13.5H6.5V10H9.5V13.5H12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              홈으로
            </button>
          )}
        </div>
      </div>

      {/* Topic name */}
      <p className={styles.topicName}>{topicLabel}</p>

      {/* Timer */}
      <span
        className={styles.time}
        role="timer"
        aria-live="polite"
        aria-label={`남은 시간 ${formattedTime}`}
      >
        {formattedTime}
      </span>

      {/* Progress dots */}
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

      {/* Play / Pause indicator */}
      <div className={styles.playArea}>
        {isRunning ? (
          <div className={styles.playButton} aria-label="세션 진행 중">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
            </svg>
          </div>
        ) : (
          <div className={styles.playButton} aria-label="세션 일시정지">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
