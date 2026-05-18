import { NextRequest, NextResponse } from 'next/server';
import { sendCampaign } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.ADMIN_SECRET || auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { csv } = await req.json();
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'Se requiere el campo csv' }, { status: 400 });
  }

  const lines = csv.trim().split('\n').slice(1);
  const recipients = lines
    .map((line: string) => {
      const [email, ...nameParts] = line.split(';');
      return { email: email.trim(), name: nameParts.join(',').trim() };
    })
    .filter((r: { email: string }) => r.email);

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No se encontraron destinatarios en el CSV' }, { status: 400 });
  }

  try {
    const results = await sendCampaign(recipients);
    const sent = results.filter((r) => r.status === 'sent').length;
    const failed = results.filter((r) => r.status === 'error').length;
    return NextResponse.json({ sent, failed, results });
  } catch (err: unknown) {
    console.error('Error en campaña:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
