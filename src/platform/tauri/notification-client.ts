import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';

/**
 * macOS 알림을 발송한다.
 * 알림은 보조 기능으로, 실패해도 핵심 흐름에 영향을 주지 않는다.
 */
export async function sendSessionNotification(
  title: string,
  body: string,
): Promise<void> {
  try {
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
