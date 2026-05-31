'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { CarrierAnalytics } from '@/lib/types';
import { PROVIDER_LABELS } from '@/lib/types';

export default function DeliveryAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-carriers'],
    queryFn: () => apiFetch<CarrierAnalytics>('/analytics/carriers'),
  });

  const delivery = data?.delivery;

  return (
    <div className="page">
      <h1>Analytics livraison</h1>
      <p className="muted">Performance transporteurs · {data?.periodDays ?? 30} jours</p>

      {isLoading && <p className="page-loading">Chargement…</p>}
      {isError && <p className="error">Impossible de charger les analytics.</p>}

      {delivery && (
        <>
          <div className="stat-grid four">
            <div className="card compact">
              <p className="muted">Taux de succès</p>
              <p className="stat-value">{delivery.successRate}%</p>
            </div>
            <div className="card compact">
              <p className="muted">Livrées</p>
              <p className="stat-value">{delivery.deliveredCount}</p>
            </div>
            <div className="card compact">
              <p className="muted">Échecs</p>
              <p className="stat-value">{delivery.failedDeliveries}</p>
            </div>
            <div className="card compact">
              <p className="muted">Retards</p>
              <p className="stat-value">{delivery.delayedShipments}</p>
            </div>
          </div>

          <div className="connect-grid" style={{ marginTop: 24 }}>
            {delivery.bestCarrier && (
              <section className="card">
                <h2>Meilleur transporteur</h2>
                <p className="stat-title">
                  {PROVIDER_LABELS[delivery.bestCarrier.provider] || delivery.bestCarrier.provider}
                </p>
                <p className="muted">
                  {delivery.bestCarrier.successRate}% succès · ~{delivery.bestCarrier.avgDays} j
                </p>
              </section>
            )}
            {delivery.worstCarrier && (
              <section className="card">
                <h2>À surveiller</h2>
                <p className="stat-title">
                  {PROVIDER_LABELS[delivery.worstCarrier.provider] || delivery.worstCarrier.provider}
                </p>
                <p className="muted">
                  {delivery.worstCarrier.successRate}% succès · {delivery.worstCarrier.failed} échecs
                </p>
              </section>
            )}
          </div>

          {delivery.insights && delivery.insights.length > 0 && (
            <section className="card" style={{ marginTop: 24 }}>
              <h2>Insights</h2>
              <ul className="insights">
                {delivery.insights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {data?.regional && data.regional.length > 0 && (
            <section className="card" style={{ marginTop: 24 }}>
              <h2>Par région</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Région</th>
                      <th>Commandes</th>
                      <th>Revenu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.regional.map((r) => (
                      <tr key={r.region}>
                        <td>{r.region}</td>
                        <td>{r.orders}</td>
                        <td>{r.revenue} TND</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
