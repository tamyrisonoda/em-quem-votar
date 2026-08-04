import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

/**
 * Application header rendered on every page (Req 17.5).
 *
 * Uses semantic `<header>` and `<nav>` landmarks (Req 16.1). The app logo and
 * all navigation controls are native `Link` elements so they are keyboard
 * operable (Req 16.4). Styling uses the brand-neutral navy/blue design tokens
 * only — no party colors are used as visual identity (Req 14.5).
 *
 * @returns {JSX.Element} The site header with primary navigation.
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          EM QUEM VOTAR
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <Link to="/presidente" className={styles.navLink}>
            Presidente
          </Link>
          <Link to="/governador" className={styles.navLink}>
            Governador
          </Link>
          <Link to="/quiz" className={styles.navLink}>
            Quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}
