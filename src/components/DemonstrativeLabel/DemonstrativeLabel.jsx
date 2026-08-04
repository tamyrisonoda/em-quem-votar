// src/components/DemonstrativeLabel/DemonstrativeLabel.jsx
//
// Small, neutral label marking content that originates from the fictional
// mock Data_Store. It renders the exact demonstrative string wherever mock
// content appears (bio, finances, history tabs, footer).
//
// Validates: Requirements 14.1.

import styles from './DemonstrativeLabel.module.css';

/**
 * The exact demonstrative text mandated by the spec (Req 14.1).
 * @type {string}
 */
export const DEMONSTRATIVE_TEXT = 'Dados demonstrativos para o MVP';

/**
 * Render the demonstrative-data label.
 *
 * Renders the exact text "Dados demonstrativos para o MVP" using a neutral
 * semantic element. An optional `className` is appended to the base class so
 * callers can adjust placement without overriding the label's styling.
 *
 * @param {Object} [props]
 * @param {string} [props.className] - extra class names for placement variations
 * @returns {JSX.Element}
 */
export default function DemonstrativeLabel({ className }) {
  const classes = className ? `${styles.label} ${className}` : styles.label;
  return <small className={classes}>{DEMONSTRATIVE_TEXT}</small>;
}
