// src/components/FilterChips/FilterChips.jsx
//
// Ideology filter controls for the candidate-listing UI. Renders the ideology
// options as NATIVE <button> elements (Req 16.4) so they are keyboard operable,
// with the currently selected filter shown in a pressed/active state via
// `aria-pressed` plus an active CSS class.
//
// Validates: Requirements 3.6, 16.4.

import { IDEOLOGY_ALL } from '../../domain/candidateFilter.js';
import styles from './FilterChips.module.css';

/**
 * The ideology filter labels, in the exact order required by the spec (Req 3.6).
 * "Todos" corresponds to no ideology constraint (matches IDEOLOGY_ALL).
 * @type {string[]}
 */
export const FILTER_OPTIONS = [
  IDEOLOGY_ALL, // "Todos"
  'Esquerda',
  'Centro-esquerda',
  'Centro',
  'Centro-direita',
  'Direita',
];

/**
 * Ideology filter chips.
 *
 * Controlled component: `value` is the currently selected filter string and
 * `onChange` is invoked with the selected filter string whenever a chip is
 * clicked. Each option is a native `<button>` carrying `aria-pressed` so
 * assistive technology announces the active selection, and an active CSS class
 * provides the visual pressed state. Styling uses brand-neutral design tokens
 * with hover/focus states (Req 16.6).
 *
 * @param {Object} [props]
 * @param {string} [props.value="Todos"] - the currently selected filter
 * @param {(filter: string) => void} [props.onChange] - emits the selected filter upward
 * @returns {JSX.Element}
 */
export default function FilterChips({ value = IDEOLOGY_ALL, onChange }) {
  return (
    <div className={styles.chips} role="group" aria-label="Filtrar por ideologia">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = option === value;
        const classes = isSelected
          ? `${styles.chip} ${styles.active}`
          : styles.chip;
        return (
          <button
            key={option}
            type="button"
            className={classes}
            aria-pressed={isSelected}
            onClick={() => onChange?.(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
