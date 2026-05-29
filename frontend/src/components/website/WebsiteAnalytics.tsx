import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, TrendingUp, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';

interface AnalyticsProps {
  pageId: string;
}

export const WebsiteAnalytics: React.FC<AnalyticsProps> = ({ pageId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [pageId, period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3001/api/v1/website/pages/${pageId}/analytics?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Erreur analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  if (!analytics) {
    return <div>Aucune donnée disponible</div>;
  }

  const stats = [
    { icon: Eye, label: 'Vues totales', value: analytics.totalViews || 0, color: 'text-blue-600' },
    { icon: Users, label: 'Visiteurs uniques', value: analytics.uniqueVisitors || 0, color: 'text-green-600' },
    { icon: TrendingUp, label: 'Taux de rebond', value: `${analytics.bounceRate || 0}%`, color: 'text-orange-600' },
    { icon: Clock, label: 'Temps moyen', value: `${Math.round(analytics.avgTime || 0)}s`, color: 'text-purple-600' },
  ];

  const devices = [
    { icon: Monitor, label: 'Desktop', value: analytics.devices?.desktop || 0, color: 'bg-blue-500' },
    { icon: Tablet, label: 'Tablet', value: analytics.devices?.tablet || 0, color: 'bg-green-500' },
    { icon: Smartphone, label: 'Mobile', value: analytics.devices?.mobile || 0, color: 'bg-purple-500' },
  ];

  const totalDevices = devices.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Appareils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => {
              const percentage = totalDevices > 0 ? (device.value / totalDevices) * 100 : 0;
              return (
                <div key={device.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <device.icon className="w-5 h-5" />
                      <span className="font-medium">{device.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {device.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${device.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Sources de Trafic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.sources || {}).map(([source, count]) => (
              <div key={source} className="flex justify-between items-center">
                <span className="capitalize">{source}</span>
                <span className="font-bold">{count as number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
