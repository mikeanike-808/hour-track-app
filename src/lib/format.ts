import type { Session, Status } from './types';

export function computeNetMs(session: Session, status?: Status, now = Date.now()): number {
  const completedBreakMs = session.breaks
    .filter(b => b.end != null)
    .reduce((sum, b) => sum + (b.end! - b.start), 0);

  if (!session.clockOut && status === 'ON_BREAK') {
    const lastBreak = session.breaks[session.breaks.length - 1];
    return lastBreak.start - session.clockIn - completedBreakMs;
  }

  const end = session.clockOut ?? now;
  return Math.max(0, end - session.clockIn - completedBreakMs);
}

export function msToHHMMSS(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function msToHm(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMondayStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function getWeekDays(mondayStr: string): string[] {
  const monday = new Date(mondayStr + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function currentMondayStr(): string {
  return getMondayStr(todayStr());
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getDayLabel(index: number): string {
  return DAY_LABELS[index];
}
