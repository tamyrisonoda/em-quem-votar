// Feature: em-quem-votar, Property 21: State options are data-driven
//
// Property-based test for GovernadorStatePage (Design Property 21,
// Validates: Requirements 2.3, 2.5).
//
// The state selection options are DATA-DRIVEN: the set of selectable states
// rendered by the page equals exactly the states supplied by getStates() —
// one <option> per state (value === uf, text === name) plus the single
// placeholder option, with no extra state options. Because getStates() is the
// only source, appending a state to the Data_Store adds an option with no page
// change. And for any state the user picks, selecting it and clicking
// "Continuar" navigates to /governador/{uf} using that state's uf (Req 2.5).
//
// GovernadorStatePage uses useNavigate, so renders are wrapped in a
// MemoryRouter with a Routes whose "/governador/:uf" route renders a probe
// that echoes the uf param.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import GovernadorStatePage from './GovernadorStatePage.jsx';
import { getStates } from '../providers/dataProvider.js';

// Probe rendered at the scoped list route: echoes the :uf param so the test
// can assert which UF the page navigated to.
function UfProbe() {
  const { uf } = useParams();
  return <div data-testid="nav-uf">{uf}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/governador']}>
      <Routes>
        <Route path="/governador" element={<GovernadorStatePage />} />
        <Route path="/governador/:uf" element={<UfProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GovernadorStatePage — Property 21: state options are data-driven', () => {
  it('renders exactly one option per getStates() entry (value=uf, text=name) plus the placeholder', () => {
    renderPage();
    try {
      const states = getStates();
      const select = screen.getByLabelText('Estado');
      const options = Array.from(select.querySelectorAll('option'));

      // One option per state + the single placeholder option.
      expect(options).toHaveLength(states.length + 1);

      // The placeholder is present with an empty value.
      const placeholder = options.find((o) => o.value === '');
      expect(placeholder).toBeDefined();
      expect(placeholder.textContent).toBe('Selecione seu estado');

      // The set of non-placeholder options equals the set from getStates()
      // exactly — same uf values and same displayed names, nothing extra.
      const rendered = options
        .filter((o) => o.value !== '')
        .map((o) => ({ uf: o.value, name: o.textContent }));

      const expected = states.map((s) => ({ uf: s.uf, name: s.name }));

      const byUf = (a, b) => a.uf.localeCompare(b.uf);
      expect([...rendered].sort(byUf)).toEqual([...expected].sort(byUf));
    } finally {
      cleanup();
    }
  });

  it('for any state, selecting it and clicking Continuar navigates to /governador/{uf} (Req 2.5)', async () => {
    const ufArb = fc.constantFrom(...getStates().map((s) => s.uf));

    await fc.assert(
      fc.asyncProperty(ufArb, async (uf) => {
        // delay: null removes userEvent's realistic inter-action delay so the
        // property can sample 100 selections without timing out.
        const user = userEvent.setup({ delay: null });
        renderPage();
        try {
          await user.selectOptions(screen.getByLabelText('Estado'), uf);
          await user.click(screen.getByRole('button', { name: 'Continuar' }));

          // Navigation landed on the scoped list route for exactly this uf.
          expect(screen.getByTestId('nav-uf').textContent).toBe(uf);
        } finally {
          cleanup();
        }
      }),
      { numRuns: 100 },
    );
  }, 30000);
});
