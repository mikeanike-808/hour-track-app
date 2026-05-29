import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ready = client.execute(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    clock_in INTEGER NOT NULL,
    clock_out INTEGER,
    breaks TEXT NOT NULL DEFAULT '[]'
  )
`);

export async function getDb() {
  await ready;
  return client;
}
