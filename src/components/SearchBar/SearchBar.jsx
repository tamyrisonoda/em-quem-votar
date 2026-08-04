// src/components/SearchBar/SearchBar.jsx
//
// Labeled text input used to search the candidate list by name or party.
// It is a controlled component: it holds no internal state and emits query
// changes upward via `onChange` so the owning page can drive filtering.
//
// Validates: Requirements 3.4 (placeholder), 16.2 (associated label).

import styles from './SearchBar.module.css';

/**
 * The exact placeholder text mandated by the spec (Req 3.4).
 * @type {string}
 */
export const SEARCH_PLACEHOLDER = 'Buscar candidato ou partido...';

/**
 * Controlled search input for the candidate list.
 *
 * Renders a native text `<input>` with the exact placeholder
 * "Buscar candidato ou partido..." (Req 3.4) and an associated visible
 * `<label>` linked via `htmlFor`/`id` so the control is labeled for assistive
 * technology (Req 16.2). The input is native and keyboard operable; styling is
 * limited to the neutral design tokens.
 *
 * The component is fully controlled: it derives its displayed text from the
 * `value` prop and reports each edit upward by calling `onChange` with the new
 * query string, keeping filtering logic in the owning page.
 *
 * @param {Object} props
 * @param {string} props.value - current search query (controlled value)
 * @param {(query: string) => void} props.onChange - called with the new query on each edit
 * @param {string} [props.id="candidate-search"] - id linking label and input
 * @returns {JSX.Element}
 */
export default function SearchBar({ value, onChange, id = 'candidate-search' }) {
  return (
    <div className={styles.searchBar}>
      <label className={styles.label} htmlFor={id}>
        Buscar candidato ou partido
      </label>
      <input
        id={id}
        type="text"
        className={styles.input}
        placeholder={SEARCH_PLACEHOLDER}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
