// Feature: em-quem-votar, Property 3: Displayed count equals the number of displayed candidates
//
// Property-based test for the CandidateList component (Design Property 3,
// Validates: Requirements 3.3).
//
// For any candidate set, search query, and ideology filter, the subtitle count
// "{count} candidatos disponíveis" equals the length of the filtered candidate
// list that is actually rendered (i.e. equals the number of rendered
// CandidateCards / links). Cross-checked against filterCandidates(...).length.
//
// CandidateCard is a <Link>, so every render is wrapped in a MemoryRouter.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CandidateList from './CandidateList.jsx';
import { filterCandidates, IDEOLOGY_ALL } from '../../domain/candidateFilter.js';
import {
  candidatesArb,
  searchQueryArb,
  IDEOLOGIES,
} from '../../test/generators.js';

// Ideology filter arbitrary: any of the five ideology categories OR the
// "Todos" sentinel (no ideology constraint) — mirrors the filter controls.
const ideologyFilterArb = fc.constantFrom(IDEOLOGY_ALL, ...IDEOLOGIES);

// Parse N from the exact subtitle form "{N} candidatos disponíveis".
function parseSubtitleCount(container) {
  const match = container.textContent.match(/(\d+) candidatos disponíveis/);
  expect(match, 'subtitle "{count} candidatos disponíveis" must be present').not.toBeNull();
  return Number(match[1]);
}

describe('CandidateList — Property 3: displayed count equals displayed candidates', () => {
  it('subtitle count equals rendered card count and the filtered length', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 8 }),
        searchQueryArb,
        ideologyFilterArb,
        (candidates, query, ideology) => {
          const { container, getAllByRole } = render(
            <MemoryRouter>
              <CandidateList
                candidates={candidates}
                query={query}
                ideology={ideology}
              />
            </MemoryRouter>
          );

          try {
            const subtitleCount = parseSubtitleCount(container);

            // Number of rendered CandidateCards (each card is a link).
            const renderedCards =
              container.querySelector('[data-testid="candidate-grid"]') === null
                ? 0
                : getAllByRole('link').length;

            // Cross-check against the pure filtering logic.
            const expected = filterCandidates(candidates, { query, ideology }).length;

            // Subtitle count reflects exactly what is rendered...
            expect(subtitleCount).toBe(renderedCards);
            // ...and matches the filtered candidate list length.
            expect(subtitleCount).toBe(expected);

            // Empty case: zero count means no cards rendered.
            if (subtitleCount === 0) {
              expect(renderedCards).toBe(0);
            }
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
