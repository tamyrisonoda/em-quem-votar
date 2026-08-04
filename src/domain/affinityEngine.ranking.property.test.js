// Feature: em-quem-votar, Property 5: Ranking is deterministic, permutation-invariant, and breaks ties by id
//
// Property 5 (design.md): For any answers map and any candidate set,
// `computeResults` produces results ordered by overall affinity DESCENDING, and
// any two candidates with equal overall affinity appear in ASCENDING order of
// candidate `id`. Running the computation twice on the same input, or on any
// permutation of the input candidates, yields the same ordered sequence of
// candidate ids.
//
// Validates: Requirements 11.4

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { computeResults } from './affinityEngine.js';
import {
  questionsArb,
  answersForQuestionsArb,
  candidatesArb,
  positionsArb,
} from '../test/generators.js';

const NUM_RUNS = 200;

/** Extract the ordered sequence of candidate ids from a results list. */
function idSequence(results) {
  return results.map((r) => r.candidateId);
}

/**
 * Reorder an array according to `keys` (a same-length list of sort keys),
 * producing a permutation of the input that preserves every element.
 */
function permute(items, keys) {
  return items
    .map((item, i) => ({ item, key: keys[i], i }))
    .sort((a, b) => (a.key === b.key ? a.i - b.i : a.key - b.key))
    .map((entry) => entry.item);
}

describe('Property 5: Ranking is deterministic, permutation-invariant, and breaks ties by id', () => {
  it('is deterministic: computeResults called twice on the same input yields the same ordered candidate ids', () => {
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
          const first = computeResults(answers, questions, candidates);
          const second = computeResults(answers, questions, candidates);
          expect(idSequence(second)).toEqual(idSequence(first));
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('is permutation-invariant: any reordering of the input candidates yields the same ordered candidate ids', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          candidatesArb({ minLength: 1, maxLength: 8 }).chain((candidates) =>
            fc.tuple(
              fc.constant(questions),
              answersForQuestionsArb(questions),
              fc.constant(candidates),
              // Sort keys used to derive an arbitrary permutation of the input.
              fc.array(fc.integer({ min: 0, max: 1000 }), {
                minLength: candidates.length,
                maxLength: candidates.length,
              }),
            ),
          ),
        ),
        ([questions, answers, candidates, keys]) => {
          const permuted = permute(candidates, keys);
          const original = computeResults(answers, questions, candidates);
          const shuffled = computeResults(answers, questions, permuted);
          expect(idSequence(shuffled)).toEqual(idSequence(original));
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('orders correctly: overall is non-increasing, and adjacent equal-overall results are in ascending id order', () => {
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
          for (let i = 1; i < results.length; i += 1) {
            const prev = results[i - 1];
            const curr = results[i];
            // Overall affinity is non-increasing.
            expect(prev.overall).toBeGreaterThanOrEqual(curr.overall);
            // Ties break by ascending lexicographic candidate id.
            if (prev.overall === curr.overall) {
              expect(String(prev.candidateId) <= String(curr.candidateId)).toBe(true);
            }
          }
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('breaks ties by id: when all candidates share positions (equal overall), results are strictly ascending by id', () => {
    fc.assert(
      fc.property(
        // Force ties: every candidate uses the SAME positions, so every overall
        // affinity is identical and ordering is decided purely by candidate id.
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            fc.tuple(
              candidatesArb({ minLength: 2, maxLength: 8 }),
              positionsArb(),
            ).map(([candidates, sharedPositions]) =>
              candidates.map((c) => ({ ...c, positions: sharedPositions })),
            ),
          ),
        ),
        ([questions, answers, candidates]) => {
          const results = computeResults(answers, questions, candidates);

          // All overalls must be equal (shared positions => shared affinity).
          const overalls = results.map((r) => r.overall);
          expect(new Set(overalls).size).toBe(1);

          // The id sequence must equal the ids sorted ascending lexicographically.
          const actualIds = idSequence(results).map(String);
          const expectedIds = [...actualIds].sort();
          expect(actualIds).toEqual(expectedIds);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});
