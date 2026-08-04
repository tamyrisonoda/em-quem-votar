import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CandidateListPage from './CandidateListPage.jsx';
import { SEARCH_PLACEHOLDER } from '../components/SearchBar/SearchBar.jsx';

// Render/integration tests for CandidateListPage. The page pulls REAL data via
// the Data_Provider (no mocks) and composes SearchBar + FilterChips +
// CandidateList. Candidate cards are <Link>s, so renders are wrapped in a
// router. The Governador route needs the :uf param, so it is mounted through a
// Routes/Route pair.
//
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6, 3.5, 3.13.

/** Render the Presidente route (/presidente, not state-scoped). */
function renderPresidente() {
  return render(
    <MemoryRouter initialEntries={['/presidente']}>
      <Routes>
        <Route
          path="/presidente"
          element={<CandidateListPage office="Presidente da República" />}
        />
      </Routes>
    </MemoryRouter>
  );
}

/** Render the Governador route (/governador/:uf) for a given UF. */
function renderGovernador(uf) {
  return render(
    <MemoryRouter initialEntries={[`/governador/${uf}`]}>
      <Routes>
        <Route
          path="/governador/:uf"
          element={<CandidateListPage office="Governador" />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('CandidateListPage', () => {
  it('lists Presidente candidates and renders the shared controls (Req 3.1, 3.3, 3.4, 3.6)', () => {
    renderPresidente();

    // 5 Presidente candidates in the Data_Store.
    expect(screen.getByText('5 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(5);

    // SearchBar (Req 3.4) and FilterChips (Req 3.6) are present.
    expect(
      screen.getByPlaceholderText(SEARCH_PLACEHOLDER)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Todos' })
    ).toBeInTheDocument();
  });

  it('scopes the Governador list by the :uf route param (Req 3.2)', () => {
    renderGovernador('SP');

    // Only the two SP Governador candidates should be shown.
    expect(screen.getByText('2 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Marina Castro')).toBeInTheDocument();
    expect(screen.getByText('Otávio Lemos')).toBeInTheDocument();
    expect(screen.queryByText('Tereza Albuquerque')).not.toBeInTheDocument();
  });

  it('filters the displayed candidates as the user types a search query (Req 3.5, 3.3)', async () => {
    const user = userEvent.setup();
    renderPresidente();

    await user.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), 'Aurora');

    expect(screen.getByText('1 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Aurora Vidal')).toBeInTheDocument();
    expect(screen.queryByText('Beatriz Nunes')).not.toBeInTheDocument();
  });

  it('shows the no-results message when a search matches nothing (Req 3.13)', async () => {
    const user = userEvent.setup();
    renderPresidente();

    await user.type(
      screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
      'inexistente-xyz'
    );

    expect(screen.getByText('0 candidatos disponíveis')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
