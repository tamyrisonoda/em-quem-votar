import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CandidateCard from './CandidateCard.jsx';

// Example/render tests for the CandidateCard component
// (Req 3.10, 3.11, 3.12, 16.3, 16.4, 14.2). CandidateCard renders a <Link>, so
// every render is wrapped in a MemoryRouter.

/** Build a minimal candidate record for rendering. */
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

function renderCard(candidate) {
  return render(
    <MemoryRouter>
      <CandidateCard candidate={candidate} />
    </MemoryRouter>
  );
}

describe('CandidateCard', () => {
  it('renders name, electoral number, office, party, and ideology tag (Req 3.10)', () => {
    const candidate = makeCandidate();
    renderCard(candidate);

    expect(screen.getByText('Aurora Vidal')).toBeInTheDocument();
    expect(screen.getByText(/Nº\s*10/)).toBeInTheDocument();
    expect(screen.getByText('Presidente da República')).toBeInTheDocument();
    expect(screen.getByText('PMS')).toBeInTheDocument();
    expect(screen.getByText('Esquerda')).toBeInTheDocument();
  });

  it('renders the photo with descriptive, non-empty alt text (Req 16.3)', () => {
    const candidate = makeCandidate();
    renderCard(candidate);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', candidate.photo);
    expect(img).toHaveAttribute(
      'alt',
      'Foto de Aurora Vidal, candidato a Presidente da República'
    );
    expect(img.getAttribute('alt')).not.toBe('');
  });

  it('links the whole card to /candidato/{id} (Req 3.12, 16.4)', () => {
    const candidate = makeCandidate();
    renderCard(candidate);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/candidato/pres-aurora-vidal');
  });

  it('shows the state when the office is Governador (Req 3.11)', () => {
    const candidate = makeCandidate({
      id: 'gov-marina-sp',
      name: 'Marina Souza',
      position: 'Governador',
      state: 'SP',
    });
    renderCard(candidate);

    expect(screen.getByText('SP')).toBeInTheDocument();
  });

  it('does not render a state for Presidente candidates (state null) (Req 3.11)', () => {
    const candidate = makeCandidate({ position: 'Presidente da República', state: null });
    renderCard(candidate);

    // No stray UF text; the office remains Presidente.
    expect(screen.getByText('Presidente da República')).toBeInTheDocument();
    expect(screen.queryByText('SP')).not.toBeInTheDocument();
  });
});
