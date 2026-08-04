// src/components/AffinityChart/AffinityChart.test.jsx
//
// Render tests for the AffinityChart component (Req 12.3): one labeled bar per
// theme, each showing the theme label + percentage, with a proportional bar.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AffinityChart from './AffinityChart.jsx';

describe('AffinityChart', () => {
  const byTheme = [
    { theme: 'economia', percentage: 80 },
    { theme: 'estado', percentage: 50 },
    { theme: 'seguranca', percentage: 25 },
  ];
  const themeLabels = {
    economia: 'Economia',
    estado: 'Papel do Estado',
    seguranca: 'Segurança Pública',
  };

  it('renders one progressbar per theme entry', () => {
    render(<AffinityChart byTheme={byTheme} themeLabels={themeLabels} />);
    expect(screen.getAllByRole('progressbar')).toHaveLength(byTheme.length);
  });

  it('shows the display label and percentage text for each theme', () => {
    render(<AffinityChart byTheme={byTheme} themeLabels={themeLabels} />);
    expect(screen.getByText('Economia')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Papel do Estado')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Segurança Pública')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('sets aria-valuenow and proportional bar width from the percentage', () => {
    render(<AffinityChart byTheme={[{ theme: 'economia', percentage: 80 }]} themeLabels={themeLabels} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '80');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar.firstChild).toHaveStyle({ width: '80%' });
  });

  it('falls back to the raw theme id when no label is provided', () => {
    render(<AffinityChart byTheme={[{ theme: 'educacao', percentage: 60 }]} />);
    expect(screen.getByText('educacao')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders nothing but the list when byTheme is empty', () => {
    render(<AffinityChart byTheme={[]} />);
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
  });
});
