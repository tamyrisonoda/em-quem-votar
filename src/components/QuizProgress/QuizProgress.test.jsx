import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuizProgress from './QuizProgress.jsx';

// Example tests for the QuizProgress component (Req 10.2).
describe('QuizProgress', () => {
  it('renders the current position relative to the total', () => {
    render(<QuizProgress current={2} total={5} />);
    expect(screen.getByText('Pergunta 2 de 5')).toBeInTheDocument();
  });

  it('exposes progressbar ARIA reflecting current/total', () => {
    render(<QuizProgress current={3} total={5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('renders position text at the first question', () => {
    render(<QuizProgress current={1} total={10} />);
    expect(screen.getByText('Pergunta 1 de 10')).toBeInTheDocument();
  });
});
