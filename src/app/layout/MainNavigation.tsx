import { NavLink } from "react-router";
import styles from "./MainNavigation.module.css";

const NAV_ITEMS = [
  { to: "/", label: "홈", icon: "⏱" },
  { to: "/topics", label: "주제", icon: "★" },
  { to: "/stats", label: "통계", icon: "▦" },
] as const;

export function MainNavigation() {
  return (
    <nav className={styles.nav} aria-label="메인 내비게이션">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon} aria-hidden="true">
                {icon}
              </span>
              <span className={styles.label}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
