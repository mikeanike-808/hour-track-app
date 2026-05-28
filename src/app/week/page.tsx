'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@/lib/types';
import WeekGrid from '@/components/WeekGrid';
import { currentMondayStr, getMondayStr } from '@/lib/format';

export default function WeekPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weekStart, setWeekStart] = useState(currentMondayStr());

  useEffect(() => {
    fetch(`/api/sessions/week?start=${weekStart}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []));
  }, [weekStart]);

  function shiftWeek(delta: number) {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  }

  const isCurrentWeek = weekStart === currentMondayStr();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftWeek(-1)}
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          ← Prev
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {isCurrentWeek ? 'This Week' : `Week of ${weekStart}`}
        </span>
        <button
          onClick={() => shiftWeek(1)}
          disabled={isCurrentWeek}
          className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          Next →
        </button>
      </div>

      <WeekGrid sessions={sessions} weekStart={weekStart} />
    </div>
  );
}
