import { isTauriRuntime } from '../runtime/runtime-detect';

/**
 * macOS 알림을 발송한다.
 * 알림은 보조 기능으로, 실패해도 핵심 흐름에 영향을 주지 않는다.
 * 브라우저 QA mode에서는 no-op으로 처리한다.
 */
export async function sendSessionNotification(
  title: string,
  body: string,
): Promise<void> {
  if (!isTauriRuntime()) {
    console.info('[QA] 알림 생략 (브라우저 환경):', title, body);
    return;
  }

  try {
    const {
      isPermissionGranted,
      requestPermission,
      sendNotification,
    } = await import('@tauri-apps/plugin-notification');

    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
      sendNotification({ title, body });
    }
  } catch {
    // 알림 실패는 무시 — 핵심 기능 차단 금지
    console.warn('알림 발송 실패');
  }
}
