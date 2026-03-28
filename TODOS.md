# TODOS

## Component Test Infrastructure
**What:** Install vitest + React Testing Library. Migrate existing 16 `node:test` files. Add component tests for new UI components (TimerApp, TopicDropdown, SlideUpPanel, WindowChrome, overlays).
**Why:** 0% UI test coverage after the Flow-Minimal rewrite adds 12 new components. Domain tests exist but can't catch rendering bugs, interaction issues, or accessibility regressions.
**Context:** Current tests use Node.js native `node:test` module in `.test.mjs` files, compiled via `tsconfig.tests.json` to `.test-dist/`. Vitest is the natural upgrade path for a Vite-based project. RTL enables component-level testing without a browser.
**Depends on:** Flow-Minimal UI rewrite completed (this is the codebase the tests will cover).
**Effort:** human: ~4h / CC: ~20min

## Keyboard Shortcuts for Window Management
**What:** Add Cmd+W (close window) and Cmd+Q (quit app) keyboard shortcuts via Tauri's globalShortcut plugin.
**Why:** With `decorations: false`, native macOS window shortcuts don't work. Users expect Cmd+W to close the window. Currently only the red dot button works.
**Context:** Tauri v2 has `@tauri-apps/plugin-global-shortcut`. The close action should match the red dot behavior (just close, rely on abandoned session recovery).
**Depends on:** Flow-Minimal UI rewrite completed (WindowChrome component must exist).
**Effort:** human: ~1h / CC: ~5min
