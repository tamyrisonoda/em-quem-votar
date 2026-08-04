import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizQuestion from './QuizQuestion.jsx';

// Example tests for the QuizQuestion component (Req 10.1, 10.3, 16.2, 16.4).

const question = {
  id: 'q-economia-1',
  theme: 'economia',
  text: 'O Estado deve intervir na economia?',
  options: [
    { id: 'opt-1', label: 'Discordo totalmente', value: 1 },
    { id: 'opt-2', label: 'Discordo', value: 2 },
    { id: 'opt-3', label: 'Neutro', value: 3 },
    { id: 'opt-4', label: 'Concordo', value: 4 },
    { id: 'opt-5', label: 'Concordo totalmente', value: 5 },
  ],
};

describe('QuizQuestion', () => {
  it('renders the question text as a group legend (Req 10.1)', () => {
    render(<QuizQuestion question={question} onSelect={() => {}} />);
    expect(
      screen.getByRole('group', { name: question.text })
    ).toBeInTheDocument();
  });

  it('renders each option as a labeled native radio input (Req 16.2, 16.4)', () => {
    render(<QuizQuestion question={question} onSelect={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(question.options.length);

    question.options.forEach((option) => {
      // getByLabelText only resolves when the label/for association is correct.
      const radio = screen.getByLabelText(option.label);
      expect(radio).toBe(screen.getByLabelText(option.label));
      expect(radio).toHaveAttribute('type', 'radio');
      // All radios in the question share the question id as their name.
      expect(radio).toHaveAttribute('name', question.id);
    });
  });

  it('checks the option matching the value prop and no other (Req 10.3)', () => {
    render(<QuizQuestion question={question} value={4} onSelect={() => {}} />);
    expect(screen.getByLabelText('Concordo')).toBeChecked();
    expect(screen.getByLabelText('Neutro')).not.toBeChecked();
  });

  it('leaves all options unchecked when value is undefined', () => {
    render(<QuizQuestion question={question} onSelect={() => {}} />);
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
  });

  it('calls onSelect with the selected option value on change (Req 10.3)', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<QuizQuestion question={question} onSelect={onSelect} />);

    await user.click(screen.getByLabelText('Concordo totalmente'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(5);
  });
});
