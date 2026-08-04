// src/pages/pages.integration.test.jsx
//
// Task 12.11 — EXAMPLE (regular vitest) integration tests for page content and
// navigation. These complement the per-page test files and exercise concrete,
// user-visible flows through the routed pages:
//
//   1. HomePage content + office nav links        (Req 1.1, 1.3)
//   2. GovernadorStatePage "Continuar" gating      (Req 2.4)
//   3. CandidateProfilePage tab switching          (Req 4.4)
//   4. CandidateProfilePage unknown-id not-found   (Req 4.5)
//   5. QuizQuestionsPage completion navigation     (Req 10.6)
//   6. QuizResultPage incomplete redirect          (Req 12.6)
//
// Every page is wrapped in a MemoryRouter (and a QuizProvider where the quiz
// context is required). Assertions use the EXACT copy/labels/params the pages
// implement so they track the real behavior.

import { useEffect, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import HomePage from './HomePage.jsx';
import GovernadorStatePage from './GovernadorStatePage.jsx';
import CandidateProfilePage, { NOT_FOUND_MESSAGE } from './CandidateProfilePage.jsx';
import QuizQuestionsPage, {
  QUIZ_NEXT_LABEL,
  QUIZ_FINISH_LABEL,
} from './QuizQuestionsPage.jsx';
import QuizResultPage, { RESULT_HEADING } from './QuizResultPage.jsx';

import { QuizProvider, useQuiz } from '../context/QuizContext.jsx';
import { TOTAL_LABEL } from '../components/FinanceCard/FinanceCard.jsx';
import {
  getStates,
  getQuestions,
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
} from '../providers/dataProvider.js';

// ---------------------------------------------------------------------------
// 1. HomePage — logo + office navigation (Req 1.1, 1.3)
// ---------------------------------------------------------------------------
describe('HomePage content and navigation (Req 1.1, 1.3)', () => {
  it('renders the "EM QUEM VOTAR" logo and links to /presidente and /governador', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    );

    // Logo text (Req 1.1).
    expect(screen.getByText('EM QUEM VOTAR')).toBeInTheDocument();

    // Office navigation links point at the correct routes (Req 1.3).
    const presidente = screen.getByRole('link', { name: /Presidente/i });
    const governador = screen.getByRole('link', { name: /Governador/i });
    expect(presidente).toHaveAttribute('href', '/presidente');
    expect(governador).toHaveAttribute('href', '/governador');
  });
});

// ---------------------------------------------------------------------------
// 2. GovernadorStatePage — "Continuar" disabled -> enabled (Req 2.4)
// ---------------------------------------------------------------------------
describe('GovernadorStatePage "Continuar" gating (Req 2.4)', () => {
  it('disables "Continuar" initially and enables it after selecting a state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/governador']}>
        <GovernadorStatePage />
      </MemoryRouter>,
    );

    const continuar = screen.getByRole('button', { name: 'Continuar' });
    expect(continuar).toBeDisabled();

    // Select a real state option by its visible name (labeled "Estado").
    const firstState = getStates()[0];
    await user.selectOptions(
      screen.getByLabelText('Estado'),
      firstState.uf,
    );

    expect(continuar).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------
// 3 & 4. CandidateProfilePage — tab switching + not-found (Req 4.4, 4.5)
// ---------------------------------------------------------------------------
function renderProfileAt(id) {
  return render(
    <MemoryRouter initialEntries={[`/candidato/${id}`]}>
      <Routes>
        <Route path="/candidato/:id" element={<CandidateProfilePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CandidateProfilePage tab switching (Req 4.4)', () => {
  it('shows the selected tab panel and hides the previously active panel', async () => {
    const user = userEvent.setup();
    const candidate = getCandidatesByOffice(OFFICE_PRESIDENTE)[0];
    renderProfileAt(candidate.id);

    // Default (Bio) panel shows the "Formação" card; Finanças content is hidden.
    expect(screen.getByText('Formação')).toBeInTheDocument();
    expect(screen.queryByText(TOTAL_LABEL)).not.toBeInTheDocument();

    // Activate the "Finanças" tab.
    await user.click(screen.getByRole('tab', { name: 'Finanças' }));

    // Finanças panel content is now shown and the Bio panel is gone (Req 4.4).
    expect(screen.getByText(TOTAL_LABEL)).toBeInTheDocument();
    expect(screen.queryByText('Formação')).not.toBeInTheDocument();
  });
});

describe('CandidateProfilePage unknown id (Req 4.5)', () => {
  it('shows the not-found message for an id that matches no candidate', () => {
    renderProfileAt('does-not-exist');
    expect(screen.getByText(NOT_FOUND_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Shared quiz seeding helper (mirrors QuizResultPage.test.jsx approach).
// Seeds every question with a valid answer once, after mount, and gates the
// children until the answers are recorded so completion-guarded pages mount
// already-complete.
// ---------------------------------------------------------------------------
function SeedAllAnswers({ children, gate = false }) {
  const { setAnswer } = useQuiz();
  const [ready, setReady] = useState(!gate);
  useEffect(() => {
    for (const question of getQuestions()) {
      setAnswer(question.id, question.options?.[0]?.value ?? 3);
    }
    if (gate) setReady(true);
    // Seed exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready ? children : null;
}

// ---------------------------------------------------------------------------
// 5. QuizQuestionsPage — completion navigation to /quiz/resultado (Req 10.6)
// ---------------------------------------------------------------------------
describe('QuizQuestionsPage completion navigation (Req 10.6)', () => {
  it('navigates to /quiz/resultado once all questions are answered', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/quiz/perguntas']}>
        <QuizProvider>
          <SeedAllAnswers>
            <Routes>
              <Route path="/quiz/perguntas" element={<QuizQuestionsPage />} />
              <Route
                path="/quiz/resultado"
                element={<div>resultado-probe</div>}
              />
            </Routes>
          </SeedAllAnswers>
        </QuizProvider>
      </MemoryRouter>,
    );

    // Advance through every question until the finish control is available.
    // With all answers seeded, "Próxima" is enabled on each step.
    while (!screen.queryByRole('button', { name: QUIZ_FINISH_LABEL })) {
      await user.click(screen.getByRole('button', { name: QUIZ_NEXT_LABEL }));
    }

    const finish = screen.getByRole('button', { name: QUIZ_FINISH_LABEL });
    expect(finish).toBeEnabled();
    await user.click(finish);

    // The finish control navigated to the result route (Req 10.6).
    expect(screen.getByText('resultado-probe')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 6. QuizResultPage — redirect to /quiz when incomplete (Req 12.6)
// ---------------------------------------------------------------------------
describe('QuizResultPage incomplete redirect (Req 12.6)', () => {
  it('redirects to /quiz when the quiz has not been completed', () => {
    render(
      <MemoryRouter initialEntries={['/quiz/resultado']}>
        <QuizProvider>
          <Routes>
            <Route path="/quiz" element={<div>quiz-intro-probe</div>} />
            <Route path="/quiz/resultado" element={<QuizResultPage />} />
          </Routes>
        </QuizProvider>
      </MemoryRouter>,
    );

    // With no answers recorded the guard sends the user back to /quiz (Req 12.6).
    expect(screen.getByText('quiz-intro-probe')).toBeInTheDocument();
    expect(screen.queryByText(RESULT_HEADING)).not.toBeInTheDocument();
  });
});
