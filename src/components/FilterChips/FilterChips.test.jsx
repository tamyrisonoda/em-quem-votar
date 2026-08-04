// src/components/FilterChips/FilterChips.test.jsx
//
// Example/render tests for the FilterChips component (Req 3.6, 16.4).

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterChips, { FILTER_OPTIONS } from './FilterChips.jsx';

describe('FilterChips', () => {
  it('renders all six ideology filter buttons in order', () => {
    render(<FilterChips value="Todos" onChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Todos',
      'Esquerda',
      'Centro-esquerda',
      'Centro',
      'Centro-direita',
      'Direita',
    ]);
    expect(FILTER_OPTIONS).toHaveLength(6);
  });

  it('marks only the selected filter with aria-pressed=true', () => {
    render(<FilterChips value="Centro" onChange={() => {}} />);
    const selected = screen.getByRole('button', { name: 'Centro' });
    expect(selected).toHaveAttribute('aria-pressed', 'true');

    const notSelected = screen.getByRole('button', { name: 'Direita' });
    expect(notSelected).toHaveAttribute('aria-pressed', 'false');
  });

  it('defaults the selected filter to "Todos" when no value is provided', () => {
    render(<FilterChips onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('calls onChange with the clicked filter label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterChips value="Todos" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Esquerda' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Esquerda');
  });
});
