// Uso: node scripts/send.js recipients.csv
// El servidor debe estar corriendo en BASE_URL

import { readFile } from "fs/promises";
import { resolve } from "path";

const BASE_URL = process.env.BASE_URL;
const csvPath = resolve(process.argv[2] || "recipients.csv");

const csv = await readFile(csvPath, "utf-8");
const lines = csv.trim().split("\n").slice(1); // skip header

const recipients = lines
  .map((line) => {
    const [email, ...nameParts] = line.split(";");
    return { email: email.trim(), name: nameParts.join(",").trim() };
  })
  .filter((r) => r.email);

console.log(`Enviando a ${recipients.length} destinatarios...`);

const res = await fetch(`${BASE_URL}/api/send-campaign`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ recipients }),
});

const data = await res.json();
console.log(`✅ Enviados: ${data.sent} | ❌ Fallidos: ${data.failed}`);

if (data.failed > 0) {
  const errors = data.results.filter((r) => r.status === "error");
  errors.forEach((r) => console.error(`  - ${r.email}: ${r.error}`));
}
