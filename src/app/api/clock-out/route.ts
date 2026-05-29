import { NextResponse } from 'next/server';
import { clockOut } from '@/lib/sessions';

export async function POST() {
  try {
    const session = await clockOut();
    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
