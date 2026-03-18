import { getDb } from '../../platform/tauri/sql-client';

/**
 * 앱 시작 시 DB 연결 확인.
 * 마이그레이션은 Rust 쪽 tauri-plugin-sql이 DB.load() 시 자동 실행.
 * 이 함수는 연결 검증 + 초기 상태 확인용.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDb();
  // 간단한 연결 검증
  await db.select<{ count: number }[]>('SELECT 1 as count');
}
