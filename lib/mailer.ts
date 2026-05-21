import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import { join } from 'path';

function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function loadTemplate(): Promise<string> {
  return readFile(join(process.cwd(), 'templates', 'email.html'), 'utf-8');
}

function buildEmail(
  template: string,
  { name, email, baseUrl }: { name: string; email: string; baseUrl: string }
): string {
  const emailB64 = Buffer.from(email).toString('base64');
  const trackingPixelUrl = `${baseUrl}/api/track?t=${emailB64}`;
  return template
    .replaceAll('{{RECIPIENT_NAME}}', name)
    .replaceAll('{{RECIPIENT_EMAIL}}', email)
    .replaceAll('{{RECIPIENT_EMAIL_B64}}', emailB64)
    .replaceAll('{{TRACKING_PIXEL_URL}}', trackingPixelUrl)
    .replaceAll('{{BASE_URL}}', baseUrl);
}

export interface SendResult {
  email: string;
  status: 'sent' | 'error';
  error?: string;
}

export async function sendCampaign(
  recipients: { email: string; name: string }[]
): Promise<SendResult[]> {
  const template = await loadTemplate();
  const baseUrl = process.env.BASE_URL!;
  const from = `"${process.env.MAIL_FROM_NAME}" <${process.env.SMTP_USER}>`;
  const transport = createTransport();
  const results: SendResult[] = [];

  for (const { email, name } of recipients) {
    const html = buildEmail(template, { name, email, baseUrl });
    try {
      await transport.sendMail({
        from,
        to: email,
        subject: 'Alerta de seguridad: inicio de sesión inusual detectado',
        html,
      });
      results.push({ email, status: 'sent' });
    } catch (err: unknown) {
      results.push({ email, status: 'error', error: (err as Error).message });
    }
  }

  return results;
}
