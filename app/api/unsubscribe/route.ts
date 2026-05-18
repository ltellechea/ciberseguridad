import { NextRequest, NextResponse } from 'next/server';
import { getDb, nowAR } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  try {
    const db = await getDb();
    await db.collection('unsubscribes').insertOne({ username, timestamp: nowAR() });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Error MongoDB:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
