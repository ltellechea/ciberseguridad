import { MongoClient, Db } from 'mongodb';

// Cache both client and db to avoid stale connections in serverless
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }
  cachedClient = new MongoClient(process.env.MONGODB_URI!);
  await cachedClient.connect();
  cachedDb = cachedClient.db('ciberseguridad');
  return cachedDb;
}

export function nowAR(): string {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().replace('Z', '-03:00');
}
