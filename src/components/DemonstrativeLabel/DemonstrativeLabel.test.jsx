import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemonstrativeLabel, { DEMONSTRATIVE_TEXT } from './DemonstrativeLabel.jsx';

// Example test for the DemonstrativeLabel component (Req 14.1).
describe('DemonstrativeLabel', () => {
  it('renders the exact demonstrative text', () => {
    render(<DemonstrativeLabel />);
    expect(screen.getByText('Dados demonstrativos para o MVP')).toBeInTheDocument();
  });

  it('exports the exact text constant', () => {
    expect(DEMONSTRATIVE_TEXT).toBe('Dados demonstrativos para o MVP');
  });

  it('appends a caller-provided className', () => {
    const { container } = render(<DemonstrativeLabel className="custom-placement" />);
    const el = container.querySelector('small');
    expect(el).toHaveClass('custom-placement');
  });
});
