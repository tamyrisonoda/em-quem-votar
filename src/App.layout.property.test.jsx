// Feature: em-quem-votar, Property 20: Header and Footer render on every route
//
// Property-based test for the App routing layout (Design Property 20,
// Validates: Requirements 17.5).
//
// For EVERY route — including unknown paths that fall through to the NotFound
// page — the shared layout renders both the global Header (role="banner") and
// the global Footer (role="contentinfo"). We sample from a set of
// representative paths covering ALL routes and assert both landmarks are
// present after each render.
//
// App renders only <Routes> (no Router), so it is mounted inside a
// MemoryRouter. QuizProvider is required because the quiz pages consume
// useQuiz(). The /candidato/:id path uses a REAL candidate id so the profile
// page renders fully; the /quiz/resultado page may redirect to /quiz when the
// quiz is incomplete, but that still renders within the layout, so the
// banner/contentinfo landmarks are present regardless.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { QuizProvider } from './context/QuizContext.jsx';
import { getCandidatesByOffice, OFFICE_PRESIDENTE } from './providers/dataProvider.js';

// A real candidate id so /candidato/:id renders the full profile page.
const realCandidateId = getCandidatesByOffice(OFFICE_PRESIDENTE)[0].id;

// Representative paths covering every route branch, plus an unknown path that
// falls through to the NotFound page ("*").
const routeArb = fc.constantFrom(
  '/',
  '/presidente',
  '/governador',
  '/governador/SP',
  `/candidato/${realCandidateId}`,
  '/quiz',
  '/quiz/perguntas',
  '/quiz/resultado',
  '/some-unknown-path',
);

describe('App layout — Property 20: Header and Footer render on every route', () => {
  it('renders the Header (banner) and Footer (contentinfo) for every route', () => {
    fc.assert(
      fc.property(routeArb, (path) => {
        render(
          <MemoryRouter initialEntries={[path]}>
            <QuizProvider>
              <App />
            </QuizProvider>
          </MemoryRouter>,
        );

        try {
          // Target the GLOBAL Header unambiguously via its unique logo link.
          // Some pages render a nested page-level <header> for their heading,
          // and jsdom/testing-library maps every <header> to the "banner" role
          // (it does not apply ARIA's sectioning-context exclusion), so a bare
          // getByRole('banner') can match multiple elements. The "EM QUEM
          // VOTAR" logo link only exists inside the global Header, so its
          // presence (inside a <header> landmark) confirms the Header rendered.
          const logo = screen.getByRole('link', { name: 'EM QUEM VOTAR' });
          expect(logo).toBeInTheDocument();
          expect(logo.closest('header')).toBeInTheDocument();

          // The global Footer is the sole contentinfo landmark on every route.
          expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        } finally {
          cleanup();
        }
      }),
      { numRuns: 100 },
    );
  });
});
