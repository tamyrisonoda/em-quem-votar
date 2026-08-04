import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import QuizQuestionsPage, {
  QUIZ_NEXT_LABEL,
  QUIZ_PREV_LABEL,
} from './QuizQuestionsPage.jsx';
import { QuizProvider } from '../context/QuizContext.jsx';

// The page uses the router (useNavigate) and the quiz context, so it must be
// wrapped in a Router and a QuizProvider.
function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/quiz/perguntas']}>
      <QuizProvider>
        <QuizQuestionsPage />
      </QuizProvider>
    </MemoryRouter>
  );
}

describe('QuizQuestionsPage', () => {
  it('renders the current question and progress "Pergunta 1 de 10" (Req 10.1, 10.2)', () => {
    renderPage();
    // First question prompt is rendered.
    expect(
      screen.getByText(/reduzir sua participação na economia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 10/i)).toBeInTheDocument();
  });

  it('disables "Voltar" on the first question and gates "Próxima" until answered (Req 10.5)', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('button', { name: QUIZ_PREV_LABEL })).toBeDisabled();

    const next = screen.getByRole('button', { name: QUIZ_NEXT_LABEL });
    expect(next).toBeDisabled();

    // Selecting an option records the answer in context and enables advancing.
    await user.click(screen.getByLabelText('Concordo'));
    expect(next).toBeEnabled();
  });

  it('advances to the next question after answering (Req 10.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByLabelText('Concordo'));
    await user.click(screen.getByRole('button', { name: QUIZ_NEXT_LABEL }));

    expect(screen.getByText(/Pergunta 2 de 10/i)).toBeInTheDocument();
    // "Voltar" is now enabled on the second question.
    expect(screen.getByRole('button', { name: QUIZ_PREV_LABEL })).toBeEnabled();
  });
});
