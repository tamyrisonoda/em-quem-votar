// Feature: em-quem-votar, Property 7: Per-theme breakdown covers every quiz theme present
//
// Property 7 (design.md): For any completed answers map and any candidate, the
// affinity result's byTheme list contains one entry for each quiz theme
// represented in the user vector (exactly the set of themes present in
// buildUserVector), and each result entry rendered on the result page shows
// this per-theme breakdown.
//
// Validates: Requirements 11.3, 12.3

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { buildUserVector, computeAffinity } from './affinityEngine.js';
import {
  questionsArb,
  answersForQuestionsArb,
  candidateArb,
} from '../test/generators.js';

const NUM_RUNS = 200;

/**
 * Assert that the per-theme breakdown covers exactly the themes present in the
 * user vector:
 *  - the set of themes in byTheme equals the set of keys in userVector
 *    (one entry per present theme — no missing, no extra),
 *  - no duplicate themes appear in byTheme.
 */
function expectByThemeCoversUserVector(byTheme, userVector) {
  const vectorThemes = Object.keys(userVector);
  const byThemeThemes = byTheme.map((entry) => entry.theme);

  // One entry per present theme (equal cardinality).
  expect(byTheme).toHaveLength(vectorThemes.length);

  // No duplicate themes among the breakdown entries.
  expect(new Set(byThemeThemes).size).toBe(byThemeThemes.length);

  // Set equality: exactly the themes present in the user vector.
  expect(new Set(byThemeThemes)).toEqual(new Set(vectorThemes));
}

describe('Property 7: Per-theme breakdown covers every quiz theme present', () => {
  it('computeAffinity: byTheme has exactly one entry per user-vector theme (answers aligned to questions)', () => {
    fc.assert(
      fc.property(
        // Generate questions, answers aligned to those questions (a completed
        // answers map), and a candidate to compute affinity against.
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
          expectByThemeCoversUserVector(result.byTheme, userVector);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeAffinity: coverage holds even when candidate positions are missing for present themes', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 10 }).chain((questions) =>
          fc.tuple(
            fc.constant(questions),
            answersForQuestionsArb(questions),
            // Candidate with an empty positions map: every present theme still
            // yields a byTheme entry (contributes 0%), so coverage is unchanged.
            candidateArb().map((c) => ({ ...c, positions: {} })),
          ),
        ),
        ([questions, answers, candidate]) => {
          const userVector = buildUserVector(answers, questions);
          const result = computeAffinity(userVector, candidate);
          expectByThemeCoversUserVector(result.byTheme, userVector);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it('computeAffinity: single-theme quizzes produce exactly one byTheme entry for that theme', () => {
    fc.assert(
      fc.property(
        // Constrain every question to a single fixed quiz theme; the user
        // vector then has exactly one key and byTheme must mirror it.
        fc
          .constantFrom('economia', 'estado', 'seguranca', 'meioAmbiente', 'educacao')
          .chain((theme) =>
            questionsArb({ minLength: 1, maxLength: 6, theme }).chain((questions) =>
              fc.tuple(
                fc.constant(theme),
                fc.constant(questions),
                answersForQuestionsArb(questions),
                candidateArb(),
              ),
            ),
          ),
        ([theme, questions, answers, candidate]) => {
          const userVector = buildUserVector(answers, questions);
          const result = computeAffinity(userVector, candidate);

          expectByThemeCoversUserVector(result.byTheme, userVector);
          // The single present theme is exactly the fixed quiz theme.
          expect(result.byTheme).toHaveLength(1);
          expect(result.byTheme[0].theme).toBe(theme);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});
