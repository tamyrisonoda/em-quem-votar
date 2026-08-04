// Property-based tests for quiz answer recording in client state.
//
// Validates: Requirements 10.3 (Design Property 14).
//
// Property 14 statement: For any sequence of answer selections, each selected
// option is recorded in client state — the answers map holds
// questionId -> the LAST selected value dispatched for that question.
//
// The core check property-tests the PURE reducer (no React needed): folding
// SET_ANSWER actions over `initialState` must yield an answers map equal to the
// "last write wins per questionId" reduction of the action sequence. RESET must
// return the state to `initialState`. A React-level renderHook check confirms
// the same behavior through the public useQuiz()/QuizProvider surface.

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';

import {
  reducer,
  initialState,
  SET_ANSWER,
  RESET,
  QuizProvider,
  useQuiz,
} from './QuizContext.jsx';
import { idArb, scaleValueArb } from '../test/generators.js';

const NUM_RUNS = 100;

// A single answer-selection action: pick a question id and a value (1..5).
const answerActionArb = fc.record({
  questionId: idArb,
  value: scaleValueArb,
});

// A sequence of answer selections (may repeat question ids so we exercise the
// "last selection wins" behavior).
const answerSequenceArb = fc.array(answerActionArb, { maxLength: 30 });

// Reference: fold a sequence of selections into the expected answers map, where
// a later selection for the same question overwrites the earlier one.
function expectedAnswers(actions) {
  const map = {};
  for (const { questionId, value } of actions) {
    map[questionId] = value;
  }
  return map;
}

describe('QuizContext reducer — Property 14: answer selection is recorded in client state', () => {
  // Feature: em-quem-votar, Property 14: Answer selection is recorded in client state
  it('records each selected option, keeping the last value dispatched per questionId', () => {
    fc.assert(
      fc.property(answerSequenceArb, (actions) => {
        const finalState = actions.reduce(
          (state, { questionId, value }) =>
            reducer(state, { type: SET_ANSWER, questionId, value }),
          initialState
        );

        expect(finalState.answers).toEqual(expectedAnswers(actions));
      }),
      { numRuns: NUM_RUNS }
    );
  });

  // Feature: em-quem-votar, Property 14: Answer selection is recorded in client state
  it('every dispatched selection is present, and each maps to its most recent value', () => {
    fc.assert(
      fc.property(answerSequenceArb, (actions) => {
        const finalState = actions.reduce(
          (state, { questionId, value }) =>
            reducer(state, { type: SET_ANSWER, questionId, value }),
          initialState
        );

        // For each question that was selected, the recorded value equals the
        // value of the LAST action that targeted that question.
        for (const { questionId } of actions) {
          const lastForId = [...actions]
            .reverse()
            .find((a) => a.questionId === questionId).value;
          expect(finalState.answers[questionId]).toBe(lastForId);
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  // Feature: em-quem-votar, Property 14: Answer selection is recorded in client state
  it('RESET clears all recorded answers back to the initial (empty) state', () => {
    fc.assert(
      fc.property(answerSequenceArb, (actions) => {
        const populated = actions.reduce(
          (state, { questionId, value }) =>
            reducer(state, { type: SET_ANSWER, questionId, value }),
          initialState
        );

        const afterReset = reducer(populated, { type: RESET });
        expect(afterReset).toEqual(initialState);
        expect(afterReset.answers).toEqual({});
      }),
      { numRuns: NUM_RUNS }
    );
  });

  // Feature: em-quem-votar, Property 14: Answer selection is recorded in client state
  it('does not mutate prior state objects when recording a new answer', () => {
    fc.assert(
      fc.property(answerActionArb, ({ questionId, value }) => {
        const before = { ...initialState.answers };
        const next = reducer(initialState, { type: SET_ANSWER, questionId, value });
        // initialState.answers is untouched (reducer is pure / immutable).
        expect(initialState.answers).toEqual(before);
        expect(next.answers).not.toBe(initialState.answers);
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

describe('QuizContext useQuiz() — Property 14: React-level answer recording', () => {
  // Feature: em-quem-votar, Property 14: Answer selection is recorded in client state
  it('setAnswer records selections into answers via the QuizProvider surface', () => {
    fc.assert(
      fc.property(answerSequenceArb, (actions) => {
        const wrapper = ({ children }) => <QuizProvider>{children}</QuizProvider>;
        const { result } = renderHook(() => useQuiz(), { wrapper });

        act(() => {
          for (const { questionId, value } of actions) {
            result.current.setAnswer(questionId, value);
          }
        });

        expect(result.current.answers).toEqual(expectedAnswers(actions));
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
