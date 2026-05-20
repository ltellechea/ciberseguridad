'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SendResult {
  email: string;
  status: 'sent' | 'error';
  error?: string;
}

interface CampaignResponse {
  sent: number;
  failed: number;
  results: SendResult[];
  error?: string;
}

type Status =
  | { type: 'idle' }
  | { type: 'sending' }
  | { type: 'success'; data: CampaignResponse }
  | { type: 'error'; message: string };

export default function CampaignPage() {
  const [secret, setSecret] = useState('');
  const [csvText, setCsvText] = useState('');
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvText(await file.text());
  }

  async function sendCampaign() {
    if (!secret) {
      setStatus({ type: 'error', message: 'Ingresá la clave de administrador.' });
      return;
    }
    if (!csvText) {
      setStatus({ type: 'error', message: 'Cargá o pegá el contenido CSV.' });
      return;
    }
    setStatus({ type: 'sending' });
    try {
      const res = await fetch('/api/send-from-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ csv: csvText }),
      });
      const data: CampaignResponse = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error ?? 'Error desconocido' });
      } else {
        setStatus({ type: 'success', data });
      }
    } catch (err: unknown) {
      setStatus({ type: 'error', message: `Error de red: ${(err as Error).message}` });
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Topbar */}
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              Enviar Campaña
            </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver al panel
          </Link>
          <h1 className="text-xl font-semibold text-white">Enviar campaña de email</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Cargá el CSV con destinatarios y enviá el correo de phishing simulado
          </p>
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-hidden max-w-xl">
          {/* Form header */}
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950">
            <p className="text-sm font-medium text-zinc-300">Configuración del envío</p>
          </div>

          <div className="px-6 py-6 space-y-5 bg-black">
            {/* Secret */}
            <div>
              <label htmlFor="secret" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Clave de administrador
              </label>
              <input
                type="password"
                id="secret"
                placeholder="ADMIN_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
              />
            </div>

            {/* File upload */}
            <div>
              <label htmlFor="csvFile" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Subir archivo CSV
              </label>
              <label
                htmlFor="csvFile"
                className="flex items-center gap-3 w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 border-dashed rounded-md text-sm text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                Seleccionar archivo .csv
              </label>
              <input
                type="file"
                id="csvFile"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Textarea */}
            <div>
              <label htmlFor="csvText" className="block text-xs font-medium text-zinc-400 mb-1.5">
                O pegá el contenido CSV
              </label>
              <textarea
                id="csvText"
                placeholder={'email;nombre\nusuario@ejemplo.com;Juan Pérez'}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono h-36 resize-y text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors"
              />
            </div>

            {/* Feedback */}
            {status.type === 'error' && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-950/40 border border-red-900/60 rounded-md">
                <svg className="text-red-500 mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <p className="text-sm text-red-400">{status.message}</p>
              </div>
            )}
            {status.type === 'success' && (
              <div className="px-3.5 py-3 bg-emerald-950/40 border border-emerald-900/60 rounded-md space-y-1">
                <p className="text-sm text-emerald-400 font-medium">
                  Enviados: {status.data.sent} · Fallidos: {status.data.failed}
                </p>
                {status.data.results
                  .filter((r) => r.status === 'error')
                  .map((r) => (
                    <p key={r.email} className="text-xs text-red-400 font-mono">
                      {r.email}: {r.error}
                    </p>
                  ))}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={sendCampaign}
              disabled={status.type === 'sending'}
              className="w-full py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black rounded-md font-medium text-sm cursor-pointer transition-colors"
            >
              {status.type === 'sending' ? 'Enviando...' : 'Enviar campaña'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
