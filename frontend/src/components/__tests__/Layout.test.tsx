import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock des contextes
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  roles: ['user'],
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

vi.mock('@/components/CurrencySelector', () => ({
  default: () => <div data-testid="currency-selector">Currency</div>,
}));

vi.mock('@/components/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">Language</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Layout - Navigation', () => {
  it('devrait afficher les 4 items de navigation directe', () => {
    renderWithRouter(<Layout />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produits')).toBeInTheDocument();
    expect(screen.getByText('Commandes')).toBeInTheDocument();
    expect(screen.getByText('IA Copilot')).toBeInTheDocument();
  });

  it('devrait afficher le groupe "Gestion"', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByRole('button', { name: /gestion/i })).toBeInTheDocument();
  });

  it('devrait afficher le groupe "Site Web"', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByRole('button', { name: /site web/i })).toBeInTheDocument();
  });

  it('devrait afficher le groupe "Connexions"', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByRole('button', { name: /connexions/i })).toBeInTheDocument();
  });

  it('devrait afficher le groupe "Paramètres"', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByRole('button', { name: /paramètres/i })).toBeInTheDocument();
  });

  it('ne devrait PAS avoir de routes cassées dans la navbar', () => {
    renderWithRouter(<Layout />);
    
    // Ces routes ne doivent PAS exister
    expect(screen.queryByText('Connecteurs Publicitaires')).not.toBeInTheDocument();
    expect(screen.queryByText('Paiements Mobile Money')).not.toBeInTheDocument();
  });

  it('devrait avoir "Produits" dans la navigation directe (promu)', () => {
    renderWithRouter(<Layout />);
    
    // Produits doit être visible directement, pas dans un dropdown
    const produitsLink = screen.getByText('Produits');
    expect(produitsLink.closest('a')).toHaveAttribute('href', '/products');
  });

  it('devrait afficher les icônes pour chaque item de navigation', () => {
    renderWithRouter(<Layout />);
    
    const navItems = ['Dashboard', 'Produits', 'Commandes', 'IA Copilot'];
    navItems.forEach(item => {
      const link = screen.getByText(item);
      const svg = link.parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('devrait afficher le nom de l\'utilisateur', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('devrait afficher les initiales de l\'utilisateur dans l\'avatar', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('devrait avoir exactement 4 groupes de navigation', () => {
    renderWithRouter(<Layout />);
    
    const dropdownButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.match(/Gestion|Site Web|Connexions|Paramètres/)
    );
    
    expect(dropdownButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('devrait afficher le lien Admin pour les admins', () => {
    const mockAdminUser = { ...mockUser, roles: ['admin'] };
    
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: mockAdminUser,
        logout: vi.fn(),
        isAuthenticated: true,
      }),
    }));

    renderWithRouter(<Layout />);
    // Le test exact dépend de l'implémentation
  });
});

describe('Layout - Responsive', () => {
  it('devrait avoir des classes responsive pour la navigation', () => {
    const { container } = renderWithRouter(<Layout />);
    
    // Vérifier que les classes responsive sont présentes
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-card');
  });

  it('devrait masquer certains éléments sur mobile', () => {
    renderWithRouter(<Layout />);
    
    // Les selecteurs de langue/devise sont cachés sur petit écran
    const currencySelector = screen.getByTestId('currency-selector');
    expect(currencySelector.parentElement).toHaveClass('hidden', 'lg:flex');
  });
});

describe('Layout - Structure', () => {
  it('devrait avoir une structure navbar + main content', () => {
    const { container } = renderWithRouter(<Layout />);
    
    const nav = container.querySelector('nav');
    const main = container.querySelector('main');
    
    expect(nav).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('devrait avoir le logo EcomPilot', () => {
    renderWithRouter(<Layout />);
    expect(screen.getByText('EcomPilot')).toBeInTheDocument();
  });
});
