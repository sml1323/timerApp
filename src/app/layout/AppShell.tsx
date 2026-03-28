import { Outlet } from "react-router";
import { MainNavigation } from "./MainNavigation";
import { useSessionStore } from "../../features/session/state/sessionStore";
import { derivePosture } from "../../features/session/state/derivePosture";
import styles from "./AppShell.module.css";

export function AppShell() {
  const sessionPhase = useSessionStore((s) => s.sessionPhase);
  const activeSession = useSessionStore((s) => s.activeSession);

  const phaseType = activeSession?.phaseType ?? null;
  // isRunning must reflect whether the timer is actually ticking,
  // not just whether the session phase is 'running'.
  // For now, running phase always means ticking (no pause feature yet).
  // When pause is added, this should read from a dedicated store field.
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
