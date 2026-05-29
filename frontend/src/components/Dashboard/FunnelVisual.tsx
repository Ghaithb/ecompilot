import { useState, useEffect } from 'react';
import {
  Eye,
  Package,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Truck,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelStep {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
}

interface FunnelVisualProps {
  data?: {
    visits: number;
    productsViewed: number;
    cartsCreated: number;
    checkouts: number;
    confirmed: number;
    delivered: number;
    paid: number;
  };
}

const FunnelVisual = ({ data }: FunnelVisualProps) => {
  // Données par défaut ou réelles
  const defaultData = {
    visits: 1000,
    productsViewed: 450,
    cartsCreated: 250,
    checkouts: 180,
    confirmed: 135,
    delivered: 108,
    paid: 102,
  };

  const funnelData = data || defaultData;

  const steps: FunnelStep[] = [
    {
      label: 'Visites',
      value: funnelData.visits,
      icon: Eye,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      label: 'Produits vus',
      value: funnelData.productsViewed,
      icon: Package,
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      label: 'Paniers',
      value: funnelData.cartsCreated,
      icon: ShoppingCart,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    {
      label: 'Checkout',
      value: funnelData.checkouts,
      icon: CreditCard,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
    },
    {
      label: 'Confirmés',
      value: funnelData.confirmed,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      label: 'Livrés',
      value: funnelData.delivered,
      icon: Truck,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      label: 'Payés',
      value: funnelData.paid,
      icon: DollarSign,
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
  ];

  // Calculer les taux de conversion et drop-off
  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  const getDropOffRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return (((previous - current) / previous) * 100).toFixed(0);
  };

  const getProgressWidth = (value: number) => {
    const maxValue = steps[0].value;
    return (value / maxValue) * 100;
  };

  return (
    <Card className="funnel-visual-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="text-blue-600" size={24} />
          Funnel de Conversion
        </CardTitle>
        <CardDescription>
          Visualisez le parcours client de la visite jusqu'au paiement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="funnel-container">
          {steps.map((step, index) => {
            const previousValue = index > 0 ? steps[index - 1].value : step.value;
            const conversionRate = getConversionRate(step.value, previousValue);
            const dropOffRate = getDropOffRate(step.value, previousValue);
            const progressWidth = getProgressWidth(step.value);

            return (
              <div key={index} className="funnel-step">
                {/* Step Header */}
                <div className="step-header">
                  <div className="step-info">
                    <div
                      className="step-icon"
                      style={{ background: step.bgColor, color: step.color }}
                    >
                      <step.icon size={20} />
                    </div>
                    <div className="step-details">
                      <div className="step-label">{step.label}</div>
                      <div className="step-value">{step.value.toLocaleString()}</div>
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="step-metrics">
                      <div className="metric conversion">
                        <span className="metric-value">{conversionRate}%</span>
                        <span className="metric-label">Conversion</span>
                      </div>
                      {dropOffRate !== '0' && (
                        <div className="metric dropoff">
                          <span className="metric-value">-{dropOffRate}%</span>
                          <span className="metric-label">Drop-off</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progressWidth}%`,
                      background: `linear-gradient(90deg, ${step.color} 0%, ${step.color}dd 100%)`,
                    }}
                  >
                    <div className="progress-shine"></div>
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5L12 19M12 19L19 12M12 19L5 12"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="funnel-summary">
          <div className="summary-item">
            <span className="summary-label">Taux de conversion global:</span>
            <span className="summary-value success">
              {getConversionRate(steps[steps.length - 1].value, steps[0].value)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Leads confirmés:</span>
            <span className="summary-value">
              {getConversionRate(funnelData.confirmed, funnelData.visits)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taux de livraison:</span>
            <span className="summary-value">
              {getConversionRate(funnelData.delivered, funnelData.confirmed)}%
            </span>
          </div>
        </div>
      </CardContent>

      <style>{`
        .funnel-visual-card {
          margin-bottom: 2rem;
        }

        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .funnel-step {
          position: relative;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .step-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .step-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .step-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .step-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .step-metrics {
          display: flex;
          gap: 1.5rem;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .metric-value {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .metric.conversion .metric-value {
          color: #10b981;
        }

        .metric.dropoff .metric-value {
          color: #ef4444;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-container {
          width: 100%;
          height: 32px;
          background: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          border-radius: 8px;
          position: relative;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .progress-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shine 2s infinite;
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          50%,
          100% {
            left: 100%;
          }
        }

        .step-connector {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .funnel-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
          border-radius: 12px;
          margin-top: 2rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .summary-value.success {
          color: #10b981;
        }

        @media (max-width: 768px) {
          .step-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .step-metrics {
            width: 100%;
            justify-content: space-around;
          }

          .funnel-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
};

// Fix import manquant
import { TrendingDown } from 'lucide-react';

export default FunnelVisual;
