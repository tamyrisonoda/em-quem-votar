// src/components/CandidateCard/CandidateCard.jsx
//
// Candidate summary card for the candidate-listing UI. The WHOLE card is a
// react-router-dom <Link> to `/candidato/{id}` (Req 3.12, 16.4) so it is a
// single native, keyboard-operable control. It renders the candidate photo
// (with descriptive alt text — Req 16.3), name, electoral number, office,
// party, and a neutral ideology tag (Req 3.10). When the candidate's office is
// "Governador", the state (UF) is also shown (Req 3.11). Every candidate uses
// the exact same structure and styling regardless of ideology or party, and the
// ideology tag uses a single neutral tag style with no party colors (Req 14.2).
//
// Validates: Requirements 3.10, 3.11, 3.12, 16.3, 16.4, 14.2.

import { Link } from 'react-router-dom';
import styles from './CandidateCard.module.css';

/**
 * The office string that requires the state (UF) to be displayed (Req 3.11).
 * @type {string}
 */
export const GOVERNADOR_OFFICE = 'Governador';

/**
 * Candidate summary card.
 *
 * Controlled purely by its `candidate` prop. The entire card is a `Link` to
 * `/candidato/${candidate.id}` so activating anywhere on the card navigates to
 * the profile (Req 3.12) using a native, keyboard-operable control (Req 16.4).
 * The photo renders as an `<img>` with descriptive alt text of the form
 * "Foto de {name}, candidato(a) a {office}" (Req 16.3). Name, electoral number,
 * office, party, and a neutral ideology tag are always shown (Req 3.10); the
 * state is shown only when the office is "Governador" (Req 3.11) — for
 * Presidente (state null) no state is rendered. Layout/styling is identical for
 * every candidate and the ideology tag uses one neutral token-based style, so
 * no candidate or party is visually favored (Req 14.2).
 *
 * @param {Object} props
 * @param {import('../../data/candidates.js').Candidate} props.candidate - candidate record
 * @returns {JSX.Element}
 */
export default function CandidateCard({ candidate }) {
  const { id, name, number, party, position, state, ideology, photo } =
    candidate;

  const isGovernador = position === GOVERNADOR_OFFICE;
  const altText = `Foto de ${name}, candidato a ${position}`;

  return (
    <Link
      to={`/candidato/${id}`}
      className={`card ${styles.card}`}
      aria-label={`Ver perfil de ${name}`}
    >
      <img className={styles.photo} src={photo} alt={altText} />

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>

        <p className={styles.meta}>
          <span className={styles.number}>Nº {number}</span>
          <span className={styles.party}>{party}</span>
        </p>

        <p className={styles.office}>{position}</p>

        {isGovernador && state ? (
          <p className={styles.state}>{state}</p>
        ) : null}

        <span className={styles.ideologyTag}>{ideology || 'Não informado'}</span>
      </div>
    </Link>
  );
}
