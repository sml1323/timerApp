import { Outlet } from "react-router";
import { MainNavigation } from "./MainNavigation";
import styles from "./AppShell.module.css";

export function AppShell() {
  return (
    <div className={styles.shell}>
      <MainNavigation />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
