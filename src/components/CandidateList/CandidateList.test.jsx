import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CandidateList, { NO_RESULTS_MESSAGE } from './CandidateList.jsx';

// Example/render tests for the CandidateList component (Req 3.3, 3.9, 3.13,
// 14.2). CandidateList renders CandidateCards, each of which is a <Link>, so
// every render is wrapped in a MemoryRouter.

/** Build a minimal candidate record. */
function makeCandidate(overrides = {}) {
  return {
    id: 'pres-aurora-vidal',
    name: 'Aurora Vidal',
    number: '10',
    party: 'PMS',
    position: 'Presidente da República',
    state: null,
    ideology: 'Esquerda',
    photo: 'https://placehold.co/400x400?text=Aurora+Vidal',
    ...overrides,
  };
}

const CANDIDATES = [
  makeCandidate(),
  makeCandidate({
    id: 'pres-bruno-lemos',
    name: 'Bruno Lemos',
    number: '20',
    party: 'PLC',
    ideology: 'Direita',
  }),
  makeCandidate({
    id: 'gov-marina-sp',
    name: 'Marina Souza',
    number: '30',
    party: 'PVN',
    position: 'Governador',
    state: 'SP',
    ideology: 'Centro',
  }),
];

function renderList(props) {
  return render(
    <MemoryRouter>
      <CandidateList {...props} />
    </MemoryRouter>
  );
}

describe('CandidateList', () => {
  it('renders the exact title "Candidatos" (Req 3.3)', () => {
    renderList({ candidates: CANDIDATES });
    expect(
      screen.getByRole('heading', { name: 'Candidatos' })
    ).toBeInTheDocument();
  });

  it('renders the subtitle count equal to the displayed cards (Req 3.3)', () => {
    renderList({ candidates: CANDIDATES });

    expect(screen.getByText('3 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('reflects the filtered count in the subtitle when a query is active (Req 3.3, 3.9)', () => {
    renderList({ candidates: CANDIDATES, query: 'Marina' });

    expect(screen.getByText('1 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('Marina Souza')).toBeInTheDocument();
  });

  it('applies the ideology filter, delegating to candidateFilter (Req 3.9)', () => {
    renderList({ candidates: CANDIDATES, ideology: 'Direita' });

    expect(screen.getByText('1 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Bruno Lemos')).toBeInTheDocument();
    expect(screen.queryByText('Aurora Vidal')).not.toBeInTheDocument();
  });

  it('shows the no-results message when the filtered list is empty (Req 3.13)', () => {
    renderList({ candidates: CANDIDATES, query: 'inexistente-xyz' });

    expect(screen.getByText(NO_RESULTS_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('0 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('handles an empty candidate set with the no-results message (Req 3.13)', () => {
    renderList({ candidates: [] });

    expect(screen.getByText(NO_RESULTS_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('0 candidatos disponíveis')).toBeInTheDocument();
  });
});
