// src/providers/dataProvider.property.test.js
//
// Property-based coverage for the Data_Provider's office/state scoping
// (Design Property 2). This complements the sanity unit tests in
// dataProvider.test.js — do not remove those.
//
// Approach (design.md § Correctness Properties, Property 2): the provider reads
// from the fixed Data_Store, so instead of generating arbitrary candidate sets
// we drive arbitrary (office, uf) INPUTS through generators and assert the
// scoping invariant against the real store, which acts as the source of truth.
// For each generated (office, uf) we compute the expected candidate id set by
// applying the SAME scoping predicate to the store, then assert the provider
// returns exactly that set (soundness AND completeness).

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getCandidatesByOffice,
  OFFICE_GOVERNADOR,
} from './dataProvider.js';
import { candidates } from '../data/dataSource.js';
import { officeArb, ufArb } from '../test/generators.js';

// Feature: em-quem-votar, Property 2: Provider scopes candidates by office and state
describe('Property 2: Provider scopes candidates by office and state', () => {
  // A uf drawn from the UFS list, plus `undefined` (no state scoping).
  const ufOrUndefinedArb = fc.oneof(fc.constant(undefined), ufArb);

  it('returns exactly the store candidates matching the office/state predicate', () => {
    fc.assert(
      fc.property(officeArb, ufOrUndefinedArb, (office, uf) => {
        // State scoping applies only for Governador with a concrete uf.
        const scopeByState = office === OFFICE_GOVERNADOR && uf !== undefined;

        // Source of truth: apply the SAME predicate to the fixed store.
        const expectedIds = candidates
          .filter((c) => {
            if (c.position !== office) return false;
            if (scopeByState && c.state !== uf) return false;
            return true;
          })
          .map((c) => c.id);

        const actualIds = getCandidatesByOffice(office, uf).map((c) => c.id);

        // Compare as sets: no matching candidate omitted (completeness) and no
        // non-matching candidate included (soundness).
        expect(new Set(actualIds)).toEqual(new Set(expectedIds));
        // Guard against accidental duplication in the provider result.
        expect(actualIds).toHaveLength(expectedIds.length);
      }),
      { numRuns: 200 },
    );
  });
});
