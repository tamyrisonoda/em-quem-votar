import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FinanceCard, {
  TOTAL_LABEL,
  SOURCES_HEADING,
  formatTotal,
} from './FinanceCard.jsx';
import { SOURCE_TEXT } from '../DemonstrativeLabel/DemonstrativeLabel.jsx';

// Example tests for the FinanceCard component (Req 7.1, 7.2, 7.3, 7.4).
describe('FinanceCard', () => {
  const finances = {
    total: 12.5,
    sources: [
      { category: 'Fundo partidário', percentage: 60 },
      { category: 'Doações de pessoas físicas', percentage: 30 },
      { category: 'Recursos próprios', percentage: 10 },
    ],
  };

  it('renders the "TOTAL ARRECADADO" label and value as "R$ {value} mi" (Req 7.1)', () => {
    render(<FinanceCard finances={finances} />);
    expect(screen.getByText(TOTAL_LABEL)).toBeInTheDocument();
    expect(screen.getByText('R$ 12.5 mi')).toBeInTheDocument();
  });

  it('formatTotal produces the "R$ {value} mi" shape', () => {
    expect(formatTotal(12.5)).toBe('R$ 12.5 mi');
    expect(formatTotal(0)).toBe('R$ 0 mi');
  });

  it('renders the "Origem dos recursos" section heading (Req 7.2)', () => {
    render(<FinanceCard finances={finances} />);
    expect(
      screen.getByRole('heading', { name: SOURCES_HEADING })
    ).toBeInTheDocument();
  });

  it('renders one bar per funding source (Req 7.2)', () => {
    render(<FinanceCard finances={finances} />);
    expect(screen.getAllByTestId('finance-source')).toHaveLength(
      finances.sources.length
    );
  });

  it('shows each category name and percentage, sizing bars proportionally (Req 7.3)', () => {
    render(<FinanceCard finances={finances} />);
    expect(screen.getByText('Fundo partidário')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();

    const fills = screen.getAllByTestId('finance-bar-fill');
    expect(fills[0]).toHaveStyle({ width: '60%' });
    expect(fills[1]).toHaveStyle({ width: '30%' });
    expect(fills[2]).toHaveStyle({ width: '10%' });

    const bars = screen.getAllByRole('progressbar');
    expect(bars[0]).toHaveAttribute('aria-valuenow', '60');
  });

  it('includes the data-source label (Req 7.4)', () => {
    render(<FinanceCard finances={finances} />);
    expect(screen.getByText(SOURCE_TEXT)).toBeInTheDocument();
  });

  it('renders safely with no sources', () => {
    render(<FinanceCard finances={{ total: 5, sources: [] }} />);
    expect(screen.getByText('R$ 5 mi')).toBeInTheDocument();
    expect(screen.queryAllByTestId('finance-source')).toHaveLength(0);
  });
});
