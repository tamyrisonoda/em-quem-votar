// Feature: em-quem-votar, Property 19: Unknown paths render the not-found view
//
// Property-based test for the application routing table (Design Property 19,
// Validates: Requirements 17.4).
//
// For ANY path that does not match a defined route, App renders the not-found
// view: a heading "Página não encontrada" plus a control ("Voltar ao início")
// that returns the User to "/".
//
// App renders only <Routes> (no Router), so each render is wrapped in a
// MemoryRouter with the generated path as its initial entry. A QuizProvider is
// included because some routes require it; the not-found view does not, but
// wrapping is harmless and keeps the mounted App identical to production.
//
// Defined routes (must NOT be treated as unknown):
//   /, /presidente, /governador, /governador/:uf, /candidato/:id,
//   /quiz, /quiz/perguntas, /quiz/resultado
//
// Strategy: build paths that provably cannot match any defined route by
// prefixing every generated path with a leading segment that is guaranteed to
// be outside the known top-level set. This avoids accidental matches against
// the dynamic routes (/candidato/:id, /governador/:uf).

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { QuizProvider } from './context/QuizContext.jsx';

// Top-level segments that begin a defined route. A generated path whose first
// segment is none of these cannot match any defined route (including the
// dynamic /candidato/:id and /governador/:uf routes).
const KNOWN_TOP_LEVEL = new Set(['presidente', 'governador', 'candidato', 'quiz']);

// URL-safe path segments (letters, digits, hyphens, underscores). Non-empty.
const segmentArb = fc
  .stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('')), {
    minLength: 1,
    maxLength: 12,
  })
  .filter((s) => s.length > 0);

// Arbitrary path guaranteed to be outside every defined route: prepend a fixed
// leading segment that is not a known top-level route, then append 0..3 random
// segments for variety. The result always resolves to the "*" catch-all.
const unknownPathArb = fc
  .tuple(segmentArb, fc.array(segmentArb, { minLength: 0, maxLength: 3 }))
  .map(([lead, rest]) => {
    // Force the leading segment out of the known set without losing randomness.
    const safeLead = KNOWN_TOP_LEVEL.has(lead) ? `x-${lead}` : lead;
    return '/' + [safeLead, ...rest].join('/');
  })
  .filter((path) => !KNOWN_TOP_LEVEL.has(path.split('/')[1]));

describe('App — Property 19: unknown paths render the not-found view', () => {
  it('renders the not-found view (heading + link to "/") for any unknown path', () => {
    fc.assert(
      fc.property(unknownPathArb, (path) => {
        const { getByText, getByRole } = render(
          <MemoryRouter initialEntries={[path]}>
            <QuizProvider>
              <App />
            </QuizProvider>
          </MemoryRouter>
        );

        try {
          // The not-found heading is present.
          expect(getByText('Página não encontrada')).toBeInTheDocument();

          // The control back to "/" is present and points home.
          const homeLink = getByRole('link', { name: 'Voltar ao início' });
          expect(homeLink).toBeInTheDocument();
          expect(homeLink.getAttribute('href')).toBe('/');
        } finally {
          cleanup();
        }
      }),
      { numRuns: 150 }
    );
  });
});
