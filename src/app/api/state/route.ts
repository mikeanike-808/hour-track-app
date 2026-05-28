import { NextResponse } from 'next/server';
import { getState } from '@/lib/sessions';

export function GET() {
  try {
    return NextResponse.json(getState());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
