// Feature: em-quem-votar, Property 6: One affinity result per candidate
//
// Property 6 (design.md): For any answers map and any candidate set,
// computeResults returns exactly one result per input candidate, and every
// result's candidateId corresponds to an input candidate (a bijection between
// input candidates and output results).
//
// Validates: Requirements 11.1

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { computeResults } from './affinityEngine.js';
import {
  questionsArb,
  answersForQuestionsArb,
  answersArb,
  candidatesArb,
} from '../test/generators.js';

const NUM_RUNS = 200;

/**
 * Assert that results form a bijection with the input candidates:
 *  - exactly one result per candidate (equal cardinality),
 *  - the set of result candidateIds equals the set of input candidate ids
 *    (no missing, no extra),
 *  - no duplicate candidateIds among the results.
 */
function expectBijection(results, candidates) {
  const inputIds = candidates.map((c) => c.id);
  const resultIds = results.map((r) => r.candidateId);

  // Exactly one result per input candidate.
  expect(results).toHaveLength(candidates.length);

  // No duplicate candidateIds among results.
  expect(new Set(resultIds).size).toBe(resultIds.length);

  // Set equality: same ids on both sides (no missing, no extra).
  const inputSet = new Set(inputIds);
  const resultSet = new Set(resultIds);
  expect(resultSet).toEqual(inputSet);

  // Every result candidateId corresponds to an input candidate.
  for (const id of resultIds) {
    expect(inputSet.has(id)).toBe(true);
  }
}

describe('Property 6: One affinity result per candidate', () => {
  it('computeResults: bijection between input candidates and output results (answers aligned to questions)', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            candidatesArb({ minLength: 1, maxLength: 8 }),
          ),
        ),
        ([questions, answers, candidates]) => {
          const results = computeResults(answers, questions, candidates);
          expectBijection(results, candidates);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeResults: bijection holds with arbitrary/partial answers not aligned to questions', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }),
        answersArb,
        candidatesArb({ minLength: 1, maxLength: 8 }),
        (questions, answers, candidates) => {
          const results = computeResults(answers, questions, candidates);
          expectBijection(results, candidates);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeResults: bijection holds regardless of answers, questions, or candidate ordering', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            candidatesArb({ minLength: 1, maxLength: 8 }),
          ),
        ),
        ([questions, answers, candidates]) => {
          const shuffled = [...candidates].reverse();
          const results = computeResults(answers, questions, shuffled);
          // Bijection is invariant to input candidate ordering.
          expectBijection(results, candidates);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});
