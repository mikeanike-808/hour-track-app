import { NextResponse } from 'next/server';
import { getTodaySessions } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ sessions: await getTodaySessions() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
