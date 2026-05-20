'use client';

import { useState, useEffect } from 'react';

export interface Entry {
  _id: string;
  username: string;
  timestamp: string;
}

type Tab = 'resets' | 'unsubscribes';

function formatTimestamp(ts: string): { date: string; time: string; isoDate: string } {
  const [datePart, timePart] = ts.split('T');
  if (!datePart || !timePart) return { date: ts, time: '', isoDate: '' };
  const [yyyy, mm, dd] = datePart.split('-');
  const [hh, min, secRaw] = timePart.split(':');
  const sec = secRaw?.slice(0, 2) ?? '00';
  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${min}:${sec}`,
    isoDate: datePart, // "YYYY-MM-DD" for date range comparison
  };
}

function Table({ rows }: { rows: Entry[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-800">
          <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">ID</th>
          <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Usuario</th>
          <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Fecha</th>
          <th className="text-left px-5 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Hora</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-5 py-14 text-center text-zinc-600 text-sm">
              No hay registros que coincidan
            </td>
          </tr>
        ) : (
          rows.map((r) => {
            const { date, time } = formatTimestamp(r.timestamp);
            return (
              <tr
                key={r._id}
                className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors group"
              >
                <td className="px-5 py-3.5 font-mono text-xs text-zinc-600 whitespace-nowrap" title={r._id}>
                  …{r._id.slice(-8)}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-zinc-300 group-hover:text-white transition-colors">
                  {r.username}
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500 tabular-nums whitespace-nowrap">
                  {date}
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-600 tabular-nums whitespace-nowrap font-mono">
                  {time}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

interface Props {
  passwordResets: Entry[];
  unsubscribes: Entry[];
}

export default function DashboardTabs({ passwordResets, unsubscribes }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('resets');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtered, setFiltered] = useState<Entry[]>(passwordResets);

  const source = activeTab === 'resets' ? passwordResets : unsubscribes;

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      source.filter((r) => {
        const matchesSearch = q === '' || r.username.toLowerCase().includes(q);
        const { isoDate } = formatTimestamp(r.timestamp);
        const matchesFrom = dateFrom === '' || isoDate >= dateFrom;
        const matchesTo = dateTo === '' || isoDate <= dateTo;
        return matchesSearch && matchesFrom && matchesTo;
      })
    );
  }, [search, dateFrom, dateTo, activeTab, source]);

  function clearFilters() {
    setSearch('');
    setDateFrom('');
    setDateTo('');
  }

  const hasFilters = search !== '' || dateFrom !== '' || dateTo !== '';

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'resets',       label: 'Resets de contraseña', count: passwordResets.length },
    { id: 'unsubscribes', label: 'Desuscripciones',       count: unsubscribes.length  },
  ];

  const inputCls =
    'bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-colors';

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 bg-black">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2.5 px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
                activeTab === tab.id ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuario…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-full pl-7 pr-3 py-1.5`}
          />
        </div>

        {/* Date from */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600">Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`${inputCls} px-2 py-1.5 [color-scheme:dark]`}
          />
        </div>

        {/* Date to */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600">Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={`${inputCls} px-2 py-1.5 [color-scheme:dark]`}
          />
        </div>

        {/* Clear + result count */}
        <div className="flex items-center gap-2 ml-auto">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
          <span className="text-xs text-zinc-600 font-mono tabular-nums">
            {filtered.length}/{source.length}
          </span>
        </div>
      </div>

      {/* Table with scroll */}
      <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
        <Table rows={filtered} />
      </div>
    </div>
  );
}
