import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import FinanceCard, { formatTotal } from './FinanceCard.jsx';
import { financesArb, financeSourceArb } from '../../test/generators.js';

// Property-based tests for the FinanceCard component (Req 7.1, 7.2, 7.3).
//
// These complement the example tests in FinanceCard.test.jsx by asserting the
// finance bars and total-format invariants hold across arbitrary finances.
//
// Validates: Requirements 7.1, 7.2, 7.3.

/** Clamp a percentage to [0, 100] — mirrors the component's own clamping. */
function clamp(percentage) {
  if (Number.isNaN(percentage)) return 0;
  return Math.min(100, Math.max(0, percentage));
}

describe('FinanceCard (property-based)', () => {
  // Feature: em-quem-votar, Property 11: Finance bars are complete and proportional
  it('renders one proportional bar per funding source, with names and percentages', () => {
    fc.assert(
      fc.property(
        // A finances object whose sources list drives the bars. Draw a fresh
        // sources array so completeness is exercised across list lengths.
        fc.record({
          total: fc.double({ min: 0, max: 1000, noNaN: true }),
          sources: fc.array(financeSourceArb, { minLength: 1, maxLength: 6 }),
        }),
        (finances) => {
          // Ensure a fresh DOM even if a prior iteration threw mid-assertion.
          cleanup();
          render(<FinanceCard finances={finances} />);

          const { sources } = finances;

          // Completeness: exactly one bar (and one fill) per source.
          const barItems = screen.getAllByTestId('finance-source');
          const fills = screen.getAllByTestId('finance-bar-fill');
          expect(barItems).toHaveLength(sources.length);
          expect(fills).toHaveLength(sources.length);

          // Proportionality: each fill width equals the clamped percentage.
          sources.forEach((source, index) => {
            const expectedWidth = `${clamp(source.percentage)}%`;
            expect(fills[index]).toHaveStyle({ width: expectedWidth });
          });

          // Each category name and its percentage text are shown. Compare raw
          // textContent (no whitespace normalization) within the corresponding
          // bar item, so whitespace-only category names still match.
          sources.forEach((source, index) => {
            const text = barItems[index].textContent;
            expect(text).toContain(source.category);
            expect(text).toContain(`${source.percentage}%`);
          });

          cleanup();
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: em-quem-votar, Property 12: Total raised is formatted consistently
  it('renders the total using the single "R$ {value} mi" format', () => {
    fc.assert(
      fc.property(financesArb, (finances) => {
        // Ensure a fresh DOM even if a prior iteration threw mid-assertion.
        cleanup();
        render(<FinanceCard finances={finances} />);

        const expected = formatTotal(finances.total);

        // The rendered total matches the single formatTotal shape...
        const totalEl = screen.getByTestId('finance-total');
        expect(totalEl).toHaveTextContent(expected);

        // ...and that shape is exactly "R$ {value} mi".
        expect(expected).toMatch(/^R\$ .+ mi$/);
        expect(expected).toBe(`R$ ${finances.total} mi`);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
