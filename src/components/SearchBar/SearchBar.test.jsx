import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar, { SEARCH_PLACEHOLDER } from './SearchBar.jsx';

// Example tests for the SearchBar component (Req 3.4, 16.2).
describe('SearchBar', () => {
  it('renders the exact placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Buscar candidato ou partido...')).toBeInTheDocument();
  });

  it('exports the exact placeholder constant', () => {
    expect(SEARCH_PLACEHOLDER).toBe('Buscar candidato ou partido...');
  });

  it('associates a label with the input (Req 16.2)', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    // getByLabelText resolves the input via its associated <label>, which only
    // succeeds when the label/for association is correct.
    const input = screen.getByLabelText('Buscar candidato ou partido');
    expect(input).toBe(screen.getByPlaceholderText(SEARCH_PLACEHOLDER));
  });

  it('reflects the controlled value prop', () => {
    render(<SearchBar value="lula fic" onChange={() => {}} />);
    expect(screen.getByLabelText('Buscar candidato ou partido')).toHaveValue('lula fic');
  });

  it('emits each typed character upward via onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    await user.type(screen.getByLabelText('Buscar candidato ou partido'), 'abc');

    // Controlled input with a static value="" reports the single new char each edit.
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'b');
    expect(onChange).toHaveBeenNthCalledWith(3, 'c');
  });

  it('uses a custom id to link label and input when provided', () => {
    render(<SearchBar value="" onChange={() => {}} id="my-search" />);
    expect(screen.getByLabelText('Buscar candidato ou partido')).toHaveAttribute('id', 'my-search');
  });
});
