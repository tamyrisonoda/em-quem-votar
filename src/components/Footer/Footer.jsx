import React from 'react';
import DemonstrativeLabel from '../DemonstrativeLabel/DemonstrativeLabel.jsx';
import styles from './Footer.module.css';

/**
 * Application footer rendered on every page (Req 17.5).
 *
 * Uses the semantic `<footer>` landmark (Req 16.1) and carries the global
 * demonstrative note by reusing the shared {@link DemonstrativeLabel}
 * component, which renders the exact text "Dados demonstrativos para o MVP"
 * (Req 14.1). Styling uses the brand-neutral navy/blue design tokens only —
 * no party colors are used as visual identity (Req 14.5).
 *
 * @returns {JSX.Element} The site footer with the global demonstrative note.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <DemonstrativeLabel />
      </div>
    </footer>
  );
}
