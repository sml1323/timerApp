import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { TimerApp } from "./app/TimerApp";
import { isTauriRuntime } from "./platform/runtime/runtime-detect";
import { recoverAbandonedSessions } from "./platform/browser/session-adapter";
import "./shared/styles/globals.css";

/**
 * 런타임 환경에 맞는 앱 초기화를 수행한다.
 * Tauri: SQLite DB 연결 검증
 * 브라우저: QA mode seed 데이터 주입
 */
async function initializeAppRuntime(): Promise<void> {
  if (isTauriRuntime()) {
    const { initializeDatabase } = await import("./db/bootstrap/initializeDatabase");
    await initializeDatabase();
    await runSessionRecovery();
    return;
  }

  // 브라우저 QA mode (DEV only)
  if (import.meta.env.DEV) {
    const { initializeBrowserQaRuntime } = await import("./platform/browser/browser-qa-bootstrap");
    await initializeBrowserQaRuntime();
    await runSessionRecovery();
    return;
  }

  // production 브라우저 접근 — 에러 유도
  throw new Error("This app is available only in the desktop environment.");
}

/**
 * 방치된 running 세션을 복구한다.
 * 부트스트랩을 중단하지 않으며 결과만 로깅한다.
 */
async function runSessionRecovery(): Promise<void> {
  try {
    const result = await recoverAbandonedSessions();
    if (result.ok && result.data > 0) {
      console.info(`[Recovery] Recovered ${result.data} abandoned sessions to interrupted.`);
    } else if (!result.ok) {
      console.warn(`[Recovery] Session recovery failed: ${result.message}`);
    }
  } catch (error) {
    console.warn('[Recovery] Unexpected error while recovering sessions:', error);
  }
}

function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    initializeAppRuntime()
      .then(() => setStatus("ready"))
      .catch((error) => {
        console.error("App initialization failed:", error);
        setErrorMessage(
          error instanceof Error ? error.message : String(error)
        );
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "var(--font-family-base, sans-serif)",
          color: "var(--color-text-secondary, #888)",
        }}
      >
        {isTauriRuntime() ? "Initializing database..." : "Initializing QA mode..."}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "var(--font-family-base, sans-serif)",
        }}
      >
        <h1 style={{ color: "var(--color-error, #e53e3e)", fontSize: "1.25rem" }}>
          {isTauriRuntime()
            ? "Database initialization failed"
            : "App initialization failed"}
        </h1>
        <p style={{ color: "var(--color-text-secondary, #888)", textAlign: "center" }}>
          Restart the app. If the problem continues, remove the app data and try again.
        </p>
        {errorMessage && (
          <details style={{ color: "var(--color-text-tertiary, #666)", fontSize: "0.875rem" }}>
            <summary>Technical details</summary>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {errorMessage}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return <TimerApp />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
