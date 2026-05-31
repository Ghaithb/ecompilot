'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { OrderRow } from '@/lib/types';

function orderId(o: OrderRow) {
  return o._id || o.id || o.orderNumber;
}

function formatTnd(n: number) {
  return `${Number(n).toFixed(3)} TND`;
}

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiFetch<OrderRow[] | { orders?: OrderRow[] }>('/orders');
      return Array.isArray(res) ? res : (res.orders ?? []);
    },
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Commandes</h1>
          <p className="muted">{orders.length} commande(s)</p>
        </div>
        <button type="button" className="btn-ghost" onClick={() => refetch()}>
          Actualiser
        </button>
      </div>

      {isLoading && <p className="page-loading">Chargement…</p>}
      {isError && (
        <p className="error">
          Erreur de chargement.{' '}
          <button type="button" className="link-btn" onClick={() => refetch()}>
            Réessayer
          </button>
        </p>
      )}

      {!isLoading && !isError && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                    Aucune commande
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={orderId(o)}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerEmail || '—'}</td>
                    <td>
                      <span className="badge">{o.status}</span>
                    </td>
                    <td>{o.paymentMethod || o.paymentStatus || '—'}</td>
                    <td>{formatTnd(o.total)}</td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-TN') : '—'}</td>
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
