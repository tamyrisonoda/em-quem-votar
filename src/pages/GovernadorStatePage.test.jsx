// src/pages/GovernadorStatePage.test.jsx
//
// Render tests for GovernadorStatePage. Property (12.3) and the disabled→enabled
// example (12.11) are covered by separate dispatched tasks; this file verifies
// the page renders its required structure and wires navigation.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GovernadorStatePage, { STATE_PROMPT } from './GovernadorStatePage.jsx';
import { getStates } from '../providers/dataProvider.js';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/governador']}>
      <Routes>
        <Route path="/governador" element={<GovernadorStatePage />} />
        <Route path="/governador/:uf" element={<div>list for uf</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GovernadorStatePage', () => {
  it('displays the exact prompt (Req 2.1)', () => {
    renderPage();
    expect(screen.getByText(STATE_PROMPT)).toBeInTheDocument();
    expect(STATE_PROMPT).toBe('Em qual estado você vota?');
  });

  it('renders a labeled select populated from getStates (Req 2.2, 16.2)', () => {
    renderPage();
    const select = screen.getByLabelText('Estado');
    expect(select).toBeInTheDocument();

    // Every state from the provider appears as an option using its name.
    for (const state of getStates()) {
      expect(screen.getByRole('option', { name: state.name })).toBeInTheDocument();
    }
  });

  it('keeps Continuar disabled until a state is selected (Req 2.4)', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('navigates to /governador/{uf} on continue (Req 2.5)', async () => {
    const user = userEvent.setup();
    renderPage();

    const [first] = getStates();
    await user.selectOptions(screen.getByLabelText('Estado'), first.uf);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('list for uf')).toBeInTheDocument();
  });
});
