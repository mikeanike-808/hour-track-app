'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@/lib/types';
import WeekHistory from '@/components/WeekHistory';

type WeekData = { weekStart: string; sessions: Session[] };

export default function HistoryPage() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);

  useEffect(() => {
    fetch('/api/sessions/history')
      .then(r => r.json())
      .then(d => setWeeks(d.weeks ?? []));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        History
      </h2>
      <WeekHistory weeks={weeks} />
    </div>
  );
}
