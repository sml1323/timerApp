import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/router";
import { isTauriRuntime } from "./platform/runtime/runtime-detect";
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
    return;
  }

  // 브라우저 QA mode (DEV only)
  if (import.meta.env.DEV) {
    const { initializeBrowserQaRuntime } = await import("./platform/browser/browser-qa-bootstrap");
    await initializeBrowserQaRuntime();
    return;
  }

  // production 브라우저 접근 — 에러 유도
  throw new Error("이 앱은 데스크톱 환경에서만 실행할 수 있습니다.");
}

function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    initializeAppRuntime()
      .then(() => setStatus("ready"))
      .catch((error) => {
        console.error("앱 초기화 실패:", error);
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
        {isTauriRuntime() ? "데이터베이스 초기화 중…" : "QA 모드 초기화 중…"}
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
            ? "데이터베이스 초기화에 실패했습니다"
            : "앱 초기화에 실패했습니다"}
        </h1>
        <p style={{ color: "var(--color-text-secondary, #888)", textAlign: "center" }}>
          앱을 다시 시작해 주세요. 문제가 지속되면 앱 데이터를 삭제 후 재시도하세요.
        </p>
        {errorMessage && (
          <details style={{ color: "var(--color-text-tertiary, #666)", fontSize: "0.875rem" }}>
            <summary>기술 상세</summary>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {errorMessage}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
