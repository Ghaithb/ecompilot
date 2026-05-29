import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderFunnelPanel } from '../OrderFunnelPanel';

const mockFunnel = {
  totalOrders: 20,
  pending: 2,
  confirmed: 5,
  shipped: 3,
  delivered: 8,
  cancelled: 2,
  codOrders: 15,
  onlinePaidOrders: 5,
  conversionToDelivered: 44.4,
  conversionToConfirmed: 75,
};

describe('OrderFunnelPanel', () => {
  it('renders order pipeline with COD split', () => {
    render(<OrderFunnelPanel funnel={mockFunnel} />);

    expect(screen.getByText('Pipeline commandes')).toBeInTheDocument();
    expect(screen.getByText('15 COD')).toBeInTheDocument();
    expect(screen.getByText('5 en ligne')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    render(<OrderFunnelPanel funnel={{ ...mockFunnel, totalOrders: 0 }} />);
    expect(screen.getByText(/Le funnel apparaîtra/)).toBeInTheDocument();
  });
});
