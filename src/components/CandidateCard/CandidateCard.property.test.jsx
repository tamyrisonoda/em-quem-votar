// Feature: em-quem-votar, Property 8: Candidate card renders all required fields
//
// Property-based tests for the CandidateCard component.
//
// Property 8 statement: For ANY candidate, the rendered CandidateCard contains
// the candidate's name, electoral number, office, party, and ideology tag, and
// an image with non-empty descriptive alt text. For ANY candidate whose office
// is "Governador", the card additionally contains the state, and the card links
// to /candidato/{id}.
//
// Validates: Requirements 3.10, 3.11, 3.12, 16.3

import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fc from 'fast-check';
import CandidateCard from './CandidateCard.jsx';
import { candidateArb } from '../../test/generators.js';

const NUM_RUNS = 100;

/** Render a CandidateCard inside a MemoryRouter and return the container. */
function renderCard(candidate) {
  const { container } = render(
    <MemoryRouter>
      <CandidateCard candidate={candidate} />
    </MemoryRouter>
  );
  return container;
}

describe('CandidateCard — Property 8: renders all required fields', () => {
  it('renders name, number, office, party, ideology, and a non-empty-alt image for any candidate', () => {
    fc.assert(
      fc.property(candidateArb(), (candidate) => {
        try {
          const container = renderCard(candidate);
          const text = container.textContent;

          // Name, electoral number, office, party, ideology tag are all present.
          expect(text).toContain(candidate.name);
          expect(text).toContain(candidate.number);
          expect(text).toContain(candidate.position);
          expect(text).toContain(candidate.party);
          expect(text).toContain(candidate.ideology);

          // An <img> exists with non-empty descriptive alt text (Req 16.3).
          const img = container.querySelector('img');
          expect(img).not.toBeNull();
          const alt = img.getAttribute('alt');
          expect(alt).toBe(
            `Foto de ${candidate.name}, candidato a ${candidate.position}`
          );
          expect(alt.length).toBeGreaterThan(0);

          // The whole card links to /candidato/{id} (Req 3.12).
          const link = container.querySelector('a');
          expect(link).not.toBeNull();
          expect(link.getAttribute('href')).toBe(
            `/candidato/${candidate.id}`
          );
        } finally {
          cleanup();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('additionally renders the state for any Governador candidate (Req 3.11)', () => {
    fc.assert(
      fc.property(candidateArb({ office: 'Governador' }), (candidate) => {
        try {
          const container = renderCard(candidate);
          const text = container.textContent;

          // Baseline required fields still hold.
          expect(text).toContain(candidate.name);
          expect(text).toContain(candidate.number);
          expect(text).toContain(candidate.position);
          expect(text).toContain(candidate.party);
          expect(text).toContain(candidate.ideology);

          // Governador cards additionally show the state (UF).
          expect(candidate.state).toBeTruthy();
          expect(text).toContain(candidate.state);

          // The whole card links to /candidato/{id} (Req 3.12).
          const link = container.querySelector('a');
          expect(link).not.toBeNull();
          expect(link.getAttribute('href')).toBe(
            `/candidato/${candidate.id}`
          );
        } finally {
          cleanup();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
