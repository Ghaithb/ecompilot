'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type DashboardPayload = {
  businessStatus?: { message?: string; tone?: string };
  kpis?: { ordersToday?: number; moneyAtRisk?: number };
};

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardPayload>('/analytics/dashboard'),
    retry: 1,
  });

  if (isLoading) return <p className="page-loading">Chargement…</p>;

  if (isError) {
    return (
      <div className="page">
        <h1>Dashboard</h1>
        <p className="error">Impossible de charger le dashboard.</p>
        <button type="button" className="btn-primary" onClick={() => refetch()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Command Center</h1>
      <p className="muted">Next.js 15 · TanStack Query · proxy /api/v1</p>
      <section className="card">
        <p className="eyebrow">Statut</p>
        <h2 className="stat-title">{data?.businessStatus?.message || '—'}</h2>
        <div className="stat-grid">
          <div>
            <p className="muted">Commandes aujourd&apos;hui</p>
            <p className="stat-value">{data?.kpis?.ordersToday ?? 0}</p>
          </div>
          <div>
            <p className="muted">Revenu à risque</p>
            <p className="stat-value">{data?.kpis?.moneyAtRisk ?? 0} TND</p>
          </div>
        </div>
      </section>
    </div>
  );
}
