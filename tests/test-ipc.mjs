import test from 'node:test';

globalThis.window = globalThis;
globalThis.__TAURI_INTERNALS__ = {
  invoke: async (cmd, args) => {
    console.log('Tauri IPC:', cmd, args);
    if (cmd === 'plugin:sql|load') return 'db-1';
    if (cmd === 'plugin:sql|select') return [{ id: 'mock' }];
    if (cmd === 'plugin:sql|execute') return { rowsAffected: 1 };
    return null;
  }
};

test('tauri ipc mock', async () => {
  const { select } = await import('../.test-dist/src/platform/tauri/sql-client.js');
  const res = await select('SELECT 1');
  console.log('Result:', res);
});
