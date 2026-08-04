import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultCard from './ResultCard.jsx';

// Example/render tests for the ResultCard component (Req 12.2, 12.3).
// ResultCard renders a candidate's name/photo, the overall affinity percentage,
// and an embedded per-theme AffinityChart.

/** Build a minimal candidate record for rendering. */
function makeCandidate(overrides = {}) {
  return {
    id: 'pres-aurora-vidal',
    name: 'Aurora Vidal',
    photo: 'https://placehold.co/400x400?text=Aurora+Vidal',
    ...overrides,
  };
}

/** Build a minimal affinity result for rendering. */
function makeResult(overrides = {}) {
  return {
    candidateId: 'pres-aurora-vidal',
    overall: 82,
    byTheme: [
      { theme: 'economia', percentage: 75 },
      { theme: 'educacao', percentage: 90 },
    ],
    ...overrides,
  };
}

describe('ResultCard', () => {
  it('renders the candidate name (Req 12.2)', () => {
    render(<ResultCard candidate={makeCandidate()} result={makeResult()} />);
    expect(screen.getByText('Aurora Vidal')).toBeInTheDocument();
  });

  it('renders the overall affinity percentage as "{overall}%" (Req 12.2)', () => {
    render(<ResultCard candidate={makeCandidate()} result={makeResult({ overall: 82 })} />);
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('renders the photo with descriptive, non-empty alt text (Req 16.3)', () => {
    const candidate = makeCandidate();
    render(<ResultCard candidate={candidate} result={makeResult()} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', candidate.photo);
    expect(img).toHaveAttribute('alt', 'Foto de Aurora Vidal');
    expect(img.getAttribute('alt')).not.toBe('');
  });

  it('embeds a per-theme AffinityChart with one bar per theme (Req 12.3)', () => {
    const themeLabels = { economia: 'Economia', educacao: 'Educação' };
    render(
      <ResultCard
        candidate={makeCandidate()}
        result={makeResult()}
        themeLabels={themeLabels}
      />
    );

    // AffinityChart renders each theme bar as a progressbar with the theme label.
    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(2);
    expect(screen.getByText('Economia')).toBeInTheDocument();
    expect(screen.getByText('Educação')).toBeInTheDocument();
    // Per-theme percentages surface through the chart.
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
