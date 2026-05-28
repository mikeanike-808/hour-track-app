import { NextResponse } from 'next/server';
import { startBreak } from '@/lib/sessions';

export function POST() {
  try {
    const session = startBreak();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
