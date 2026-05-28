import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getWeekSessions } from '@/lib/sessions';
import { currentMondayStr } from '@/lib/format';

export function GET(req: NextRequest) {
  try {
    const start = req.nextUrl.searchParams.get('start') ?? currentMondayStr();
    return NextResponse.json({ sessions: getWeekSessions(start), weekStart: start });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
