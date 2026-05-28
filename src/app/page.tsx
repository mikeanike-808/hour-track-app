'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AppState } from '@/lib/types';
import type { Session } from '@/lib/types';
import ClockPanel from '@/components/ClockPanel';
import DailyLog from '@/components/DailyLog';

export default function TodayPage() {
  const [appState, setAppState] = useState<AppState>({ status: 'IDLE', activeSession: null });
  const [sessions, setSessions] = useState<Session[]>([]);

  const refresh = useCallback(async () => {
    const [stateRes, sessionsRes] = await Promise.all([
      fetch('/api/state'),
      fetch('/api/sessions/today'),
    ]);
    const [stateData, sessionsData] = await Promise.all([
      stateRes.json(),
      sessionsRes.json(),
    ]);
    setAppState(stateData);
    setSessions(sessionsData.sessions ?? []);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="flex flex-col gap-4">
      <ClockPanel state={appState} onAction={refresh} />
      <DailyLog sessions={sessions} status={appState.status} />
    </div>
  );
}
