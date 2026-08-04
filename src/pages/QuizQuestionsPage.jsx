// src/pages/QuizQuestionsPage.jsx
//
// Quiz questions page mapped to the path "/quiz/perguntas" (Req 10). It presents
// the objective questions from the Data_Store one at a time (a stepper), records
// each selection in the shared QuizContext, shows progress, gates advancement on
// the current question being answered, and — once every question is answered —
// lets the User navigate to the result.
//
// Design contracts:
//   - Questions come from the Data_Provider via `getQuestions()` through
//     `useProviderData` so the page never encodes data-shape knowledge (Req 10.1,
//     13.5).
//   - Answers are recorded ONLY in QuizContext (Req 10.3). This page performs no
//     fetch and no localStorage/sessionStorage: answers never leave the client
//     (Req 10.4).
//   - Progress is shown via <QuizProgress> as current/total (Req 10.2).
//   - The "Próxima" advance control is disabled while the current question has no
//     selected option (Req 10.5).
//   - On the last question a "Ver resultado" control is enabled only when ALL
//     questions are answered; activating it navigates to "/quiz/resultado"
//     (Req 10.6).
//
// Validates: Requirements 10.1, 10.2, 10.3, 10.5, 10.6.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizQuestion from '../components/QuizQuestion/QuizQuestion.jsx';
import QuizProgress from '../components/QuizProgress/QuizProgress.jsx';
import { getQuestions } from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import { useQuiz } from '../context/QuizContext.jsx';
import styles from './QuizQuestionsPage.module.css';

/** Label for the control that returns to the previous question. */
export const QUIZ_PREV_LABEL = 'Voltar';

/** Label for the control that advances to the next question (Req 10.5). */
export const QUIZ_NEXT_LABEL = 'Próxima';

/** Label for the control that finishes the quiz and shows the result (Req 10.6). */
export const QUIZ_FINISH_LABEL = 'Ver resultado';

/** The route the finish control navigates to when all questions are answered. */
export const QUIZ_RESULT_PATH = '/quiz/resultado';

/**
 * Quiz questions page (route "/quiz/perguntas").
 *
 * Loads the objective questions from the Data_Provider and renders them one at a
 * time as a stepper (Req 10.1). A local `currentIndex` tracks which question is
 * shown; the current question is rendered via {@link QuizQuestion} controlled by
 * the answer recorded in {@link useQuiz} — `value={answers[question.id]}` and
 * `onSelect` calls `setAnswer(question.id, value)` so selections live only in the
 * shared quiz context (Req 10.3, 10.4). {@link QuizProgress} shows the current
 * position relative to the total (Req 10.2).
 *
 * Navigation is gated by completeness:
 *   - "Voltar" moves to the previous question (disabled on the first).
 *   - "Próxima" moves to the next question and is disabled while the current
 *     question has no selected option (Req 10.5).
 *   - On the last question a "Ver resultado" control replaces "Próxima" and is
 *     enabled only when every question is answered; activating it navigates to
 *     "/quiz/resultado" (Req 10.6).
 *
 * Because it uses the router and the quiz context, tests must wrap it in a Router
 * and a QuizProvider.
 *
 * @returns {JSX.Element} The quiz questions view.
 */
export default function QuizQuestionsPage() {
  const navigate = useNavigate();
  const { answers, setAnswer, isAllAnswered } = useQuiz();
  const { data, pending } = useProviderData(() => getQuestions(), []);
  const questions = data ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);

  if (pending) {
    return (
      <main className={`container ${styles.page}`}>
        <p>Carregando perguntas…</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className={`container ${styles.page}`}>
        <p>Nenhuma pergunta disponível.</p>
      </main>
    );
  }

  // Clamp the index defensively so an out-of-range value never breaks rendering.
  const safeIndex = Math.min(Math.max(currentIndex, 0), questions.length - 1);
  const question = questions[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === questions.length - 1;
  const currentAnswered = answers[question.id] !== undefined;
  const allAnswered = isAllAnswered(questions);

  const goPrev = () => setCurrentIndex((index) => Math.max(index - 1, 0));
  const goNext = () =>
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  const goToResult = () => navigate(QUIZ_RESULT_PATH);

  return (
    <main className={`container ${styles.page}`} aria-labelledby="quiz-questions-title">
      <h1 id="quiz-questions-title" className={styles.title}>
        Quiz de Afinidade
      </h1>

      <QuizProgress current={safeIndex + 1} total={questions.length} />

      <QuizQuestion
        question={question}
        value={answers[question.id]}
        onSelect={(value) => setAnswer(question.id, value)}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={goPrev}
          disabled={isFirst}
        >
          {QUIZ_PREV_LABEL}
        </button>

        {isLast ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={goToResult}
            disabled={!allAnswered}
          >
            {QUIZ_FINISH_LABEL}
          </button>
        ) : (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={goNext}
            disabled={!currentAnswered}
          >
            {QUIZ_NEXT_LABEL}
          </button>
        )}
      </div>
    </main>
  );
}
