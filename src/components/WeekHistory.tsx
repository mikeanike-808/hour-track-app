'use client';

import type { Session } from '@/lib/types';
import { computeNetMs, msToHm, getWeekDays, getDayLabel } from '@/lib/format';

type WeekData = {
  weekStart: string;
  sessions: Session[];
};

type Props = {
  weeks: WeekData[];
};

export default function WeekHistory({ weeks }: Props) {
  if (weeks.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No history yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {weeks.map(({ weekStart, sessions }) => {
        const days = getWeekDays(weekStart);
        const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
          (acc[s.date] ??= []).push(s);
          return acc;
        }, {});

        const weekTotal = sessions.reduce((sum, s) => sum + computeNetMs(s), 0);
        const [y, m, d] = weekStart.split('-');
        const label = `Week of ${parseInt(m)}/${parseInt(d)}/${y}`;

        return (
          <div
            key={weekStart}
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-sm font-semibold">{msToHm(weekTotal)}</span>
            </div>

            <div className="flex gap-1">
              {days.map((date, i) => {
                const dayMs = (byDate[date] ?? []).reduce((sum, s) => sum + computeNetMs(s), 0);
                const pct = Math.min(100, (dayMs / (9 * 3600 * 1000)) * 100);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-16 rounded flex flex-col justify-end overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                      {dayMs > 0 && (
                        <div
                          className="w-full rounded"
                          style={{ height: `${pct}%`, background: '#3b82f6' }}
                        />
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getDayLabel(i)[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
