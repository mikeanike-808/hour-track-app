import { getDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Break, Session, Status, AppState } from './types';

type Row = Record<string, unknown>;

function parseRow(row: Row): Session {
  return {
    id: row.id as string,
    date: row.date as string,
    clockIn: Number(row.clock_in),
    clockOut: row.clock_out != null ? Number(row.clock_out) : undefined,
    breaks: JSON.parse(row.breaks as string) as Break[],
  };
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getState(): Promise<AppState> {
  const db = await getDb();
  const result = await db.execute(
    'SELECT * FROM sessions WHERE clock_out IS NULL ORDER BY clock_in DESC LIMIT 1'
  );
  const row = result.rows[0];

  if (!row) return { status: 'IDLE', activeSession: null };

  const session = parseRow(row as Row);
  const lastBreak = session.breaks[session.breaks.length - 1];
  const status: Status = lastBreak && lastBreak.end == null ? 'ON_BREAK' : 'WORKING';

  return { status, activeSession: session };
}

export async function clockIn(): Promise<Session> {
  const { status } = await getState();
  if (status !== 'IDLE') throw new Error('Already clocked in');

  const id = uuidv4();
  const now = Date.now();
  const date = todayStr();
  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO sessions (id, date, clock_in, breaks) VALUES (?, ?, ?, ?)',
    args: [id, date, now, '[]'],
  });
  return { id, date, clockIn: now, breaks: [] };
}

export async function clockOut(): Promise<Session> {
  const { status, activeSession } = await getState();
  if (!activeSession || status === 'IDLE') throw new Error('Not clocked in');

  let { breaks } = activeSession;
  const db = await getDb();
  if (status === 'ON_BREAK') {
    breaks = breaks.map((b, i) =>
      i === breaks.length - 1 ? { ...b, end: Date.now() } : b
    );
    await db.execute({
      sql: 'UPDATE sessions SET breaks = ? WHERE id = ?',
      args: [JSON.stringify(breaks), activeSession.id],
    });
  }

  const now = Date.now();
  await db.execute({
    sql: 'UPDATE sessions SET clock_out = ? WHERE id = ?',
    args: [now, activeSession.id],
  });
  return { ...activeSession, breaks, clockOut: now };
}

export async function startBreak(): Promise<Session> {
  const { status, activeSession } = await getState();
  if (!activeSession || status !== 'WORKING') throw new Error('Not working');

  const breaks: Break[] = [...activeSession.breaks, { start: Date.now() }];
  const db = await getDb();
  await db.execute({
    sql: 'UPDATE sessions SET breaks = ? WHERE id = ?',
    args: [JSON.stringify(breaks), activeSession.id],
  });
  return { ...activeSession, breaks };
}

export async function endBreak(): Promise<Session> {
  const { status, activeSession } = await getState();
  if (!activeSession || status !== 'ON_BREAK') throw new Error('Not on break');

  const breaks = activeSession.breaks.map((b, i) =>
    i === activeSession.breaks.length - 1 ? { ...b, end: Date.now() } : b
  );
  const db = await getDb();
  await db.execute({
    sql: 'UPDATE sessions SET breaks = ? WHERE id = ?',
    args: [JSON.stringify(breaks), activeSession.id],
  });
  return { ...activeSession, breaks };
}

export async function getTodaySessions(): Promise<Session[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE date = ? ORDER BY clock_in',
    args: [todayStr()],
  });
  return result.rows.map(r => parseRow(r as Row));
}

export async function getWeekSessions(weekStart: string): Promise<Session[]> {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const endStr = end.toISOString().split('T')[0];

  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE date >= ? AND date < ? ORDER BY clock_in',
    args: [weekStart, endStr],
  });
  return result.rows.map(r => parseRow(r as Row));
}

export async function getAllWeekStarts(): Promise<string[]> {
  const db = await getDb();
  const result = await db.execute(
    'SELECT DISTINCT date FROM sessions ORDER BY date DESC'
  );

  const weeks = new Set<string>();
  for (const row of result.rows) {
    const date = row.date as string;
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    weeks.add(d.toISOString().split('T')[0]);
  }

  return Array.from(weeks).sort().reverse();
}
