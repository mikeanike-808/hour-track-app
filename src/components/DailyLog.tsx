'use client';

import type { Session, Status } from '@/lib/types';
import { computeNetMs, formatTime, msToHm } from '@/lib/format';

type Props = {
  sessions: Session[];
  status: Status;
};

export default function DailyLog({ sessions, status }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          Today
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No sessions yet.
        </p>
      </div>
    );
  }

  const totalMs = sessions.reduce((sum, s) => {
    const sessionStatus = !s.clockOut
      ? status === 'ON_BREAK' ? 'ON_BREAK' : 'WORKING'
      : undefined;
    return sum + computeNetMs(s, sessionStatus as Status | undefined);
  }, 0);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Today
        </h2>
        <span className="text-sm font-semibold">{msToHm(totalMs)}</span>
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map(s => {
          const isActive = !s.clockOut;
          const sessionStatus = isActive
            ? status === 'ON_BREAK' ? 'ON_BREAK' : 'WORKING'
            : undefined;
          const net = computeNetMs(s, sessionStatus as Status | undefined);

          return (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: 'var(--green)' }}
                  />
                )}
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(s.clockIn)}
                  {s.clockOut ? ` → ${formatTime(s.clockOut)}` : ' → now'}
                </span>
              </div>
              <span className="text-sm font-medium">{msToHm(net)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
