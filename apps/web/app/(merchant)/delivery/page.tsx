'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { DeliveryOverview } from '@/lib/types';
import { PROVIDER_LABELS } from '@/lib/types';

export default function DeliveryOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-overview'],
    queryFn: () => apiFetch<DeliveryOverview>('/delivery/overview'),
  });

  const stats = data?.stats;
  const providers = data?.providers || [];
  const connected = providers.filter((p) => p.configured).length;

  return (
    <div className="page">
      <h1>Livraison</h1>
      <p className="muted">Vue d&apos;ensemble transporteurs et expéditions</p>

      <div className="stat-grid four">
        <div className="card compact">
          <p className="muted">Expéditions</p>
          <p className="stat-value">{isLoading ? '…' : stats?.total ?? 0}</p>
        </div>
        <div className="card compact">
          <p className="muted">Livrées</p>
          <p className="stat-value">{isLoading ? '…' : stats?.delivered ?? 0}</p>
        </div>
        <div className="card compact">
          <p className="muted">En transit</p>
          <p className="stat-value">{isLoading ? '…' : stats?.inTransit ?? 0}</p>
        </div>
        <div className="card compact">
          <p className="muted">Refusées</p>
          <p className="stat-value">{isLoading ? '…' : stats?.refused ?? 0}</p>
        </div>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Transporteurs</h2>
        <ul className="provider-list">
          {providers.map((p) => (
            <li key={p.id}>
              <span>{PROVIDER_LABELS[p.id] || p.name}</span>
              <span className={p.configured ? 'badge success' : 'badge'}>
                {p.configured ? 'Connecté' : 'À configurer'}
              </span>
            </li>
          ))}
        </ul>
        <div className="actions-row">
          <Link href="/delivery/connect" className="btn-ghost">
            Gérer les connexions →
          </Link>
          <Link href="/delivery/shipments" className="btn-primary">
            Voir les expéditions
          </Link>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          {connected === 0
            ? 'Connectez au moins un transporteur pour expédier.'
            : `${connected} transporteur(s) prêt(s).`}
        </p>
      </section>
    </div>
  );
}
