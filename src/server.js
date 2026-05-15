import express from "express";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { sendCampaign } from "./mailer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// Returns current time as ISO string with Argentina offset (UTC-3, no DST)
function nowAR() {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().replace("Z", "-03:00");
}

// MongoDB connection cache (required for Vercel serverless)
let db;
async function getDb() {
  if (!db) {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db("ciberseguridad");
  }
  return db;
}

app.post("/api/reset-password", async (req, res) => {
  const { username } = req.body;

  try {
    const database = await getDb();
    await database.collection("password_resets").insertOne({
      username,
      timestamp: nowAR(),
    });
    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error MongoDB:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/unsubscribe", async (req, res) => {
  const { username } = req.body;

  try {
    const database = await getDb();
    await database.collection("unsubscribes").insertOne({
      username,
      timestamp: nowAR(),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error MongoDB:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/send-campaign
// Body: { recipients: [{ email: string, name: string }] }
app.post("/api/send-campaign", async (req, res) => {
  const { recipients } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "recipients debe ser un array no vacío" });
  }

  try {
    const results = await sendCampaign(recipients);
    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "error").length;
    res.json({ sent, failed, results });
  } catch (err) {
    console.error("Error en campaña:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Local dev: listen on port 3000
// On Vercel: module is imported, listen is skipped
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Servidor en " + process.env.BASE_URL));
}

export default app;
