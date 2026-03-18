import Database from '@tauri-apps/plugin-sql';

const DB_NAME = 'sqlite:bmad_test.db';

let dbInstance: Database | null = null;

/** DB 싱글턴 인스턴스 반환. 최초 호출 시 load + 마이그레이션 자동 실행 */
export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load(DB_NAME);
  }
  return dbInstance;
}

/** SELECT 쿼리 실행 — 결과 행 배열 반환 */
export async function select<T>(query: string, bindValues?: unknown[]): Promise<T[]> {
  const db = await getDb();
  return db.select<T[]>(query, bindValues);
}

/** INSERT/UPDATE/DELETE 실행 — 영향 받은 행 수 반환 */
export async function execute(query: string, bindValues?: unknown[]): Promise<{ rowsAffected: number; lastInsertId?: number }> {
  const db = await getDb();
  return db.execute(query, bindValues);
}
