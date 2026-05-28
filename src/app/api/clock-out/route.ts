import { NextResponse } from 'next/server';
import { clockOut } from '@/lib/sessions';

export function POST() {
  try {
    const session = clockOut();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
