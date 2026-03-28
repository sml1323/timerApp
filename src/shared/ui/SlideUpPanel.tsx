import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './SlideUpPanel.module.css';

interface SlideUpPanelProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideUpPanel({ onClose, title, children }: SlideUpPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = Math.max(0, e.clientY - startY.current);
    setDragY(delta);
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    if (dragY > 80) {
      onClose();
    } else {
      setDragY(0);
    }
  }, [dragY, onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : undefined } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div
          className={styles.handleBar}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className={styles.handle} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
