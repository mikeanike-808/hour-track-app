import { NextResponse } from 'next/server';
import { getAllWeekStarts, getWeekSessions } from '@/lib/sessions';

export function GET() {
  try {
    const weekStarts = getAllWeekStarts();
    const weeks = weekStarts.map(start => ({
      weekStart: start,
      sessions: getWeekSessions(start),
    }));
    return NextResponse.json({ weeks });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
