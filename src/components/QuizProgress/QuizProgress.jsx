// src/components/QuizProgress/QuizProgress.jsx
//
// Quiz progress indicator. Shows the current question position relative to the
// total number of questions (e.g. "Pergunta 2 de 5"). A visual progress bar
// with proper ARIA (role="progressbar") accompanies the textual position, but
// the textual position is the core requirement.
//
// Validates: Requirements 10.2.

import styles from './QuizProgress.module.css';

/**
 * Quiz progress indicator.
 *
 * Displays the current question position relative to the total (Req 10.2) as
 * the text "Pergunta {current} de {total}", where `current` is the 1-based
 * index of the question being answered. A neutral, token-styled progress bar
 * accompanies the text: it exposes `role="progressbar"` with
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax` for assistive technology and
 * its width is proportional to `current / total`.
 *
 * The component clamps `current` into the inclusive range [0, total] so a
 * malformed or out-of-range value never produces a negative or overflowing
 * bar. When `total` is not a positive number the bar renders at 0% width.
 *
 * @param {Object} props
 * @param {number} props.current - 1-based index of the current question
 * @param {number} props.total - total number of questions
 * @returns {JSX.Element}
 */
export default function QuizProgress({ current, total }) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const rawCurrent = Number.isFinite(current) ? current : 0;
  const clampedCurrent = Math.min(Math.max(rawCurrent, 0), safeTotal);
  const percentage = safeTotal > 0 ? (clampedCurrent / safeTotal) * 100 : 0;

  return (
    <div className={styles.progress}>
      <p className={styles.position}>
        Pergunta {current} de {total}
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={`Pergunta ${current} de ${total}`}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
