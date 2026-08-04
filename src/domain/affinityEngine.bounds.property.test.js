// Feature: em-quem-votar, Property 4: Affinity outputs are bounded 0–100
//
// Property 4 (design.md): For any answers map and any candidate, every affinity
// value produced by the Affinity_Engine — the overall percentage AND each
// per-theme percentage — is an integer in the inclusive range [0, 100].
//
// Validates: Requirements 11.2, 11.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { computeAffinity, computeResults, buildUserVector } from './affinityEngine.js';
import {
  questionsArb,
  answersForQuestionsArb,
  answersArb,
  candidateArb,
  candidatesArb,
} from '../test/generators.js';

const NUM_RUNS = 200;

/** Assert a single value is an integer within the inclusive [0, 100] range. */
function expectBoundedInteger(value) {
  expect(typeof value).toBe('number');
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(100);
}

/** Assert every affinity value in a result is a bounded integer. */
function expectResultBounded(result) {
  expectBoundedInteger(result.overall);
  for (const themeAffinity of result.byTheme) {
    expectBoundedInteger(themeAffinity.percentage);
  }
}

describe('Property 4: Affinity outputs are bounded 0–100', () => {
  it('computeResults: overall and every per-theme percentage are integers in [0,100] (answers aligned to questions)', () => {
    fc.assert(
      fc.property(
        // Generate questions first, then answers aligned to those questions,
        // then a set of candidates to rank.
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            candidatesArb({ minLength: 1, maxLength: 8 }),
          ),
        ),
        ([questions, answers, candidates]) => {
          const results = computeResults(answers, questions, candidates);
          for (const result of results) {
            expectResultBounded(result);
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeResults: stays bounded with arbitrary/partial answers not aligned to questions', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }),
        // Arbitrary answers map: may include unrelated ids and omit answers for
        // some questions (partial data), exercising the missing-position path.
        answersArb,
        candidatesArb({ minLength: 1, maxLength: 8 }),
        (questions, answers, candidates) => {
          const results = computeResults(answers, questions, candidates);
          for (const result of results) {
            expectResultBounded(result);
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeAffinity: single-candidate outputs are bounded integers for aligned answers', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            candidateArb(),
          ),
        ),
        ([questions, answers, candidate]) => {
          const userVector = buildUserVector(answers, questions);
          const result = computeAffinity(userVector, candidate);
          expectResultBounded(result);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeAffinity: bounded even when candidate positions are missing for present themes', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            // Candidate with an empty positions map: every present theme hits
            // the missing-position branch (contributes 0%).
            candidateArb().map((c) => ({ ...c, positions: {} })),
          ),
        ),
        ([questions, answers, candidate]) => {
          const userVector = buildUserVector(answers, questions);
          const result = computeAffinity(userVector, candidate);
          expectResultBounded(result);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});
