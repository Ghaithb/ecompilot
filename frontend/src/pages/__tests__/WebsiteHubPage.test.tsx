import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WebsiteHubPage from '../WebsiteHubPage';

vi.mock('@/components/website/SimpleBoutiquePanel', () => ({
  default: () => <div data-testid="simple-boutique">Simple Boutique</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('WebsiteHubPage', () => {
  it('affiche le titre Ma boutique', () => {
    renderWithRouter(<WebsiteHubPage />);
    expect(screen.getByText('Ma boutique')).toBeInTheDocument();
  });

  it('affiche le panneau simplifié', () => {
    renderWithRouter(<WebsiteHubPage />);
    expect(screen.getByTestId('simple-boutique')).toBeInTheDocument();
  });
});
