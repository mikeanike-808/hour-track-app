'use client';

import type { AppState } from '@/lib/types';
import { msToHHMMSS, computeNetMs } from '@/lib/format';
import { useEffect, useRef, useState } from 'react';

type Props = {
  state: AppState;
  onAction: () => void;
};

const STATUS_COLOR: Record<string, string> = {
  WORKING: 'var(--green)',
  ON_BREAK: 'var(--amber)',
  IDLE: 'var(--text-muted)',
};

const STATUS_LABEL: Record<string, string> = {
  WORKING: 'Working',
  ON_BREAK: 'On Break',
  IDLE: 'Idle',
};

export default function ClockPanel({ state, onAction }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.activeSession && state.status === 'WORKING') {
      intervalRef.current = setInterval(() => {
        setElapsed(computeNetMs(state.activeSession!, state.status));
      }, 1000);
    } else if (state.activeSession && state.status === 'ON_BREAK') {
      setElapsed(computeNetMs(state.activeSession, state.status));
    } else {
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  async function handleClock() {
    const endpoint = state.status === 'IDLE' ? '/api/clock-in' : '/api/clock-out';
    await fetch(endpoint, { method: 'POST' });
    onAction();
  }

  async function handleBreak() {
    const endpoint = state.status === 'WORKING' ? '/api/break-start' : '/api/break-end';
    await fetch(endpoint, { method: 'POST' });
    onAction();
  }

  const color = STATUS_COLOR[state.status];

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center gap-6"
      style={{ background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="text-sm font-medium" style={{ color }}>
          {STATUS_LABEL[state.status]}
        </span>
      </div>

      {state.activeSession ? (
        <div
          className="text-5xl font-mono font-semibold tabular-nums tracking-tight"
          style={{ color: state.status === 'ON_BREAK' ? 'var(--amber)' : 'var(--text)' }}
        >
          {msToHHMMSS(elapsed)}
        </div>
      ) : (
        <div className="text-5xl font-mono font-semibold tabular-nums tracking-tight text-slate-600">
          --:--:--
        </div>
      )}

      <button
        onClick={handleClock}
        className="w-full py-3 rounded-xl text-base font-semibold transition-all active:scale-95"
        style={{
          background: state.status === 'IDLE' ? 'var(--green)' : 'var(--red)',
          color: '#fff',
        }}
      >
        {state.status === 'IDLE' ? 'Clock In' : 'Clock Out'}
      </button>

      {state.status !== 'IDLE' && (
        <button
          onClick={handleBreak}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{
            background: 'var(--surface-2)',
            color: state.status === 'ON_BREAK' ? 'var(--green)' : 'var(--amber)',
          }}
        >
          {state.status === 'ON_BREAK' ? 'End Break' : 'Start Break'}
        </button>
      )}
    </div>
  );
}
