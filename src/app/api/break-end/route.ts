import { NextResponse } from 'next/server';
import { endBreak } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await endBreak();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
