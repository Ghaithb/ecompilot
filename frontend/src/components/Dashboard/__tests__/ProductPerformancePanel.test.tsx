import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductPerformancePanel } from '../ProductPerformancePanel';

const mockData = {
  totalArticlesSold: 50,
  uniqueProductsSold: 3,
  winningProduct: {
    productId: 'p1',
    title: 'Parfum Royal',
    quantitySold: 30,
    revenue: 900,
    salesPercentage: 60,
    revenuePercentage: 65,
  },
  products: [
    {
      productId: 'p1',
      title: 'Parfum Royal',
      quantitySold: 30,
      revenue: 900,
      salesPercentage: 60,
      revenuePercentage: 65,
    },
    {
      productId: 'p2',
      title: 'Crème Visage',
      quantitySold: 20,
      revenue: 480,
      salesPercentage: 40,
      revenuePercentage: 35,
    },
  ],
};

describe('ProductPerformancePanel', () => {
  it('renders winning product and sales breakdown', () => {
    render(
      <MemoryRouter>
        <ProductPerformancePanel data={mockData} formatCurrency={(n) => `${n} TND`} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Produit gagnant')).toBeInTheDocument();
    expect(screen.getAllByText('Parfum Royal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('60.0%').length).toBeGreaterThan(0);
    expect(screen.getByText('50 articles vendus · 3 produits distincts')).toBeInTheDocument();
  });
});
