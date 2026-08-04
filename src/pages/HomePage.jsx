// src/pages/HomePage.jsx
//
// Application entry page mapped to the path "/" (Req 1). It orients the User to
// the Application's neutral purpose and offers the two ways to explore
// candidates: browsing by office (Presidente / Governador) and taking the
// affinity Quiz.
//
// All navigation uses native react-router-dom <Link> controls so they are
// keyboard operable (Req 16.4). The page uses semantic HTML landmarks and
// headings (Req 16.1) and the brand-neutral navy/blue design tokens only — no
// party colors and no persuasive/vote-recommendation language (Req 14.3, 14.5).
//
// Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7.

import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

/**
 * The exact headline copy required on the Home page (Req 1.2).
 * @type {string}
 */
export const HOME_HEADLINE =
  'Conheça seus candidatos. Compare propostas. Vote consciente.';

/**
 * The exact quiz call-to-action copy required on the Home page (Req 1.6).
 * @type {string}
 */
export const QUIZ_CTA_TEXT =
  'Descubra quais candidatos têm mais afinidade com suas opiniões.';

/**
 * Home page (route "/").
 *
 * Renders the logo text "EM QUEM VOTAR" (Req 1.1), the exact headline plus
 * neutral explanatory subtext describing the Application's purpose (Req 1.2),
 * office navigation options labeled "Presidente" and "Governador" that link to
 * `/presidente` and `/governador` respectively (Req 1.3, 1.4, 1.5), and a quiz
 * call-to-action with the exact CTA text and a "Fazer o Quiz" button linking to
 * `/quiz` (Req 1.6, 1.7). Because it renders `Link` elements, it must be
 * rendered within a Router in tests.
 *
 * @returns {JSX.Element} The Home page view.
 */
export default function HomePage() {
  return (
    <main className={`container ${styles.home}`}>
      <section className={styles.hero} aria-labelledby="home-logo">
        <p id="home-logo" className={styles.logo}>
          EM QUEM VOTAR
        </p>
        <h1 className={styles.headline}>{HOME_HEADLINE}</h1>
        <p className={styles.subtext}>
          Uma ferramenta neutra e independente para conhecer os candidatos das
          eleições de 2026. Aqui você compara biografias, propostas e histórico
          lado a lado, sem recomendações de voto — as conclusões são sempre
          suas.
        </p>
      </section>

      <section className={styles.offices} aria-labelledby="offices-title">
        <h2 id="offices-title" className={styles.sectionTitle}>
          Escolha um cargo para explorar
        </h2>
        <nav className={styles.officeNav} aria-label="Cargos disponíveis">
          <Link to="/presidente" className={`card ${styles.officeCard}`}>
            <span className={styles.officeName}>Presidente</span>
            <span className={styles.officeHint}>
              Candidatos à Presidência da República
            </span>
          </Link>
          <Link to="/governador" className={`card ${styles.officeCard}`}>
            <span className={styles.officeName}>Governador</span>
            <span className={styles.officeHint}>
              Candidatos ao Governo do seu estado
            </span>
          </Link>
        </nav>
      </section>

      <section className={`card ${styles.quizCta}`} aria-labelledby="quiz-title">
        <h2 id="quiz-title" className={styles.sectionTitle}>
          Quiz de Afinidade
        </h2>
        <p className={styles.quizText}>{QUIZ_CTA_TEXT}</p>
        <Link to="/quiz" className={styles.quizButton}>
          Fazer o Quiz
        </Link>
      </section>
    </main>
  );
}
