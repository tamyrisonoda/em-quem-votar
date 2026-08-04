import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProposalCard, { PROPOSAL_SOURCE_TEXT } from './ProposalCard.jsx';

// Example tests for the ProposalCard component (Req 6.2, 6.3).
describe('ProposalCard', () => {
  it('renders the proposal text from a proposal object', () => {
    render(<ProposalCard proposal={{ theme: 'Saúde', text: 'Ampliar postos de saúde.' }} />);
    expect(screen.getByText('Ampliar postos de saúde.')).toBeInTheDocument();
  });

  it('renders the exact "Dados demonstrativos" source text', () => {
    render(<ProposalCard proposal={{ theme: 'Educação', text: 'Investir em escolas.' }} />);
    expect(screen.getByText('Dados demonstrativos')).toBeInTheDocument();
  });

  it('exports the exact source text constant', () => {
    expect(PROPOSAL_SOURCE_TEXT).toBe('Dados demonstrativos');
  });

  it('accepts explicit text/theme props that override the proposal object', () => {
    render(
      <ProposalCard
        proposal={{ theme: 'Saúde', text: 'ignored' }}
        text="Reduzir filas de espera."
        theme="Economia"
      />
    );
    expect(screen.getByText('Reduzir filas de espera.')).toBeInTheDocument();
    expect(screen.getByText('Economia')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('omits the theme label when no theme is provided', () => {
    const { container } = render(<ProposalCard text="Proposta sem tema." />);
    expect(screen.getByText('Proposta sem tema.')).toBeInTheDocument();
    // Only the proposal text (p) and the source (small) are present.
    expect(container.querySelector('span')).toBeNull();
  });
});
