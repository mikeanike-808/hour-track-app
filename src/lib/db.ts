import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const g = global as typeof global & { _db?: Database.Database };

if (!g._db) {
  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  g._db = new Database(path.join(dataDir, 'hours.db'));
  g._db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      clock_in INTEGER NOT NULL,
      clock_out INTEGER,
      breaks TEXT NOT NULL DEFAULT '[]'
    )
  `);
}

export default g._db!;
