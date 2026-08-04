import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import HistoryTimeline from './HistoryTimeline.jsx';
import { historyEntryArb } from '../../test/generators.js';

// Property-based test for the HistoryTimeline component (Req 8.1, 8.2).
//
// This complements the example tests in HistoryTimeline.test.jsx by asserting
// the reverse-chronological ordering invariant holds across arbitrary history
// lists, and that no entry is lost or added when the timeline is rendered.
//
// Validates: Requirements 8.1, 8.2.

/** Sort a copy of numbers descending (non-increasing) for multiset comparison. */
function sortedDesc(nums) {
  return [...nums].sort((a, b) => b - a);
}

describe('HistoryTimeline (property-based)', () => {
  // Feature: em-quem-votar, Property 13: History timeline is reverse-chronological
  it('renders entries in year-descending order and preserves every entry', () => {
    fc.assert(
      fc.property(fc.array(historyEntryArb), (history) => {
        // Ensure a fresh DOM even if a prior iteration threw mid-assertion.
        cleanup();

        // Snapshot the input years (in original order) to detect mutation and
        // to compare the rendered multiset against the input multiset.
        const inputYears = history.map((entry) => entry.year);
        const inputSnapshot = JSON.stringify(history);

        render(<HistoryTimeline history={history} />);

        // Read the years from the rendered elements in DOM order.
        const renderedYears = screen
          .queryAllByTestId('history-year')
          .map((el) => Number(el.textContent));

        // Reverse-chronological: each year is >= the next (non-increasing).
        for (let i = 0; i < renderedYears.length - 1; i += 1) {
          expect(renderedYears[i]).toBeGreaterThanOrEqual(renderedYears[i + 1]);
        }

        // Completeness: the multiset of rendered years equals the input
        // multiset (no entry lost, none added). Comparing both sorted desc.
        expect(renderedYears).toHaveLength(inputYears.length);
        expect(sortedDesc(renderedYears)).toEqual(sortedDesc(inputYears));

        // The input array must not be mutated by rendering/sorting.
        expect(JSON.stringify(history)).toBe(inputSnapshot);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
