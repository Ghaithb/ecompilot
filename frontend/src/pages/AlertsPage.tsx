import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

type StockAlert = {
  productId: string;
  productTitle: string;
  variantSku: string;
  variantName: string;
  currentStock: number;
  threshold: number;
  tenantId: string;
  severity: 'low' | 'critical';
};

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/alerts/stock');
        setAlerts(res.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Erreur lors du chargement des alertes');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alertes & Projections</h1>
      <div className="bg-white rounded shadow p-4">
        {loading && <p>Chargement des alertes...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            <p>Liste des alertes automatiques (stock, financement, etc.)</p>
            <ul className="mt-4 space-y-2">
              {alerts.length === 0 && (
                <li className="text-gray-500">Aucune alerte pour le moment.</li>
              )}
              {alerts.map((a) => (
                <li key={`${a.productId}-${a.variantSku}`} className={`p-3 rounded border ${a.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{a.productTitle} — {a.variantName} ({a.variantSku})</p>
                      <p className="text-sm text-gray-600">Stock actuel: {a.currentStock} • Seuil: {a.threshold}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${a.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                      {a.severity === 'critical' ? 'Critique' : 'Faible'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
