import { NextRequest, NextResponse } from 'next/server';
import { getDb, nowAR } from '@/lib/db';

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('t');

  // Diagnostic mode: ?debug=1 (protect with admin secret)
  const debug = searchParams.get('debug');
  const auth = req.headers.get('authorization');
  if (debug && auth === `Bearer ${process.env.ADMIN_SECRET}`) {
    try {
      const db = await getDb();
      const count = await db.collection('email_opens').countDocuments();
      return NextResponse.json({ ok: true, email_opens_count: count });
    } catch (err) {
      return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
    }
  }

  if (token) {
    try {
      const email = Buffer.from(token, 'base64').toString('utf-8');
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        'unknown';
      const userAgent = req.headers.get('user-agent') ?? 'unknown';

      const db = await getDb();
      await db.collection('email_opens').insertOne({
        email,
        ip,
        userAgent,
        openedAt: nowAR(),
      });
      console.log(`[track] apertura registrada — email: ${email}, ip: ${ip}`);
    } catch (err) {
      console.error('[track] error al guardar apertura:', (err as Error).message);
    }
  } else {
    console.warn('[track] pixel cargado sin token');
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
