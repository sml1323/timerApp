import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router';
import { useSessionStore } from '../../features/session/state/sessionStore';
import styles from './FocusLayout.module.css';

const CLOCK_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function FocusLayout() {
  const sessionPhase = useSessionStore((state) => state.sessionPhase);
  const showHomeLink = sessionPhase !== 'running';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const currentTime = CLOCK_FORMATTER.format(now);

  return (
    <div className={styles.focusShell}>
      <div className={styles.ambientGlow} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerSide}>
          {showHomeLink ? (
            <Link to="/" className={styles.backLink} aria-label="Go home">
              ←
            </Link>
          ) : (
            <span className={styles.modePill}>Focus</span>
          )}
        </div>
        <div className={styles.clockPill} aria-label={`Current time ${currentTime}`}>
          {currentTime}
        </div>
        <div className={styles.headerSide} aria-hidden="true" />
      </header>
      <main className={styles.focusContent}>
        <Outlet />
      </main>
    </div>
  );
}
