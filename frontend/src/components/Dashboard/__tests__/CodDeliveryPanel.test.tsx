import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodDeliveryPanel } from '../CodDeliveryPanel';

const mockData = {
  totalCodOrders: 10,
  totalItems: 25,
  verifiedOrders: 8,
  pendingVerification: 2,
  confirmed: 3,
  shipped: 2,
  delivered: 7,
  cancelled: 1,
  inProgress: 2,
  deliverySuccessRate: 87.5,
  deliveryFailureRate: 12.5,
  codRevenue: 1500,
  codRevenueCollected: 1200,
  codRevenuePending: 300,
  averageItemsPerOrder: 2.5,
  otpVerificationRate: 80,
};

describe('CodDeliveryPanel', () => {
  it('renders COD metrics', () => {
    render(<CodDeliveryPanel data={mockData} formatCurrency={(n) => `${n} TND`} />);

    expect(screen.getByText('Commandes COD')).toBeInTheDocument();
    expect(screen.getByText('Livraisons réussies')).toBeInTheDocument();
    expect(screen.getByText(/88% taux de succès/)).toBeInTheDocument();
    expect(screen.getByText('1200 TND')).toBeInTheDocument();
  });

  it('returns null when no data', () => {
    const { container } = render(
      <CodDeliveryPanel formatCurrency={(n) => `${n}`} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
