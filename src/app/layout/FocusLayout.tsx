import { Outlet, Link } from 'react-router';
import { useSessionStore } from '../../features/session/state/sessionStore';
import styles from './FocusLayout.module.css';

export function FocusLayout() {
  const sessionPhase = useSessionStore((state) => state.sessionPhase);
  const showHomeLink = sessionPhase !== 'running';

  return (
    <div className={styles.focusShell}>
      <header className={styles.header}>
        {showHomeLink ? (
          <Link to="/" className={styles.backLink}>
            ← 홈으로
          </Link>
        ) : (
          <span className={styles.modeLabel}>집중 모드</span>
        )}
      </header>
      <main className={styles.focusContent}>
        <Outlet />
      </main>
    </div>
  );
}
