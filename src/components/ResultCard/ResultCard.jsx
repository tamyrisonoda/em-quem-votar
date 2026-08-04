// src/components/ResultCard/ResultCard.jsx
//
// A single candidate's affinity result row for the quiz result page. It shows
// the candidate's photo (with descriptive alt text — Req 16.3) and name, the
// OVERALL Affinity_Percentage for that candidate (Req 12.2), and an embedded
// per-theme affinity breakdown rendered by the AffinityChart component
// (Req 12.3). Styling is brand-neutral (no party colors, Req 14.5) and layered
// on the shared global `.card` class so every candidate row looks identical
// (Req 14.2).
//
// This component renders exactly one candidate's result; ordering of results in
// descending affinity is the responsibility of the result page (Req 12.2), not
// this row.
//
// Validates: Requirements 12.2, 12.3.

import AffinityChart from '../AffinityChart/AffinityChart.jsx';
import styles from './ResultCard.module.css';

/**
 * @typedef {Object} ThemeAffinity
 * @property {string} theme       - Theme id (e.g. "economia")
 * @property {number} percentage  - affinity for the theme, 0..100
 *
 * @typedef {Object} AffinityResult
 * @property {string} candidateId
 * @property {number} overall              - overall affinity, 0..100
 * @property {ThemeAffinity[]} byTheme     - per-theme breakdown
 */

/**
 * Candidate affinity result row.
 *
 * Controlled purely by its props. Renders the candidate's photo as an `<img>`
 * with descriptive alt text of the form "Foto de {name}" (Req 16.3), the
 * candidate's name, and the overall affinity percentage as "{overall}%"
 * (Req 12.2). Below the summary it embeds an AffinityChart fed with
 * `result.byTheme` to display the per-theme affinity breakdown (Req 12.3),
 * passing `themeLabels` through so the chart can show human-readable theme
 * names.
 *
 * @param {Object} props
 * @param {import('../../data/candidates.js').Candidate} props.candidate - candidate record
 * @param {AffinityResult} props.result - affinity result for this candidate
 * @param {Object.<string, string>} [props.themeLabels={}] - theme id -> display label
 * @returns {JSX.Element}
 */
export default function ResultCard({ candidate, result, themeLabels = {} }) {
  const { name, photo } = candidate;
  const { overall, byTheme = [] } = result;

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.summary}>
        <img className={styles.photo} src={photo} alt={`Foto de ${name}`} />

        <div className={styles.identity}>
          <h3 className={styles.name}>{name}</h3>
        </div>

        <span className={styles.overall} aria-label={`Afinidade geral ${overall}%`}>
          {overall}%
        </span>
      </div>

      <AffinityChart byTheme={byTheme} themeLabels={themeLabels} />
    </article>
  );
}
