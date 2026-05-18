import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!db) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    db = client.db('ciberseguridad');
  }
  return db;
}

export function nowAR(): string {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().replace('Z', '-03:00');
}
