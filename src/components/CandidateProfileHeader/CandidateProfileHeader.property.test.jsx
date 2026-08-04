// Feature: em-quem-votar, Property 9: Profile header renders all required fields
//
// Property 9: For ANY candidate, the rendered profile header contains the
// candidate's name, number, office, party, ideology tag, and a photo with a
// non-empty descriptive alt; the state is shown when applicable (Governador /
// non-null) and omitted otherwise (Presidente / null); and a back control is
// present (Req 4.2).
//
// Validates: Requirements 4.1, 4.2

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CandidateProfileHeader, {
  BACK_LABEL,
  buildPhotoAlt,
} from './CandidateProfileHeader.jsx';
import { candidateArb } from '../../test/generators.js';

function renderHeader(candidate) {
  return render(
    <MemoryRouter>
      <CandidateProfileHeader candidate={candidate} />
    </MemoryRouter>
  );
}

describe('CandidateProfileHeader property tests', () => {
  it('renders all required fields for any candidate (Property 9)', () => {
    fc.assert(
      fc.property(candidateArb(), (candidate) => {
        try {
          const { container } = renderHeader(candidate);

          // Photo: non-empty descriptive alt equal to the computed string.
          const img = container.querySelector('img');
          expect(img).not.toBeNull();
          const alt = img.getAttribute('alt');
          expect(alt).toBe(buildPhotoAlt(candidate));
          expect(alt.length).toBeGreaterThan(0);

          // Name is rendered in the header's <h1> (compared via textContent so
          // whitespace-only generated names are not normalized away by matchers).
          const heading = screen.getByRole('heading', { level: 1 });
          expect(heading).toBeInTheDocument();
          expect(heading.textContent).toBe(candidate.name);

          // Number / office / party / ideology present (robust via testids).
          // Compare exact textContent so whitespace-only generated field values
          // are not normalized away by the toHaveTextContent matcher.
          expect(screen.getByTestId('candidate-number').textContent).toBe(
            candidate.number
          );
          expect(screen.getByTestId('candidate-office').textContent).toBe(
            candidate.position
          );
          expect(screen.getByTestId('candidate-party').textContent).toBe(
            candidate.party
          );
          expect(screen.getByTestId('candidate-ideology').textContent).toBe(
            candidate.ideology
          );

          // A back control is present (Req 4.2).
          const backButton = screen.getByRole('button', {
            name: new RegExp(BACK_LABEL),
          });
          expect(backButton).toBeInTheDocument();

          // State: shown when applicable (non-null), absent otherwise.
          const hasState = candidate.state != null && candidate.state !== '';
          if (hasState) {
            const stateEl = screen.getByTestId('candidate-state');
            expect(stateEl).toBeInTheDocument();
            expect(stateEl.textContent).toBe(candidate.state);
          } else {
            expect(screen.queryByTestId('candidate-state')).not.toBeInTheDocument();
          }
        } finally {
          cleanup();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('shows the state for Governador candidates and hides it for Presidente (Property 9)', () => {
    fc.assert(
      fc.property(
        candidateArb({ office: 'Governador' }),
        candidateArb({ office: 'Presidente da República' }),
        (governador, presidente) => {
          try {
            // Governador: state testid present with the state text.
            const { container } = renderHeader(governador);
            const stateEl = screen.getByTestId('candidate-state');
            expect(stateEl).toBeInTheDocument();
            expect(stateEl).toHaveTextContent(governador.state);
            // sanity: the header rendered a photo
            expect(within(container).getByRole('img')).toBeInTheDocument();
            cleanup();

            // Presidente (state null): state testid absent.
            renderHeader(presidente);
            expect(
              screen.queryByTestId('candidate-state')
            ).not.toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
