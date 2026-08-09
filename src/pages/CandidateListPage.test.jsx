import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CandidateListPage from './CandidateListPage.jsx';
import { SEARCH_PLACEHOLDER } from '../components/SearchBar/SearchBar.jsx';
import {
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
  OFFICE_GOVERNADOR,
} from '../providers/dataProvider.js';

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
    const pres = getCandidatesByOffice(OFFICE_PRESIDENTE);
    renderPresidente();

    // Count and cards match exactly what the Data_Provider returns.
    expect(
      screen.getByText(`${pres.length} candidatos disponíveis`)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(pres.length);

    // SearchBar (Req 3.4) and FilterChips (Req 3.6) are present.
    expect(
      screen.getByPlaceholderText(SEARCH_PLACEHOLDER)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Todos' })
    ).toBeInTheDocument();
  });

  it('scopes the Governador list by the :uf route param (Req 3.2)', () => {
    const sp = getCandidatesByOffice(OFFICE_GOVERNADOR, 'SP');
    renderGovernador('SP');

    // The subtitle count and card count match exactly the SP-scoped list.
    expect(
      screen.getByText(`${sp.length} candidatos disponíveis`)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(sp.length);
    if (sp.length > 0) {
      expect(screen.getByText(sp[0].name)).toBeInTheDocument();
    }
  });

  it('filters the displayed candidates as the user types a search query (Req 3.5, 3.3)', async () => {
    const user = userEvent.setup();
    const pres = getCandidatesByOffice(OFFICE_PRESIDENTE);
    const target = pres[0];
    // A candidate whose name does NOT start with the target's first name token,
    // so it should be filtered out when we search for the target.
    const firstToken = target.name.split(' ')[0];
    const other = pres.find((c) => !c.name.includes(firstToken));

    renderPresidente();

    await user.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), target.name);

    expect(screen.getByText(target.name)).toBeInTheDocument();
    if (other) {
      expect(screen.queryByText(other.name)).not.toBeInTheDocument();
    }
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
