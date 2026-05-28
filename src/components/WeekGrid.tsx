'use client';

import type { Session } from '@/lib/types';
import { computeNetMs, msToHm, getWeekDays, getDayLabel, todayStr } from '@/lib/format';

type Props = {
  sessions: Session[];
  weekStart: string;
};

const MAX_BAR_MS = 9 * 3600 * 1000; // 9h = full bar width

export default function WeekGrid({ sessions, weekStart }: Props) {
  const days = getWeekDays(weekStart);
  const today = todayStr();

  const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});

  const dayTotals = days.map(date => ({
    date,
    ms: (byDate[date] ?? []).reduce((sum, s) => sum + computeNetMs(s), 0),
  }));

  const weekTotal = dayTotals.reduce((sum, d) => sum + d.ms, 0);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--surface)' }}>
      <div className="flex flex-col gap-3">
        {dayTotals.map(({ date, ms }, i) => {
          const isToday = date === today;
          const barPct = Math.min(100, (ms / MAX_BAR_MS) * 100);
          const [, month, day] = date.split('-');
          return (
            <div key={date} className="flex items-center gap-3">
              <div className="w-8 text-xs font-medium text-right" style={{ color: isToday ? 'var(--text)' : 'var(--text-muted)' }}>
                {getDayLabel(i)}
              </div>
              <div className="text-xs w-10" style={{ color: 'var(--text-muted)' }}>
                {parseInt(month)}/{parseInt(day)}
              </div>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                {ms > 0 && (
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barPct}%`,
                      background: isToday ? 'var(--green)' : '#3b82f6',
                    }}
                  />
                )}
              </div>
              <div className="w-12 text-xs text-right font-medium" style={{ color: ms > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                {ms > 0 ? msToHm(ms) : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Week total</span>
        <span className="text-sm font-semibold">{weekTotal > 0 ? msToHm(weekTotal) : '—'}</span>
      </div>
    </div>
  );
}
