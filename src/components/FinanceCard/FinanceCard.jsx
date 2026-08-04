// src/components/FinanceCard/FinanceCard.jsx
//
// Campaign-finance panel for the "Finanças" profile tab. Renders the total
// raised value labeled EXACTLY "TOTAL ARRECADADO" formatted as "R$ {value} mi"
// (Req 7.1), a section labeled EXACTLY "Origem dos recursos" (Req 7.2)
// containing ONE horizontal bar per funding source, each showing the category
// name and its percentage with the bar width sized proportionally to the
// percentage (Req 7.3), and the DemonstrativeLabel marking the content as
// fictional (Req 7.4).
//
// Formatting note: the total is rendered through a single formatting helper
// (`formatTotal`) so the "R$ {value} mi" shape is applied consistently across
// every render (Property 12).
//
// Validates: Requirements 7.1, 7.2, 7.3, 7.4.

import DemonstrativeLabel from '../DemonstrativeLabel/DemonstrativeLabel.jsx';
import styles from './FinanceCard.module.css';

/**
 * Exact label for the total-raised value (Req 7.1).
 * @type {string}
 */
export const TOTAL_LABEL = 'TOTAL ARRECADADO';

/**
 * Exact heading for the funding-sources section (Req 7.2).
 * @type {string}
 */
export const SOURCES_HEADING = 'Origem dos recursos';

/**
 * Format a total-raised value (in R$ millions) as "R$ {value} mi" (Req 7.1).
 *
 * This is the single formatting seam for the total so the "R$ {value} mi"
 * shape stays consistent across renders (Property 12). The numeric value is
 * rendered as given.
 *
 * @param {number} total - total raised, in millions of reais
 * @returns {string} formatted string, e.g. "R$ 12.5 mi"
 */
export function formatTotal(total) {
  return `R$ ${total} mi`;
}

/**
 * Clamp a percentage to the inclusive [0, 100] range so the rendered bar width
 * is always a valid CSS length even if an out-of-range value slips through.
 * @param {number} percentage
 * @returns {number}
 */
function clampPercentage(percentage) {
  if (Number.isNaN(percentage)) return 0;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Render a candidate's campaign finances.
 *
 * Shows the total raised labeled "TOTAL ARRECADADO" as "R$ {value} mi"
 * (Req 7.1) and a "Origem dos recursos" section (Req 7.2) with one horizontal
 * bar per funding source. Each bar shows the source category name and its
 * percentage, and its fill width is set proportionally to the percentage via an
 * inline `width: {percentage}%` style (Req 7.3). Each bar uses
 * `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` so
 * assistive technology can announce the value. A `DemonstrativeLabel` marks the
 * content as fictional (Req 7.4). Styling is brand-neutral (no party colors,
 * Req 14.5) and layered on the shared `.card` class.
 *
 * @param {Object} props
 * @param {{total: number, sources: Array<{category: string, percentage: number}>}} [props.finances]
 *   Campaign finances: `total` in R$ millions and a list of funding `sources`.
 * @param {string} [props.className] - extra class names for placement variations
 * @returns {JSX.Element}
 */
export default function FinanceCard({ finances, className }) {
  const total = finances?.total ?? 0;
  const sources = finances?.sources ?? [];
  const classes = className ? `card ${styles.finance} ${className}` : `card ${styles.finance}`;

  return (
    <section className={classes} aria-label="Finanças do candidato">
      <div className={styles.total}>
        <span className={styles.totalLabel}>{TOTAL_LABEL}</span>
        <span className={styles.totalValue} data-testid="finance-total">
          {formatTotal(total)}
        </span>
      </div>

      <h3 className={styles.sourcesHeading}>{SOURCES_HEADING}</h3>
      <ul className={styles.sources} aria-label={SOURCES_HEADING}>
        {sources.map((source, index) => {
          const value = clampPercentage(source.percentage);
          return (
            <li
              key={`${source.category}-${index}`}
              className={styles.source}
              data-testid="finance-source"
            >
              <div className={styles.sourceHeader}>
                <span className={styles.category}>{source.category}</span>
                <span className={styles.percentage}>{source.percentage}%</span>
              </div>
              <div
                className={styles.track}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={source.category}
              >
                <div
                  className={styles.fill}
                  data-testid="finance-bar-fill"
                  style={{ width: `${value}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Demonstrative-data label (Req 7.4) */}
      <DemonstrativeLabel />
    </section>
  );
}
