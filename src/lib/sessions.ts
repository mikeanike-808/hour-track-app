import db from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Break, Session, Status, AppState } from './types';

function parseRow(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    date: row.date as string,
    clockIn: row.clock_in as number,
    clockOut: (row.clock_out as number | null) ?? undefined,
    breaks: JSON.parse(row.breaks as string) as Break[],
  };
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getState(): AppState {
  const row = db
    .prepare('SELECT * FROM sessions WHERE clock_out IS NULL ORDER BY clock_in DESC LIMIT 1')
    .get() as Record<string, unknown> | undefined;

  if (!row) return { status: 'IDLE', activeSession: null };

  const session = parseRow(row);
  const lastBreak = session.breaks[session.breaks.length - 1];
  const status: Status = lastBreak && lastBreak.end == null ? 'ON_BREAK' : 'WORKING';

  return { status, activeSession: session };
}

export function clockIn(): Session {
  const { status } = getState();
  if (status !== 'IDLE') throw new Error('Already clocked in');

  const id = uuidv4();
  const now = Date.now();
  const date = todayStr();
  db.prepare('INSERT INTO sessions (id, date, clock_in, breaks) VALUES (?, ?, ?, ?)').run(
    id, date, now, '[]'
  );
  return { id, date, clockIn: now, breaks: [] };
}

export function clockOut(): Session {
  const { status, activeSession } = getState();
  if (!activeSession || status === 'IDLE') throw new Error('Not clocked in');

  let { breaks } = activeSession;
  if (status === 'ON_BREAK') {
    breaks = breaks.map((b, i) =>
      i === breaks.length - 1 ? { ...b, end: Date.now() } : b
    );
    db.prepare('UPDATE sessions SET breaks = ? WHERE id = ?').run(
      JSON.stringify(breaks), activeSession.id
    );
  }

  const now = Date.now();
  db.prepare('UPDATE sessions SET clock_out = ? WHERE id = ?').run(now, activeSession.id);
  return { ...activeSession, breaks, clockOut: now };
}

export function startBreak(): Session {
  const { status, activeSession } = getState();
  if (!activeSession || status !== 'WORKING') throw new Error('Not working');

  const breaks: Break[] = [...activeSession.breaks, { start: Date.now() }];
  db.prepare('UPDATE sessions SET breaks = ? WHERE id = ?').run(
    JSON.stringify(breaks), activeSession.id
  );
  return { ...activeSession, breaks };
}

export function endBreak(): Session {
  const { status, activeSession } = getState();
  if (!activeSession || status !== 'ON_BREAK') throw new Error('Not on break');

  const breaks = activeSession.breaks.map((b, i) =>
    i === activeSession.breaks.length - 1 ? { ...b, end: Date.now() } : b
  );
  db.prepare('UPDATE sessions SET breaks = ? WHERE id = ?').run(
    JSON.stringify(breaks), activeSession.id
  );
  return { ...activeSession, breaks };
}

export function getTodaySessions(): Session[] {
  const rows = db
    .prepare('SELECT * FROM sessions WHERE date = ? ORDER BY clock_in')
    .all(todayStr()) as Record<string, unknown>[];
  return rows.map(parseRow);
}

export function getWeekSessions(weekStart: string): Session[] {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const endStr = end.toISOString().split('T')[0];

  const rows = db
    .prepare('SELECT * FROM sessions WHERE date >= ? AND date < ? ORDER BY clock_in')
    .all(weekStart, endStr) as Record<string, unknown>[];
  return rows.map(parseRow);
}

export function getAllWeekStarts(): string[] {
  const rows = db
    .prepare('SELECT DISTINCT date FROM sessions ORDER BY date DESC')
    .all() as { date: string }[];

  const weeks = new Set<string>();
  for (const { date } of rows) {
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    weeks.add(d.toISOString().split('T')[0]);
  }

  return Array.from(weeks).sort().reverse();
}
