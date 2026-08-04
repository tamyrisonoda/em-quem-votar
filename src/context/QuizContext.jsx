/**
 * QuizContext — client-only quiz answer state.
 *
 * Holds the map of quiz answers (questionId -> selected value on the 1..5 scale)
 * in a React Context backed by `useReducer`. State lives only in memory: it is
 * shared across the quiz routes (`/quiz/perguntas` and `/quiz/resultado`) and is
 * cleared on page refresh.
 *
 * CRITICAL (Req 10.4): this module performs ZERO I/O. There is no fetch, no
 * localStorage/sessionStorage, and no serialization of answers anywhere. Answers
 * never leave the client.
 *
 * @module context/QuizContext
 */

import { createContext, useContext, useMemo, useReducer } from "react";

/**
 * @typedef {Object.<string, number>} Answers
 *   Map of questionId -> selected AnswerOption.value (1..5).
 */

/**
 * @typedef {Object} QuizState
 * @property {Answers} answers - map of questionId -> selected value
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} [theme]
 * @property {string} [text]
 * @property {Array<Object>} [options]
 */

/**
 * Action type: record a single answer selection.
 * @type {"SET_ANSWER"}
 */
export const SET_ANSWER = "SET_ANSWER";

/**
 * Action type: clear all recorded answers back to the initial state.
 * @type {"RESET"}
 */
export const RESET = "RESET";

/**
 * The initial, empty quiz state.
 * @type {QuizState}
 */
export const initialState = { answers: {} };

/**
 * Pure reducer for quiz answer state.
 *
 * - `SET_ANSWER` merges `{ [questionId]: value }` into the answers map.
 * - `RESET` returns the initial (empty) state.
 * - Any other action returns the current state unchanged.
 *
 * The reducer is pure: it performs no I/O and does not mutate its inputs.
 *
 * @param {QuizState} state
 * @param {{type: string, questionId?: string, value?: number}} action
 * @returns {QuizState}
 */
export function reducer(state, action) {
  switch (action.type) {
    case SET_ANSWER:
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
}

/**
 * Derived helper: whether every provided question has a recorded answer.
 *
 * A question is considered answered when its id maps to a defined value in the
 * answers map. With an empty question list this returns `true` (vacuously), so
 * callers that gate on real questions should pass the actual question list.
 *
 * @param {Answers} answers - the current answers map
 * @param {Question[]} questions - the questions that must be answered
 * @returns {boolean}
 */
export function isAllAnswered(answers, questions) {
  const answerMap = answers || {};
  const questionList = questions || [];
  return questionList.every((question) => answerMap[question.id] !== undefined);
}

/**
 * @typedef {Object} QuizContextValue
 * @property {Answers} answers - current answers map (questionId -> value)
 * @property {(questionId: string, value: number) => void} setAnswer - record an answer
 * @property {() => void} reset - clear all answers
 * @property {(questions: Question[]) => boolean} isAllAnswered - derived "all answered" helper
 */

/** @type {import("react").Context<QuizContextValue|null>} */
const QuizContext = createContext(null);

/**
 * Provider that holds quiz answer state and exposes actions/derived helpers.
 * Wrap the routed app (or the quiz routes) with this so state is shared across
 * the quiz pages.
 *
 * @param {{children: import("react").ReactNode}} props
 * @returns {JSX.Element}
 */
export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      answers: state.answers,
      /**
       * Record the selected value for a question.
       * @param {string} questionId
       * @param {number} value
       */
      setAnswer(questionId, value) {
        dispatch({ type: SET_ANSWER, questionId, value });
      },
      /** Clear all recorded answers. */
      reset() {
        dispatch({ type: RESET });
      },
      /**
       * Whether every provided question has been answered.
       * @param {Question[]} questions
       * @returns {boolean}
       */
      isAllAnswered(questions) {
        return isAllAnswered(state.answers, questions);
      },
    }),
    [state.answers]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

/**
 * Access the quiz state and actions. Must be called from within a
 * {@link QuizProvider}.
 *
 * @returns {QuizContextValue}
 * @throws {Error} when used outside of a QuizProvider
 */
export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === null) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}

export default QuizContext;
