import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import CandidateList, { NO_RESULTS_MESSAGE } from './CandidateList.jsx';
import SearchBar, { SEARCH_PLACEHOLDER } from '../SearchBar/SearchBar.jsx';

// Example + accessibility tests for the listing UI (Task 8.7).
//
// These cover two user-facing guarantees of the candidate listing screen:
//   - The search input is labeled for assistive technology (Req 16.2).
//   - A non-matching query surfaces the no-results message (Req 3.13).
//
// CandidateList renders CandidateCards as <Link>s, so it is wrapped in a
// MemoryRouter. SearchBar is a plain controlled input and needs no router.

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
];

describe('Listing UI (example + accessibility)', () => {
  it('gives the search input an associated label and the exact placeholder (Req 16.2)', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    // getByLabelText resolves the input via its <label> association, which
    // only succeeds when the label/for wiring is correct (Req 16.2).
    const input = screen.getByLabelText('Buscar candidato ou partido');
    expect(input).toBe(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));
    expect(input).toHaveAttribute('placeholder', 'Buscar candidato ou partido...');
  });

  it('shows the no-results message for a non-matching query (Req 3.13)', () => {
    render(
      <MemoryRouter>
        <CandidateList candidates={CANDIDATES} query="inexistente-xyz" />
      </MemoryRouter>
    );

    expect(screen.getByText('Nenhum candidato encontrado.')).toBeInTheDocument();
    expect(screen.getByText(NO_RESULTS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('has no detectable accessibility violations for the labeled search + no-results state', async () => {
    const { container } = render(
      <MemoryRouter>
        <SearchBar value="inexistente-xyz" onChange={() => {}} />
        <CandidateList candidates={CANDIDATES} query="inexistente-xyz" />
      </MemoryRouter>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
