import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./app/router";
import { initializeDatabase } from "./db/bootstrap/initializeDatabase";
import "./shared/styles/globals.css";

function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    initializeDatabase()
      .then(() => setStatus("ready"))
      .catch((error) => {
        console.error("DB 초기화 실패:", error);
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
        데이터베이스 초기화 중…
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
          데이터베이스 초기화에 실패했습니다
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
