// src/components/HistoryTimeline/HistoryTimeline.jsx
//
// Candidate history timeline for the "Histórico" profile tab. Renders each
// year/event entry (Req 8.1) in REVERSE chronological order — most recent year
// first (Req 8.2) — followed by a "Votações" section marked as a future-feature
// placeholder (Req 8.3) and the demonstrative-data label (Req 8.4).
//
// Ordering note: the incoming `history` prop is NEVER mutated. A shallow copy
// is sorted by year descending so the rendered DOM order is strictly year-desc,
// which the reverse-chronological property test (Property 13) relies on.
//
// Validates: Requirements 8.1, 8.2, 8.3, 8.4.

import DemonstrativeLabel from '../DemonstrativeLabel/DemonstrativeLabel.jsx';
import styles from './HistoryTimeline.module.css';

/**
 * Heading for the future-feature placeholder section (Req 8.3).
 * @type {string}
 */
export const VOTACOES_HEADING = 'Votações';

/**
 * Placeholder text marking "Votações" as a future feature (Req 8.3).
 * @type {string}
 */
export const VOTACOES_PLACEHOLDER = 'Em breve — funcionalidade futura';

/**
 * Render a candidate's history as a reverse-chronological timeline.
 *
 * Each entry shows its `year` and `event` (Req 8.1). Entries are rendered from
 * most recent year to oldest (Req 8.2) by sorting a copy of the `history` prop
 * by year descending — the original array is left untouched. A "Votações"
 * section is rendered as a clearly marked future-feature placeholder (Req 8.3),
 * and a `DemonstrativeLabel` marks the content as fictional (Req 8.4).
 *
 * @param {Object} props
 * @param {Array<{year: number, event: string}>} [props.history=[]] - history entries
 * @returns {JSX.Element}
 */
export default function HistoryTimeline({ history = [] }) {
  // Sort a COPY by year descending; do not mutate the prop (Req 8.2).
  const ordered = [...history].sort((a, b) => b.year - a.year);

  return (
    <section className={styles.timeline} aria-label="Histórico do candidato">
      {ordered.length > 0 ? (
        <ol className={styles.entries}>
          {ordered.map((entry, index) => (
            <li
              key={`${entry.year}-${index}`}
              className={styles.entry}
              data-testid="history-entry"
              data-year={entry.year}
            >
              <span className={styles.year} data-testid="history-year">
                {entry.year}
              </span>
              <span className={styles.event}>{entry.event}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>Nenhum histórico disponível.</p>
      )}

      {/* Future-feature placeholder (Req 8.3) */}
      <section className={styles.votacoes} aria-label={VOTACOES_HEADING}>
        <h3 className={styles.votacoesHeading}>{VOTACOES_HEADING}</h3>
        <p className={styles.votacoesPlaceholder}>{VOTACOES_PLACEHOLDER}</p>
      </section>

      {/* Demonstrative-data label (Req 8.4) */}
      <DemonstrativeLabel />
    </section>
  );
}
