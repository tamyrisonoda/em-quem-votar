// Feature: em-quem-votar, Property 16: Result view never contains recommendation phrases
//
// Property-based test for Req 12.5: the rendered quiz result view must NEVER
// contain any recommendation phrasing. The forbidden substrings are:
//   "Seu candidato é", "Você deveria votar em", "Vote em".
//
// Property 16 statement: for ANY completed set of quiz answers, the rendered
// result view does not contain any forbidden recommendation phrase.
//
// Strategy: generate an arbitrary COMPLETE answer set — a value per question
// drawn from that question's own options — seed it into the QuizProvider, then
// render QuizResultPage. We assert the result heading is present (confirming the
// completion guard passed and the result view actually rendered) and that none
// of the forbidden phrases appear anywhere in container.textContent.
//
// Validates: Requirements 12.5

import { useEffect, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import fc from 'fast-check';
import QuizResultPage, { RESULT_HEADING } from './QuizResultPage.jsx';
import { QuizProvider, useQuiz } from '../context/QuizContext.jsx';
import { getQuestions } from '../providers/dataProvider.js';

const NUM_RUNS = 100;

const FORBIDDEN_PHRASES = ['Seu candidato é', 'Você deveria votar em', 'Vote em'];

// The fixed question list drives both the generator and the seeding component.
const QUESTIONS = getQuestions();

/**
 * Arbitrary complete answer set: for every question, pick a value from that
 * question's own options. Produces a { [questionId]: value } map covering all
 * questions, so the completion guard always sees a complete quiz.
 */
const completeAnswersArb = fc.record(
  QUESTIONS.reduce((shape, question) => {
    shape[question.id] = fc.constantFrom(...question.options.map((o) => o.value));
    return shape;
  }, {}),
);

/**
 * Seeds the generated answers once (after mount), then reveals the routed
 * children. Rendering is gated on `ready` so the page first mounts with a
 * complete answer set — otherwise its completion guard would <Navigate> away on
 * the first commit and never come back. Seeding runs in a one-time effect
 * (dispatching during render would loop forever).
 */
function Seed({ answers, children }) {
  const { setAnswer } = useQuiz();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    for (const question of QUESTIONS) {
      setAnswer(question.id, answers[question.id]);
    }
    setReady(true);
    // Seed exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready ? children : null;
}

function renderResult(answers) {
  return render(
    <MemoryRouter initialEntries={['/quiz/resultado']}>
      <QuizProvider>
        <Seed answers={answers}>
          <Routes>
            <Route path="/quiz" element={<div>quiz intro</div>} />
            <Route path="/quiz/resultado" element={<QuizResultPage />} />
          </Routes>
        </Seed>
      </QuizProvider>
    </MemoryRouter>,
  );
}

describe('QuizResultPage — Property 16: no recommendation phrases', () => {
  it('never renders a forbidden recommendation phrase for any complete answer set (Req 12.5)', async () => {
    await fc.assert(
      fc.asyncProperty(completeAnswersArb, async (answers) => {
        const { container } = renderResult(answers);
        try {
          // Confirm the result view actually rendered (guard passed).
          await screen.findByText(RESULT_HEADING);
          for (const phrase of FORBIDDEN_PHRASES) {
            expect(container.textContent).not.toContain(phrase);
          }
        } finally {
          cleanup();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  }, 60000);
});
