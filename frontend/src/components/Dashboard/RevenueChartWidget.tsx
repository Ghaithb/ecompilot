import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartWidgetProps {
  days?: number;
}

export function RevenueChartWidget({ days = 7 }: RevenueChartWidgetProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('ar') ? 'ar-TN' : 'fr-FR';

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['analytics', 'revenue-chart', days],
    queryFn: () => analyticsApi.getRevenueChart(days),
    staleTime: 60_000,
  });

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: 'TND',
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === 'number') {
              return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'TND',
                minimumFractionDigits: 0,
              }).format(value);
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }), [locale]);

  const title = t('dashboard.revenue.title', { days });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">{t('dashboard.revenue.loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            {t('dashboard.revenue.noData')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const localizedData = {
    ...chartData,
    datasets: chartData.datasets?.map((ds, i) => ({
      ...ds,
      label: i === 0 ? t('dashboard.revenue.revenueLabel') : t('dashboard.revenue.ordersLabel'),
    })) ?? chartData.datasets,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500">
            {t('dashboard.revenue.subtitle')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line options={options} data={localizedData} />
        </div>
      </CardContent>
    </Card>
  );
}
