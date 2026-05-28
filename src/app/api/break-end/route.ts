import { NextResponse } from 'next/server';
import { endBreak } from '@/lib/sessions';

export function POST() {
  try {
    const session = endBreak();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
