import { getDb } from '@/lib/db';
import { WithId, Document } from 'mongodb';
import Link from 'next/link';
import DashboardTabs, { Entry } from '@/app/components/DashboardTabs';

export const dynamic = 'force-dynamic';

function toEntry(doc: WithId<Document>): Entry {
  return {
    _id: doc._id.toString(),
    username: doc.username as string,
    timestamp: doc.timestamp as string,
  };
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950 hover:border-zinc-700 transition-colors">
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">{label}</p>
      <p className="text-4xl font-semibold text-white tabular-nums">{value}</p>
      <p className="text-xs text-zinc-600 mt-2">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const db = await getDb();
  const [resetDocs, unsubDocs] = await Promise.all([
    db.collection('password_resets').find({}).sort({ timestamp: -1 }).toArray(),
    db.collection('unsubscribes').find({}).sort({ timestamp: -1 }).toArray(),
  ]);

  const passwordResets = resetDocs.map(toEntry);
  const unsubscribes = unsubDocs.map(toEntry);

  return (
    <div className="min-h-screen bg-black">
      {/* Topbar */}
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-300">Panel</span>
          </div>
          <Link
            href="/campaign"
            className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-black px-4 py-1.5 rounded-md font-medium text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Enviar campaña
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Resultados de campaña</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Seguimiento de interacciones del ejercicio de concientización
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Resets de contraseña"
            value={passwordResets.length}
            description="Usuarios que ingresaron credenciales"
          />
          <StatCard
            label="Desuscripciones"
            value={unsubscribes.length}
            description="Usuarios que solicitaron baja"
          />
        </div>

        {/* Tabbed table */}
        <DashboardTabs passwordResets={passwordResets} unsubscribes={unsubscribes} />
      </main>
    </div>
  );
}
