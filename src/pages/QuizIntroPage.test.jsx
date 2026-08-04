import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizIntroPage, {
  QUIZ_INTRO_TITLE,
  QUIZ_START_LABEL,
} from './QuizIntroPage.jsx';

// QuizIntroPage uses react-router `Link`, so it must be rendered inside a Router.
function renderIntro() {
  return render(
    <MemoryRouter>
      <QuizIntroPage />
    </MemoryRouter>
  );
}

describe('QuizIntroPage', () => {
  it('displays the exact title "Quiz de Afinidade" (Req 9.1)', () => {
    renderIntro();
    expect(
      screen.getByRole('heading', { name: QUIZ_INTRO_TITLE })
    ).toBeInTheDocument();
  });

  it('states the quiz measures proximity and does not recommend a vote, neutrally (Req 9.1)', () => {
    renderIntro();
    expect(screen.getByText(/proximidade/i)).toBeInTheDocument();
    expect(screen.getByText(/não recomenda em quem votar/i)).toBeInTheDocument();
    // Neutral copy: no vote-recommendation phrases.
    expect(screen.queryByText(/vote em/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/você deveria votar/i)).not.toBeInTheDocument();
  });

  it('displays the list of covered themes (Req 9.2)', () => {
    renderIntro();
    const expected = [
      'Economia',
      'Papel do Estado',
      'Segurança Pública',
      'Meio Ambiente',
      'Educação',
    ];
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    for (const label of expected) {
      expect(items).toContain(label);
    }
  });

  it('displays a "Começar o Quiz" button navigating to /quiz/perguntas (Req 9.3, 9.4)', () => {
    renderIntro();
    expect(
      screen.getByRole('link', { name: QUIZ_START_LABEL })
    ).toHaveAttribute('href', '/quiz/perguntas');
  });
});
