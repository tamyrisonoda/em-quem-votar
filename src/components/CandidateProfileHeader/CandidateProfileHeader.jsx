// src/components/CandidateProfileHeader/CandidateProfileHeader.jsx
//
// Header block for the candidate profile page. Renders the candidate's LARGE
// CIRCULAR photo with descriptive alt text (Req 16.3), name, electoral number,
// office (position), state WHEN applicable (Governador / non-null state),
// party, and an ideology tag (Req 4.1), plus a BACK control that returns the
// User to the previous view (Req 4.2).
//
// The back control is a native <button> (Req 16.4) that calls the optional
// `onBack` prop when supplied, otherwise falls back to react-router's
// navigate(-1). Because it uses useNavigate, consumers (and tests) must render
// this component inside a Router (e.g. MemoryRouter).
//
// Validates: Requirements 4.1, 4.2, 16.3.

import { useNavigate } from 'react-router-dom';
import { FALLBACK_PHOTO } from '../CandidateCard/CandidateCard.jsx';
import styles from './CandidateProfileHeader.module.css';

/**
 * Label for the back control (Req 4.2).
 * @type {string}
 */
export const BACK_LABEL = 'Voltar';

/**
 * Build the descriptive alt text for the candidate photo (Req 16.3).
 * @param {{name?: string, position?: string}} candidate
 * @returns {string}
 */
export function buildPhotoAlt(candidate) {
  const name = candidate?.name ?? '';
  const position = candidate?.position ?? '';
  return `Foto de ${name}, candidato a ${position}`;
}

/**
 * Render the candidate profile header.
 *
 * Displays a large circular photo (`border-radius: 50%`) as an `<img>` with a
 * descriptive `alt` such as "Foto de {name}, candidato a {position}" (Req 16.3),
 * the candidate's name, electoral number, office, party, and a neutral ideology
 * tag (Req 4.1). The candidate's state is shown ONLY when it is applicable —
 * i.e. non-null (Governador candidates carry a UF; Presidente candidates have
 * `state === null` and no state is rendered) (Req 4.1). A native `<button>`
 * labeled "Voltar" returns the User to the previous view (Req 4.2): it calls
 * `onBack` when provided, otherwise `navigate(-1)`.
 *
 * @param {Object} props
 * @param {import('../../data/candidates.js').Candidate} props.candidate - candidate to display
 * @param {() => void} [props.onBack] - optional back handler; defaults to navigate(-1)
 * @returns {JSX.Element|null}
 */
export default function CandidateProfileHeader({ candidate, onBack }) {
  const navigate = useNavigate();

  if (!candidate) {
    return null;
  }

  const { name, number, party, position, state, ideology, photo } = candidate;
  const hasState = state != null && state !== '';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.back}
        onClick={handleBack}
      >
        ← {BACK_LABEL}
      </button>

      <div className={styles.identity}>
        <img
          className={styles.photo}
          src={photo || FALLBACK_PHOTO}
          alt={buildPhotoAlt(candidate)}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_PHOTO) {
              e.currentTarget.src = FALLBACK_PHOTO;
            }
          }}
        />

        <div className={styles.details}>
          <h1 className={styles.name}>{name}</h1>

          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Número</dt>
              <dd className={styles.metaValue} data-testid="candidate-number">
                {number}
              </dd>
            </div>
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Cargo</dt>
              <dd className={styles.metaValue} data-testid="candidate-office">
                {position}
              </dd>
            </div>
            {hasState ? (
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>Estado</dt>
                <dd className={styles.metaValue} data-testid="candidate-state">
                  {state}
                </dd>
              </div>
            ) : null}
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Partido</dt>
              <dd className={styles.metaValue} data-testid="candidate-party">
                {party}
              </dd>
            </div>
          </dl>

          <span className={styles.ideology} data-testid="candidate-ideology">
            {ideology || 'Não informado'}
          </span>
        </div>
      </div>
    </header>
  );
}
