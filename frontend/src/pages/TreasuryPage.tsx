import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth';

interface CarrierBalance {
  name: string;
  amount: number;
  estimatedPayment: string;
}

interface TreasuryData {
  totalToReceive: number;
  byCarrier: CarrierBalance[];
}

interface RefusalStats {
  byGovernorate: Record<string, number>;
  byProduct: Record<string, number>;
}

export default function TreasuryPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');
  const tenantId = user?.tenant?.id || '';
  const [treasury, setTreasury] = useState<TreasuryData | null>(null);
  const [refusals, setRefusals] = useState<RefusalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId || '',
    };

    Promise.all([
      fetch('/api/v1/orders/treasury/carrier-balances', { headers }).then(r => r.json()),
      fetch('/api/v1/orders/treasury/refusal-analytics', { headers }).then(r => r.json()),
    ])
      .then(([t, r]) => { setTreasury(t); setRefusals(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, tenantId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, fontSize: 40 }}>💰</div>;
  }

  const govEntries = Object.entries(refusals?.byGovernorate || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const prodEntries = Object.entries(refusals?.byProduct || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', maxWidth: 1200 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '0 0 24px' }}>
        💰 Trésorerie COD
      </h1>

      {/* Total Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #059669, #10b981)',
        borderRadius: 16,
        padding: '32px',
        color: 'white',
        marginBottom: 24,
        boxShadow: '0 8px 32px rgba(16,185,129,0.25)',
      }}>
        <p style={{ opacity: 0.8, fontSize: 14, margin: 0 }}>À encaisser auprès des transporteurs</p>
        <p style={{ fontSize: 44, fontWeight: 800, margin: '8px 0' }}>
          {treasury?.totalToReceive?.toLocaleString('fr-TN')} <span style={{ fontSize: 22 }}>TND</span>
        </p>
      </div>

      {/* Carrier Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        {(treasury?.byCarrier || []).map(c => (
          <div key={c.name} style={{
            background: 'white',
            borderRadius: 12,
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>🏢 {c.name}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#059669', margin: '0 0 4px' }}>
              {c.amount.toLocaleString('fr-TN')} TND
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>📅 Paiement : {c.estimatedPayment}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Refusals by Governorate */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>🗺️ Refus par Gouvernorat</h3>
          {govEntries.map(([gov, count]) => (
            <div key={gov} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#475569' }}>{gov}</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Refusals by Product */}
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>📦 Produits les + refusés</h3>
          {prodEntries.map(([prod, count]) => (
            <div key={prod} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#475569', fontSize: 13 }}>{prod.length > 30 ? prod.slice(0, 30) + '…' : prod}</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
