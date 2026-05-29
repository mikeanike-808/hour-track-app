import { NextResponse } from 'next/server';
import { getState } from '@/lib/sessions';

export async function GET() {
  try {
    return NextResponse.json(await getState());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
