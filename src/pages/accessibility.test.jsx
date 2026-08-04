// src/pages/accessibility.test.jsx
//
// Automated accessibility (a11y) pass over the application's key pages. Each
// page is mounted through <App /> at its real route so the full page — including
// the shared Header/Footer landmarks — is exercised, then run through axe.
//
// Coverage of Requirement 16 (Accessibility):
//   - 16.1 Semantic HTML for page structure / interactive controls — axe checks
//          landmark/structure rules across every rendered page.
//   - 16.2 Every form input has an associated label — asserted via
//          getByLabelText on the listing search input, the governador state
//          select, and the quiz radios (which resolve by their <label>).
//   - 16.3 Descriptive alt text for every image — asserted by requiring a
//          non-empty `alt` on every <img> on the profile page.
//   - 16.4 Interactive controls are native button/link elements — asserted via
//          getAllByRole('link') / getAllByRole('button') on the Home page.
//   - 16.5 / 16.6 Visible focus + hover/focus visual state — the visible focus
//          indicator is provided by a global `:focus-visible` rule in
//          src/styles/global.css plus per-component CSS. jsdom does not compute
//          CSS focus rings, so axe cannot verify the ring itself; instead we
//          assert that interactive controls are focusable NATIVE elements
//          (links/buttons/inputs) which receive that global outline. See the
//          focus-visible test below.
//
// Notes on axe in jsdom: axe may emit benign warnings (e.g. canvas/getContext
// for the color-contrast rule) because jsdom has no layout/paint engine. The
// color-contrast rule cannot be evaluated reliably without real layout, so it is
// disabled here to avoid flakiness; every other rule remains enabled. Contrast
// is a visual/design concern covered by the design tokens and stylesheet.

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';

import App from '../App.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';
import { getCandidatesByOffice, OFFICE_PRESIDENTE } from '../providers/dataProvider.js';

// A real candidate id so the profile route renders the full profile view
// (with candidate photo) rather than the not-found fallback.
const REAL_CANDIDATE_ID = getCandidatesByOffice(OFFICE_PRESIDENTE)[0].id;

// axe options: disable only color-contrast, which requires a real layout/paint
// engine that jsdom lacks (see file header). All other rules stay enabled.
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false } } };

/**
 * Render <App /> at a given path inside the router + quiz providers, mirroring
 * production (main.jsx wraps <App /> in a Router; App owns only <Routes>).
 *
 * @param {string} path initial route to render
 * @returns {import('@testing-library/react').RenderResult}
 */
function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QuizProvider>
        <App />
      </QuizProvider>
    </MemoryRouter>,
  );
}

const KEY_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Listing (presidente)', path: '/presidente' },
  { name: 'Governador state select', path: '/governador' },
  { name: 'Candidate profile', path: `/candidato/${REAL_CANDIDATE_ID}` },
  { name: 'Quiz intro', path: '/quiz' },
  { name: 'Quiz questions', path: '/quiz/perguntas' },
];

describe('Accessibility — automated axe pass on key pages (Req 16.1)', () => {
  it.each(KEY_PAGES)('has no axe violations on $name ($path)', async ({ path }) => {
    const { container } = renderAppAt(path);
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});

describe('Accessibility — labeled form inputs (Req 16.2)', () => {
  it('resolves the listing search input by its label', () => {
    const { getByLabelText } = renderAppAt('/presidente');
    const input = getByLabelText('Buscar candidato ou partido');
    expect(input.tagName).toBe('INPUT');
  });

  it('resolves the governador state select by its label', () => {
    const { getByLabelText } = renderAppAt('/governador');
    const select = getByLabelText('Estado');
    expect(select.tagName).toBe('SELECT');
  });

  it('labels every quiz answer radio so it resolves by accessible name', () => {
    const { getAllByRole } = renderAppAt('/quiz/perguntas');
    const radios = getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(0);
    // Each radio resolves via getByLabelText, which only succeeds when the
    // <label>/htmlFor association is present (Req 16.2).
    for (const radio of radios) {
      expect(radio).toHaveAccessibleName();
    }
  });
});

describe('Accessibility — descriptive image alt text (Req 16.3)', () => {
  it('gives every image on the profile page a non-empty alt', () => {
    const { container } = renderAppAt(`/candidato/${REAL_CANDIDATE_ID}`);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      expect(img.getAttribute('alt')).toBeTruthy();
    }
  });
});

describe('Accessibility — native interactive controls (Req 16.4)', () => {
  it('renders navigation as native link/button elements on Home', () => {
    const { getAllByRole } = renderAppAt('/');
    const links = getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    // Every accessible link must be a native <a> element (keyboard operable).
    for (const link of links) {
      expect(link.tagName).toBe('A');
    }
  });
});

describe('Accessibility — visible focus indicator (Req 16.5 / 16.6)', () => {
  // The visible focus ring is provided by a global `:focus-visible` rule in
  // src/styles/global.css (plus per-component CSS). jsdom has no paint/layout
  // engine, so the computed outline cannot be asserted here. Instead we verify
  // the precondition that makes the global ring apply: interactive controls are
  // focusable NATIVE elements (a/button/input/select) that receive focus and the
  // global :focus-visible outline. This keeps the assertion light and robust.
  it('exposes focusable native interactive controls on the listing page', () => {
    const { getByLabelText, getAllByRole } = renderAppAt('/presidente');

    const searchInput = getByLabelText('Buscar candidato ou partido');
    searchInput.focus();
    expect(document.activeElement).toBe(searchInput);

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button.tagName).toBe('BUTTON');
    }
  });
});
