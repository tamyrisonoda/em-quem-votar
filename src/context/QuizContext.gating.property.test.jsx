// Property-based tests for quiz advancement gating by completeness.
//
// Validates: Requirements 10.5 (Design Property 15).
//
// Property 15 statement: Advancement is permitted IFF every question has been
// answered. Equivalently, the PURE exported `isAllAnswered(answers, questions)`
// is true exactly when every question id has a defined value in the answers
// map, and false when at least one question is unanswered.
//
// These checks property-test the PURE `isAllAnswered` function (no React
// needed). We generate arbitrary questions and arbitrary answers maps built by
// selecting a subset of question ids and mapping them to 1..5 scale values,
// then assert `isAllAnswered` equals the reference computation
// `questions.every(q => answers[q.id] !== undefined)`.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { isAllAnswered } from './QuizContext.jsx';
import { questionsArb, scaleValueArb } from '../test/generators.js';

const NUM_RUNS = 100;

// Reference computation mirroring the specification (Req 10.5): advancement is
// gated by every question having a defined answer.
function referenceAllAnswered(answers, questions) {
  return questions.every((q) => answers[q.id] !== undefined);
}

// Given a concrete list of questions, produce an answers map arbitrary that
// assigns a 1..5 scale value to an ARBITRARY SUBSET of the question ids. The
// subset is chosen via a per-question boolean "included" flag, so the space
// covers everything from the empty map (nothing answered) to the full map
// (everything answered), and every partial combination in between.
function answersSubsetArb(questions) {
  if (questions.length === 0) return fc.constant({});
  return fc
    .tuple(
      ...questions.map((q) =>
        fc.record({ include: fc.boolean(), value: scaleValueArb })
      )
    )
    .map((choices) => {
      const answers = {};
      questions.forEach((q, i) => {
        if (choices[i].include) {
          answers[q.id] = choices[i].value;
        }
      });
      return answers;
    });
}

describe('QuizContext isAllAnswered — Property 15: advancement is gated by completeness', () => {
  // Feature: em-quem-votar, Property 15: Advancement is gated by completeness
  it('equals the reference "every question answered" computation for arbitrary answers subsets', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 12 }).chain((questions) =>
          fc.tuple(fc.constant(questions), answersSubsetArb(questions))
        ),
        ([questions, answers]) => {
          expect(isAllAnswered(answers, questions)).toBe(
            referenceAllAnswered(answers, questions)
          );
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  // Feature: em-quem-votar, Property 15: Advancement is gated by completeness
  it('is true when EVERY question id has a defined value (advancement permitted)', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 12 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            // A full answers map: every question id gets a 1..5 value.
            fc
              .tuple(...questions.map(() => scaleValueArb))
              .map((values) =>
                Object.fromEntries(questions.map((q, i) => [q.id, values[i]]))
              )
          )
        ),
        ([questions, answers]) => {
          expect(isAllAnswered(answers, questions)).toBe(true);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  // Feature: em-quem-votar, Property 15: Advancement is gated by completeness
  it('is false when at least one question id is missing (advancement blocked)', () => {
    fc.assert(
      fc.property(
        // Need at least 2 questions so that dropping one still leaves a
        // question that must be answered.
        questionsArb({ minLength: 2, maxLength: 12 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            // Index of the question whose answer we deliberately omit.
            fc.nat({ max: questions.length - 1 }),
            fc.tuple(...questions.map(() => scaleValueArb))
          )
        ),
        ([questions, dropIndex, values]) => {
          const answers = {};
          questions.forEach((q, i) => {
            if (i !== dropIndex) {
              answers[q.id] = values[i];
            }
          });
          expect(isAllAnswered(answers, questions)).toBe(false);
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
