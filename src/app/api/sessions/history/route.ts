import { NextResponse } from 'next/server';
import { getAllWeekStarts, getWeekSessions } from '@/lib/sessions';

export async function GET() {
  try {
    const weekStarts = await getAllWeekStarts();
    const weeks = await Promise.all(
      weekStarts.map(async start => ({
        weekStart: start,
        sessions: await getWeekSessions(start),
      }))
    );
    return NextResponse.json({ weeks });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
