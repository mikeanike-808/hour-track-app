import { NextResponse } from 'next/server';
import { startBreak } from '@/lib/sessions';

export async function POST() {
  try {
    const session = await startBreak();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
