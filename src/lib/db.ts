import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;
let initialized = false;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL environment variable is not set');
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function getDb() {
  const db = getClient();
  if (!initialized) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        clock_in INTEGER NOT NULL,
        clock_out INTEGER,
        breaks TEXT NOT NULL DEFAULT '[]'
      )
    `);
    initialized = true;
  }
  return db;
}
