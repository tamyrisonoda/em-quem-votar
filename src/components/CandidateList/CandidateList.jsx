// src/components/CandidateList/CandidateList.jsx
//
// Candidate-listing section. Renders the title "Candidatos" and a subtitle in
// the exact form "{count} candidatos disponíveis", where {count} is the number
// of candidates CURRENTLY DISPLAYED — i.e. the filtered count (Req 3.3). Search
// and ideology filtering are delegated to the pure `candidateFilter` module
// (Req 3.5, 3.7, 3.8, 3.9). One CandidateCard is rendered per displayed
// candidate using identical treatment for every candidate (Req 14.2). When the
// filtered list is empty, a no-results message is shown instead (Req 3.13).
//
// Because the displayed count (subtitle) and the rendered cards both derive
// from the SAME filtered array, they are always consistent (Design Property 3).
//
// Validates: Requirements 3.3, 3.9, 3.13, 14.2.

import CandidateCard from '../CandidateCard/CandidateCard.jsx';
import { filterCandidates, IDEOLOGY_ALL } from '../../domain/candidateFilter.js';
import styles from './CandidateList.module.css';

/**
 * Message shown when the active search/filter combination matches no
 * candidates (Req 3.13).
 * @type {string}
 */
export const NO_RESULTS_MESSAGE = 'Nenhum candidato encontrado.';

/**
 * Build the subtitle text in the exact required form (Req 3.3).
 * @param {number} count - number of candidates currently displayed
 * @returns {string} e.g. "3 candidatos disponíveis"
 */
function subtitleFor(count) {
  return `${count} candidatos disponíveis`;
}

/**
 * Candidate list section.
 *
 * Presentational + pure: it applies `filterCandidates(candidates, { query,
 * ideology })` to derive the displayed list, then renders the title, a subtitle
 * whose count equals the number of displayed candidates, and one CandidateCard
 * per displayed candidate (or a no-results message when the filtered list is
 * empty). The displayed count and the rendered cards come from the same
 * filtered array, so they never diverge (Design Property 3, Req 3.3).
 *
 * @param {Object} props
 * @param {import('../../data/candidates.js').Candidate[]} props.candidates - candidates to display
 * @param {string} [props.query=""] - search text (matched against name/party, Req 3.5)
 * @param {string} [props.ideology="Todos"] - selected ideology filter, or "Todos" (Req 3.7, 3.8)
 * @returns {JSX.Element}
 */
export default function CandidateList({
  candidates = [],
  query = '',
  ideology = IDEOLOGY_ALL,
}) {
  const displayed = filterCandidates(candidates, { query, ideology });
  const count = displayed.length;

  return (
    <section className={styles.list} aria-label="Candidatos">
      <header className={styles.head}>
        <h2 className={styles.title}>Candidatos</h2>
        <p className={styles.subtitle}>{subtitleFor(count)}</p>
      </header>

      {count === 0 ? (
        <p className={styles.noResults} role="status">
          {NO_RESULTS_MESSAGE}
        </p>
      ) : (
        <div className={styles.grid} data-testid="candidate-grid">
          {displayed.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </section>
  );
}
