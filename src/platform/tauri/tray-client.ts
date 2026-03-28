import { isTauriRuntime } from '../runtime/runtime-detect';

let lastSyncedTitle: string | null | undefined;

export async function syncTraySessionTimerText(title: string | null): Promise<void> {
  if (!isTauriRuntime()) {
    return;
  }

  if (lastSyncedTitle === title) {
    return;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_tray_title', { title });
    lastSyncedTitle = title;
  } catch (error) {
    lastSyncedTitle = undefined;
    console.warn('Failed to sync tray title:', error);
  }
}
