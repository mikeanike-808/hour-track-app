import { NextResponse } from 'next/server';
import { clockIn } from '@/lib/sessions';

export async function POST() {
  try {
    const session = await clockIn();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
