import { NextRequest, NextResponse } from 'next/server';
import { getDb, nowAR } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';
  try {
    const db = await getDb();
    await db.collection('password_resets').insertOne({
      username,
      timestamp: nowAR(),
      ip,
      userAgent,
    });
    return NextResponse.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err: unknown) {
    console.error('Error MongoDB:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
