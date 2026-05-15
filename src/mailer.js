import nodemailer from "nodemailer";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createTransport() {
  return nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { ciphers: "SSLv3" },
  });
}

async function loadTemplate() {
  const templatePath = join(__dirname, "../templates/email.html");
  return readFile(templatePath, "utf-8");
}

function buildEmail(template, { name, email, baseUrl }) {
  const emailB64 = Buffer.from(email).toString("base64");
  return template
    .replaceAll("{{RECIPIENT_NAME}}", name)
    .replaceAll("{{RECIPIENT_EMAIL}}", email)
    .replaceAll("{{RECIPIENT_EMAIL_B64}}", emailB64)
    .replaceAll("{{BASE_URL}}", baseUrl);
}

export async function sendCampaign(recipients) {
  const template = await loadTemplate();
  const baseUrl = process.env.BASE_URL;
  const from = `"${process.env.MAIL_FROM_NAME}" <${process.env.SMTP_USER}>`;
  const transport = createTransport();

  const results = [];

  for (const { email, name } of recipients) {
    const html = buildEmail(template, { name, email, baseUrl });

    try {
      await transport.sendMail({
        from,
        to: email,
        subject: "Alerta de seguridad: inicio de sesión inusual detectado",
        html,
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "error", error: err.message });
    }
  }

  return results;
}
