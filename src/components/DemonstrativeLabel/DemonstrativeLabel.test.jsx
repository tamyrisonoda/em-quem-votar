import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemonstrativeLabel, {
  DEMONSTRATIVE_TEXT,
  SOURCE_TEXT,
} from './DemonstrativeLabel.jsx';

// Example test for the DemonstrativeLabel component (Req 14.1).
describe('DemonstrativeLabel', () => {
  it('renders the effective source label for the current data source', () => {
    render(<DemonstrativeLabel />);
    expect(screen.getByText(SOURCE_TEXT)).toBeInTheDocument();
  });

  it('renders an explicit text override when provided', () => {
    render(<DemonstrativeLabel text="Texto customizado" />);
    expect(screen.getByText('Texto customizado')).toBeInTheDocument();
  });

  it('exports the demonstrative text constant', () => {
    expect(DEMONSTRATIVE_TEXT).toBe('Dados demonstrativos para o MVP');
  });

  it('appends a caller-provided className', () => {
    const { container } = render(<DemonstrativeLabel className="custom-placement" />);
    const el = container.querySelector('small');
    expect(el).toHaveClass('custom-placement');
  });
});
