// Feature: em-quem-votar, Property 10: Proposals are grouped correctly by theme
//
// Property 10 (design.md): For any set of proposals, grouping by theme yields
// groups where (a) every proposal appears in exactly one group matching its
// theme, (b) no group is empty (themes with zero proposals are omitted — Req
// 6.4), (c) groups only contain proposals of their theme, and (d) the union of
// grouped proposals equals the input proposals (no loss, no duplication). Group
// order follows the canonical proposalThemes order.
//
// Validates: Requirements 6.1, 6.2, 6.3, 6.4

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { groupProposalsByTheme } from './proposalGrouping.js';
import { proposalThemes } from '../data/topics.js';
import { proposalArb } from '../test/generators.js';

const NUM_RUNS = 300;

/** Arbitrary list of proposals (may be empty), each tagged with a canonical theme. */
const proposalsArb = fc.array(proposalArb, { maxLength: 20 });

/** Canonical theme ids in their declared order. */
const CANONICAL_THEME_IDS = proposalThemes.map((t) => t.id);

describe('Property 10: Proposals are grouped correctly by theme', () => {
  it('(b) no group is empty — themes with zero proposals are omitted (Req 6.4)', () => {
    fc.assert(
      fc.property(proposalsArb, (proposals) => {
        const groups = groupProposalsByTheme(proposals);
        for (const group of groups) {
          expect(group.proposals.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('(c) each group contains only proposals whose theme matches the group', () => {
    fc.assert(
      fc.property(proposalsArb, (proposals) => {
        const groups = groupProposalsByTheme(proposals);
        for (const group of groups) {
          for (const proposal of group.proposals) {
            expect(proposal.theme).toBe(group.theme);
          }
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('(a,d) union of grouped proposals equals the input — no loss, no duplication', () => {
    fc.assert(
      fc.property(proposalsArb, (proposals) => {
        const groups = groupProposalsByTheme(proposals);
        const flattened = groups.flatMap((g) => g.proposals);

        // No loss / no duplication: same count as the input.
        expect(flattened.length).toBe(proposals.length);

        // Every input proposal appears exactly once (by object identity), i.e.
        // it lives in exactly one group matching its theme.
        for (const proposal of proposals) {
          const occurrences = flattened.filter((p) => p === proposal).length;
          expect(occurrences).toBe(1);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('group order follows the canonical proposalThemes order', () => {
    fc.assert(
      fc.property(proposalsArb, (proposals) => {
        const groups = groupProposalsByTheme(proposals);
        const groupThemeIds = groups.map((g) => g.theme);

        // The emitted theme ids must be a subsequence of the canonical order.
        const canonicalPositions = groupThemeIds.map((id) =>
          CANONICAL_THEME_IDS.indexOf(id),
        );
        for (const pos of canonicalPositions) {
          expect(pos).toBeGreaterThanOrEqual(0);
        }
        const strictlyIncreasing = canonicalPositions.every(
          (pos, i) => i === 0 || pos > canonicalPositions[i - 1],
        );
        expect(strictlyIncreasing).toBe(true);

        // Each emitted group carries the correct label for its theme.
        for (const group of groups) {
          const theme = proposalThemes.find((t) => t.id === group.theme);
          expect(group.label).toBe(theme.label);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
