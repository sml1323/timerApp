/**
 * Tauri 런타임 여부를 판별한다.
 * @tauri-apps/api 의 window.__TAURI_INTERNALS__ 존재 여부로 판단.
 */
export function isTauriRuntime() {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
