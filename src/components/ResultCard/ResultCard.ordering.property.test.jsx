// Feature: em-quem-votar, Property 17: Results are rendered in descending affinity order
//
// Property-based test for the ORDERING of candidate result rows as they will be
// rendered by the quiz result page (Req 12.2).
//
// The result page maps `computeResults(answers, questions, candidates)` — which
// sorts by overall affinity descending, breaking ties by candidate id ascending
// — directly into a sequence of <ResultCard> rows. This test reproduces that
// mapping: it renders the ResultCards in the exact order the page will, then
// reads the OVERALL affinity percentages back out of the DOM in document order
// and asserts the sequence is non-increasing (descending). This genuinely
// validates the RENDERED order rather than only the engine's return value.
//
// Each ResultCard exposes its overall affinity via an element with
// aria-label="Afinidade geral {overall}%", which we query in DOM order.
//
// Validates: Requirements 12.2

import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import ResultCard from './ResultCard.jsx';
import { computeResults } from '../../domain/affinityEngine.js';
import {
  questionsArb,
  answersForQuestionsArb,
  candidatesArb,
} from '../../test/generators.js';

const NUM_RUNS = 100;

/**
 * Render the full ranked list of ResultCards exactly the way the result page
 * will: map each computeResults entry to a ResultCard fed with the matching
 * candidate. Returns the rendered container.
 */
function renderResults(results, candidatesById) {
  const { container } = render(
    <div>
      {results.map((result) => (
        <ResultCard
          key={result.candidateId}
          candidate={candidatesById[result.candidateId]}
          result={result}
        />
      ))}
    </div>
  );
  return container;
}

/**
 * Read the overall affinity percentages out of the DOM in document order by
 * querying the overall-affinity spans (aria-label="Afinidade geral {n}%").
 * @returns {number[]}
 */
function readRenderedOverallsInOrder(container) {
  const nodes = container.querySelectorAll('[aria-label^="Afinidade geral"]');
  return Array.from(nodes).map((node) => {
    const label = node.getAttribute('aria-label');
    const match = label.match(/(\d+)%/);
    return match ? Number(match[1]) : NaN;
  });
}

describe('ResultCard — Property 17: rendered in descending affinity order', () => {
  it('renders result rows with non-increasing overall affinity (descending)', () => {
    fc.assert(
      fc.property(
        // A question set, answers aligned to those questions, and a unique-id
        // candidate set — the exact inputs the result page feeds computeResults.
        questionsArb({ minLength: 1, maxLength: 8 }).chain((questions) =>
          fc.record({
            questions: fc.constant(questions),
            answers: answersForQuestionsArb(questions),
            candidates: candidatesArb({ minLength: 1, maxLength: 8 }),
          })
        ),
        ({ questions, answers, candidates }) => {
          try {
            const results = computeResults(answers, questions, candidates);
            const candidatesById = Object.fromEntries(
              candidates.map((c) => [c.id, c])
            );

            const container = renderResults(results, candidatesById);
            const overalls = readRenderedOverallsInOrder(container);

            // One overall value is rendered per candidate.
            expect(overalls).toHaveLength(candidates.length);

            // The rendered overalls are non-increasing (descending order).
            for (let i = 1; i < overalls.length; i += 1) {
              expect(overalls[i]).toBeLessThanOrEqual(overalls[i - 1]);
            }
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
