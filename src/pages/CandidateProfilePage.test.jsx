import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CandidateProfilePage, { NOT_FOUND_MESSAGE } from './CandidateProfilePage.jsx';
import { candidates } from '../data/dataSource.js';

// Render CandidateProfilePage inside a router with a :id route param so
// useParams resolves. (Req 4.1, 4.3, 4.5)
function renderAt(id) {
  return render(
    <MemoryRouter initialEntries={[`/candidato/${id}`]}>
      <Routes>
        <Route path="/candidato/:id" element={<CandidateProfilePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CandidateProfilePage', () => {
  const candidate = candidates[0];

  it('renders the profile header and profile tabs for a known id (Req 4.1, 4.3)', () => {
    renderAt(candidate.id);

    // Header shows the candidate name (Req 4.1).
    expect(
      screen.getByRole('heading', { level: 1, name: candidate.name })
    ).toBeInTheDocument();

    // The four profile tabs are present in order (Req 4.3).
    const tabLabels = screen.getAllByRole('tab').map((el) => el.textContent);
    expect(tabLabels).toEqual(['Bio', 'Propostas', 'Finanças', 'Histórico']);
  });

  it('shows the Bio tab with Formação and Trajetória cards (Req 5.1, 5.2, 5.3)', () => {
    renderAt(candidate.id);
    // The biography summary is shown when present (may be empty for real data
    // whose editorial bio has not been curated yet).
    if (candidate.bio) {
      expect(screen.getByText(candidate.bio)).toBeInTheDocument();
    }
    expect(screen.getByText('Formação')).toBeInTheDocument();
    expect(screen.getByText('Trajetória')).toBeInTheDocument();
  });

  it('renders a not-found view for an unknown id (Req 4.5)', () => {
    renderAt('id-que-nao-existe');
    expect(screen.getByText(NOT_FOUND_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
