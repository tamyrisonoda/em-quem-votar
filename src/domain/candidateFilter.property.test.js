// Property-based tests for the pure candidate filtering logic.
//
// Validates: Requirements 3.5, 3.7, 3.8, 3.9 (Design Property 1).

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { filterCandidates, IDEOLOGY_ALL } from './candidateFilter.js';
import {
  candidatesArb,
  searchQueryArb,
  ideologyArb,
} from '../test/generators.js';

const NUM_RUNS = 100;

// An ideology filter *selection*: either the "Todos" sentinel (no ideology
// constraint) or one of the concrete ideology categories.
const ideologySelectionArb = fc.oneof(
  fc.constant(IDEOLOGY_ALL),
  ideologyArb,
);

// --- Reference implementation ----------------------------------------------
//
// Independently re-derives the expected result using the SAME semantics as the
// module under test, so the property is a genuine cross-check rather than a
// re-statement of the implementation:
//   - `normalize`: nullish -> "", otherwise String(value).toLocaleLowerCase()
//   - the search predicate is active only when the *normalized* query is
//     non-blank (whitespace-only queries impose no constraint), yet the actual
//     substring test uses the un-trimmed normalized query (matching the module)
//   - the ideology predicate is active only when the selection is not "Todos"

function refNormalize(value) {
  if (value === null || value === undefined) return '';
  return String(value).toLocaleLowerCase();
}

function refExpected(candidates, query, ideology) {
  const normalizedQuery = refNormalize(query);
  const searchActive = normalizedQuery.trim().length > 0;

  return candidates.filter((candidate) => {
    if (ideology !== IDEOLOGY_ALL && candidate.ideology !== ideology) {
      return false;
    }
    if (searchActive) {
      const nameMatch = refNormalize(candidate.name).includes(normalizedQuery);
      const partyMatch = refNormalize(candidate.party).includes(normalizedQuery);
      if (!nameMatch && !partyMatch) {
        return false;
      }
    }
    return true;
  });
}

describe('filterCandidates — Property 1: active predicate conjunction', () => {
  // Feature: em-quem-votar, Property 1: Filtering satisfies the active predicate conjunction
  it('returns exactly the candidates satisfying every active predicate (query AND ideology)', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 10 }),
        searchQueryArb,
        ideologySelectionArb,
        (candidates, query, ideology) => {
          const result = filterCandidates(candidates, { query, ideology });
          const expected = refExpected(candidates, query, ideology);

          // Same members, in the same (input-preserving) order: no matching
          // candidate omitted, no non-matching candidate included.
          expect(result).toEqual(expected);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  // Feature: em-quem-votar, Property 1: Filtering satisfies the active predicate conjunction
  it('with empty query + "Todos" returns the input set (same members and order)', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 10 }),
        (candidates) => {
          const result = filterCandidates(candidates, { query: '', ideology: IDEOLOGY_ALL });
          expect(result).toEqual(candidates);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  // Feature: em-quem-votar, Property 1: Filtering satisfies the active predicate conjunction
  it('query-only: every result matches the query on name or party and none is dropped', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 10 }),
        searchQueryArb,
        (candidates, query) => {
          const result = filterCandidates(candidates, { query, ideology: IDEOLOGY_ALL });
          expect(result).toEqual(refExpected(candidates, query, IDEOLOGY_ALL));
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  // Feature: em-quem-votar, Property 1: Filtering satisfies the active predicate conjunction
  it('ideology-only: result is exactly the candidates whose ideology equals the selection', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 10 }),
        ideologyArb,
        (candidates, ideology) => {
          const result = filterCandidates(candidates, { query: '', ideology });
          const expected = candidates.filter((c) => c.ideology === ideology);
          expect(result).toEqual(expected);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  // Feature: em-quem-votar, Property 1: Filtering satisfies the active predicate conjunction
  it('does not mutate the input array (members and order preserved)', () => {
    fc.assert(
      fc.property(
        candidatesArb({ minLength: 0, maxLength: 10 }),
        searchQueryArb,
        ideologySelectionArb,
        (candidates, query, ideology) => {
          const snapshot = candidates.slice();
          filterCandidates(candidates, { query, ideology });
          expect(candidates).toEqual(snapshot);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});
