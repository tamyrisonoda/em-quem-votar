// src/pages/QuizResultPage.test.jsx
//
// Render tests for QuizResultPage. The forbidden-phrases property test (12.9)
// and the redirect example (12.11) are dispatched separately; this file verifies
// the page's core structure: the incomplete-quiz redirect (Req 12.6) and, when
// complete, the exact title/heading (Req 12.1), one ResultCard per candidate
// (Req 12.2), the not-a-recommendation explanation (Req 12.4), and the absence
// of forbidden recommendation phrases (Req 12.5).

import { useEffect, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizResultPage, { RESULT_TITLE, RESULT_HEADING } from './QuizResultPage.jsx';
import { QuizProvider, useQuiz } from '../context/QuizContext.jsx';
import {
  getQuestions,
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
  OFFICE_GOVERNADOR,
} from '../providers/dataProvider.js';

const FORBIDDEN_PHRASES = ['Seu candidato é', 'Você deveria votar em', 'Vote em'];

/**
 * Seeds the quiz answers once (after mount) so the guard sees a complete quiz.
 * When `answerAll` is false, no answers are set (incomplete).
 *
 * Seeding runs inside a one-time `useEffect` rather than during render.
 * Dispatching state updates during render would trigger an endless
 * re-render → dispatch → re-render loop (each SET_ANSWER returns a new answers
 * object), hanging the test.
 *
 * When seeding is requested we also DELAY rendering the routed children until
 * the answers have been recorded (`ready`). Otherwise the page would mount with
 * empty answers, and its completion guard would `<Navigate>` to "/quiz" on the
 * first commit — the redirect effect runs before this parent's seed effect, so
 * the page would unmount and never come back. Gating the children means the
 * page first mounts already-complete, and completion-dependent assertions use
 * async `findBy*` queries to await that render.
 */
function Seed({ answerAll, children }) {
  const { setAnswer } = useQuiz();
  // When not seeding, render immediately (incomplete case). When seeding, wait.
  const [ready, setReady] = useState(!answerAll);
  useEffect(() => {
    if (answerAll) {
      for (const question of getQuestions()) {
        // Every question answered with a mid-scale value.
        setAnswer(question.id, question.options?.[0]?.value ?? 3);
      }
      setReady(true);
    }
    // Seed exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready ? children : null;
}

function renderResult({ answerAll }) {
  return render(
    <MemoryRouter initialEntries={['/quiz/resultado']}>
      <QuizProvider>
        <Seed answerAll={answerAll}>
          <Routes>
            <Route path="/quiz" element={<div>quiz intro</div>} />
            <Route path="/quiz/resultado" element={<QuizResultPage />} />
          </Routes>
        </Seed>
      </QuizProvider>
    </MemoryRouter>,
  );
}

describe('QuizResultPage', () => {
  it('redirects to /quiz when the quiz is incomplete (Req 12.6)', () => {
    renderResult({ answerAll: false });
    expect(screen.getByText('quiz intro')).toBeInTheDocument();
    expect(screen.queryByText(RESULT_HEADING)).not.toBeInTheDocument();
  });

  it('renders the exact title and heading when complete (Req 12.1)', async () => {
    renderResult({ answerAll: true });
    expect(await screen.findByText(RESULT_TITLE)).toBeInTheDocument();
    expect(screen.getByText(RESULT_HEADING)).toBeInTheDocument();
    expect(RESULT_TITLE).toBe('Seu resultado');
    expect(RESULT_HEADING).toBe('Candidatos com maior afinidade com suas respostas');
  });

  it('ranks exactly the candidates that have curated quiz positions (Req 12.2)', async () => {
    renderResult({ answerAll: true });
    await screen.findByText(RESULT_HEADING);

    // Only candidates with a COMPLETE set of quiz positions are ranked; with
    // real (uncurated) data this is zero, and the page shows a notice instead.
    const QUIZ_KEYS = ['economia', 'estado', 'seguranca', 'meioAmbiente', 'educacao'];
    const scored = [
      ...getCandidatesByOffice(OFFICE_PRESIDENTE),
      ...getCandidatesByOffice(OFFICE_GOVERNADOR),
    ].filter((c) => c.positions && QUIZ_KEYS.every((k) => typeof c.positions[k] === 'number'));

    // Each ResultCard is an <article>.
    expect(screen.queryAllByRole('article')).toHaveLength(scored.length);
    if (scored.length === 0) {
      expect(screen.getByText(/ainda não há candidatos avaliados/i)).toBeInTheDocument();
    }
  });

  it('displays the proximity / not-a-recommendation explanation (Req 12.4)', async () => {
    renderResult({ answerAll: true });
    expect(await screen.findByText(/proximidade/i)).toBeInTheDocument();
    expect(screen.getByText(/não uma indicação/i)).toBeInTheDocument();
  });

  it('never contains forbidden recommendation phrases (Req 12.5)', async () => {
    const { container } = renderResult({ answerAll: true });
    // Wait for the seeded render before scanning the page copy.
    await screen.findByText(RESULT_HEADING);
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(container.textContent).not.toContain(phrase);
    }
  });
});
