import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportOptionsDialog } from '../export-options-dialog';
import { ExportOptions } from '@/types/analytics';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';
import { renderWithProviders as render } from '@/test/test-utils';

vi.mock('@/components/ui', () => {
  const React = require('react');
  return {
    DialogTitle: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'dialog-title' }, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'dialog-description' }, children),
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => React.createElement('label', { 'data-testid': 'label', htmlFor }, children),
    Switch: ({ id, checked, onCheckedChange, 'aria-label': ariaLabel }: any) => React.createElement('button', { 'data-testid': 'switch', role: 'switch', 'aria-checked': checked, 'aria-label': ariaLabel, onClick: () => onCheckedChange && onCheckedChange(!checked) }),
    Button: ({ children, onClick, className, 'aria-label': ariaLabel }: any) => React.createElement('button', { 'data-testid': 'button', onClick, className, 'aria-label': ariaLabel }, children),
  };
});

describe('ExportOptionsDialog', () => {
  const mockOnExport = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all options correctly', () => {
    render(<ExportOptionsDialog onExport={mockOnExport} onClose={mockOnClose} />);

    expect(screen.getByText('KPIs principaux')).toBeInTheDocument();
    expect(screen.getByText('Graphique des ventes')).toBeInTheDocument();
    expect(screen.getByText('Top produits')).toBeInTheDocument();
    expect(screen.getByText('État des stocks')).toBeInTheDocument();
    expect(screen.getByText('Recommandations IA')).toBeInTheDocument();
    expect(screen.getByText('Anomalies détectées')).toBeInTheDocument();
  });

  it('handles option changes correctly', async () => {
    render(<ExportOptionsDialog onExport={mockOnExport} onClose={mockOnClose} />);

    const kpisSwitch = screen.getByRole('switch', { name: /Inclure les KPIs principaux/i });
    fireEvent.click(kpisSwitch);

    const exportButton = screen.getByRole('button', { name: /Générer le rapport/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockOnExport).toHaveBeenCalledWith(expect.objectContaining({
        includeKpis: false
      }));
    });
  });

  it('handles close button correctly', () => {
    render(<ExportOptionsDialog onExport={mockOnExport} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});