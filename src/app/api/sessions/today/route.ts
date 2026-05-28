import { NextResponse } from 'next/server';
import { getTodaySessions } from '@/lib/sessions';

export function GET() {
  try {
    return NextResponse.json({ sessions: getTodaySessions() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
