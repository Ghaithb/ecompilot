import { useEffect, useState } from 'react';
import { useAuth } from '@/core/auth';

interface DashboardData {
  total: number;
  confirmed: number;
  pending_confirmation: number;
  unreachable: number;
  rejected: number;
  shipped: number;
  revenue: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  pending_confirmation: { label: 'À confirmer', color: '#f59e0b', emoji: '⏳' },
  confirmed: { label: 'Confirmées', color: '#10b981', emoji: '✅' },
  unreachable: { label: 'Injoignables', color: '#ef4444', emoji: '📵' },
  rejected: { label: 'Refusées', color: '#6b7280', emoji: '❌' },
  shipped: { label: 'Expédiées', color: '#3b82f6', emoji: '🚚' },
};

export default function CodDashboardPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token');
  const tenantId = user?.tenant?.id || '';
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/v1/orders/today-dashboard', {
          headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': tenantId || '' },
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token, tenantId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ fontSize: 48 }}>📦</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          🎯 COD Dashboard — Aujourd'hui
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Mis à jour toutes les 30 secondes</p>
      </div>

      {/* Revenue Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: 16,
        padding: '32px',
        color: 'white',
        marginBottom: 24,
        boxShadow: '0 8px 32px rgba(124,58,237,0.25)',
      }}>
        <p style={{ opacity: 0.8, fontSize: 14, margin: 0 }}>💰 Revenus encaissables aujourd'hui</p>
        <p style={{ fontSize: 42, fontWeight: 800, margin: '8px 0' }}>
          {data?.revenue?.toLocaleString('fr-TN')} <span style={{ fontSize: 20 }}>TND</span>
        </p>
        <p style={{ opacity: 0.7, margin: 0 }}>{data?.total || 0} commandes au total</p>
      </div>

      {/* Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = data?.[key as keyof DashboardData] as number || 0;
          return (
            <div key={key} style={{
              background: 'white',
              borderRadius: 12,
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${cfg.color}`,
            }}>
              <p style={{ fontSize: 28, margin: 0 }}>{cfg.emoji}</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: cfg.color, margin: '8px 0 4px' }}>{count}</p>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Priority Alert */}
      {(data?.pending_confirmation || 0) > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <p style={{ fontWeight: 600, color: '#92400e', margin: 0 }}>
              {data?.pending_confirmation} commande(s) en attente de confirmation
            </p>
            <p style={{ color: '#b45309', fontSize: 13, margin: '4px 0 0' }}>
              Appelez ou envoyez un WhatsApp pour valider avant expédition.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
