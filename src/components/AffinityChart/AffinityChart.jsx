// src/components/AffinityChart/AffinityChart.jsx
//
// Presentational per-theme affinity breakdown. Given the `byTheme` list from an
// AffinityResult (produced by the Affinity_Engine), it renders ONE labeled bar
// per theme entry: the theme's display label, its percentage as text, and a
// horizontal bar whose width is proportional to the percentage.
//
// The component is purely presentational — it renders whatever `byTheme`
// provides and uses an optional `themeLabels` map only to resolve human-readable
// display names, falling back to the raw theme id. Styling is brand-neutral
// (no party colors, Req 14.5).
//
// Validates: Requirements 12.3.

import styles from './AffinityChart.module.css';

/**
 * @typedef {Object} ThemeAffinity
 * @property {string} theme       - Theme id (e.g. "economia")
 * @property {number} percentage  - affinity for the theme, 0..100
 */

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
 * Per-theme affinity chart.
 *
 * Renders one labeled bar per entry in `byTheme` (Req 12.3). Each bar exposes
 * the theme's display label and percentage as text, and uses `role="progressbar"`
 * with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` so assistive technology
 * can announce the value. The visual fill width is set proportionally to the
 * percentage via an inline `width: {percentage}%` style.
 *
 * Display labels are resolved from the optional `themeLabels` map (theme id ->
 * label); when a label is missing, the raw theme id is shown as a fallback,
 * keeping the component fully presentational.
 *
 * @param {Object} props
 * @param {ThemeAffinity[]} [props.byTheme=[]] - per-theme affinity entries to render
 * @param {Object.<string, string>} [props.themeLabels={}] - theme id -> display label
 * @returns {JSX.Element}
 */
export default function AffinityChart({ byTheme = [], themeLabels = {} }) {
  return (
    <ul className={styles.chart} aria-label="Afinidade por tema">
      {byTheme.map(({ theme, percentage }) => {
        const label = themeLabels[theme] ?? theme;
        const value = clampPercentage(percentage);
        return (
          <li key={theme} className={styles.row}>
            <div className={styles.header}>
              <span className={styles.label}>{label}</span>
              <span className={styles.percentage}>{value}%</span>
            </div>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={label}
            >
              <div className={styles.fill} style={{ width: `${value}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
