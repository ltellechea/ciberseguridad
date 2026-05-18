'use client';

import { useState } from 'react';

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

export default function AdminPage() {
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
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg h-fit">
        <h1 className="text-xl font-bold mb-6 text-gray-900">Enviar campaña de email</h1>

        <label htmlFor="secret" className="block text-sm font-semibold mb-1 text-gray-700">
          Clave de administrador
        </label>
        <input
          type="password"
          id="secret"
          placeholder="ADMIN_SECRET"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="csvFile" className="block text-sm font-semibold mb-1 text-gray-700">
          Subir archivo CSV
        </label>
        <input
          type="file"
          id="csvFile"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-600 mb-4 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <label htmlFor="csvText" className="block text-sm font-semibold mb-1 text-gray-700">
          O pegar contenido CSV
        </label>
        <textarea
          id="csvText"
          placeholder={'email;nombre\nusuario@ejemplo.com;Juan Pérez'}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono h-40 resize-y mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendCampaign}
          disabled={status.type === 'sending'}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium text-base cursor-pointer transition-colors"
        >
          Enviar campaña
        </button>

        <div className="mt-5 text-sm">
          {status.type === 'sending' && <p className="text-gray-500">Enviando...</p>}
          {status.type === 'error' && <p className="text-red-600">{status.message}</p>}
          {status.type === 'success' && (
            <>
              <p className="text-green-700 font-medium">
                ✅ Enviados: {status.data.sent} &nbsp; ❌ Fallidos: {status.data.failed}
              </p>
              {status.data.results
                .filter((r) => r.status === 'error')
                .map((r) => (
                  <p key={r.email} className="text-xs mt-1 text-red-600">
                    — {r.email}: {r.error}
                  </p>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
