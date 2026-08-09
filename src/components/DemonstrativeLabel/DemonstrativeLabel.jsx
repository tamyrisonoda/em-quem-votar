// src/components/DemonstrativeLabel/DemonstrativeLabel.jsx
//
// Small, neutral label marking content that originates from the fictional
// mock Data_Store. It renders the exact demonstrative string wherever mock
// content appears (bio, finances, history tabs, footer).
//
// Validates: Requirements 14.1.

import styles from './DemonstrativeLabel.module.css';
import { USE_TSE_DATA } from '../../data/dataSource.js';

/**
 * The exact demonstrative text mandated by the spec (Req 14.1), used while the
 * app runs on the fictional Data_Store.
 * @type {string}
 */
export const DEMONSTRATIVE_TEXT = 'Dados demonstrativos para o MVP';

/**
 * Attribution shown when the app runs on real, official TSE data.
 * @type {string}
 */
export const TSE_SOURCE_TEXT = 'Fonte: dados públicos do TSE';

/**
 * The source label currently in effect, chosen by the data-source switch.
 * Fictional data → demonstrative notice; real data → TSE attribution.
 * @type {string}
 */
export const SOURCE_TEXT = USE_TSE_DATA ? TSE_SOURCE_TEXT : DEMONSTRATIVE_TEXT;

/**
 * Render the data-source label.
 *
 * Marks content origin using a neutral semantic element. While the app uses the
 * fictional Data_Store it shows "Dados demonstrativos para o MVP" (Req 14.1);
 * once the real-data switch (`USE_TSE_DATA`) is on it shows the TSE attribution.
 * An explicit `text` prop overrides the automatic choice (e.g. an editorial
 * notice on curated tabs), and `className` is appended for placement.
 *
 * @param {Object} [props]
 * @param {string} [props.text] - override the automatic source text
 * @param {string} [props.className] - extra class names for placement variations
 * @returns {JSX.Element}
 */
export default function DemonstrativeLabel({ text, className }) {
  const classes = className ? `${styles.label} ${className}` : styles.label;
  return <small className={classes}>{text ?? SOURCE_TEXT}</small>;
}
