import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

/**
 * Not-found (404) page shown when the User navigates to a path that no route
 * matches (Req 17.4).
 *
 * Renders a semantic `<main>` with a heading and a brief message (Req 16.1),
 * plus a control that returns the User to the home path "/". The control is a
 * native react-router `Link` so it is keyboard operable (Req 16.4). Because it
 * uses `Link`, tests must wrap this page in a Router. Styling uses the
 * brand-neutral design tokens only (Req 14.5, 15.3).
 *
 * @returns {JSX.Element} The not-found view with a link back to "/".
 */
export default function NotFoundPage() {
  return (
    <main className={`container ${styles.notFound}`}>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.message}>
        A página que você procura não existe ou foi movida.
      </p>
      <Link to="/" className={styles.homeLink}>
        Voltar ao início
      </Link>
    </main>
  );
}
