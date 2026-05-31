'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ShipmentRow } from '@/lib/types';
import { PROVIDER_LABELS } from '@/lib/types';

function shipmentId(s: ShipmentRow) {
  return s._id || s.id || s.trackingNumber || '';
}

export default function DeliveryShipmentsPage() {
  const { data: shipments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['delivery-shipments'],
    queryFn: async () => {
      const res = await apiFetch<ShipmentRow[] | { items?: ShipmentRow[] }>('/shipments');
      return Array.isArray(res) ? res : (res.items ?? []);
    },
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Expéditions</h1>
          <p className="muted">{shipments.length} expédition(s)</p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => refetch()}>
          Actualiser
        </button>
      </div>

      {isLoading && <p className="page-loading">Chargement…</p>}
      {isError && <p className="error">Erreur de chargement des expéditions.</p>}

      {!isLoading && !isError && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Commande</th>
                <th>Transporteur</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                    Aucune expédition —{' '}
                    <Link href="/delivery/connect">connecter un transporteur</Link>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={shipmentId(s)}>
                    <td>{s.trackingNumber || '—'}</td>
                    <td>{s.orderNumber || '—'}</td>
                    <td>{PROVIDER_LABELS[s.provider || ''] || s.provider || '—'}</td>
                    <td>
                      <span className="badge">{s.status || '—'}</span>
                    </td>
                    <td>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-TN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
