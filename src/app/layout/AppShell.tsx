import { Outlet } from "react-router";
import { MainNavigation } from "./MainNavigation";
import { useSessionStore } from "../../features/session/state/sessionStore";
import { derivePosture } from "../../features/session/state/derivePosture";
import styles from "./AppShell.module.css";

export function AppShell() {
  const sessionPhase = useSessionStore((s) => s.sessionPhase);
  const activeSession = useSessionStore((s) => s.activeSession);

  const phaseType = activeSession?.phaseType ?? null;
  const isRunning = sessionPhase === 'running';
  const posture = derivePosture(sessionPhase, phaseType, isRunning);

  return (
    <div className={styles.shell} data-posture={posture}>
      <div className={styles.glow} aria-hidden="true" />
      <MainNavigation />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
