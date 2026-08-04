// src/pages/QuizIntroPage.jsx
//
// Quiz introduction page mapped to the path "/quiz" (Req 9). It orients the
// User to the affinity Quiz before they start: what it measures, the themes it
// covers, and how to begin.
//
// The page keeps the copy strictly neutral — it states that the Quiz measures
// PROXIMITY of opinions and does NOT recommend a vote (Req 9.1, 14.3). The
// covered themes are pulled from the Data_Provider's quiz theme set so the page
// never encodes data-shape knowledge (Req 13.5). Navigation to the questions
// uses a native react-router-dom <Link> styled as a button so it is keyboard
// operable (Req 16.4) and semantic landmarks/headings are used (Req 16.1).
//
// Validates: Requirements 9.1, 9.2, 9.3, 9.4.

import { Link } from 'react-router-dom';
import { getThemes } from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import styles from './QuizIntroPage.module.css';

/**
 * The exact page title required by Req 9.1.
 * @type {string}
 */
export const QUIZ_INTRO_TITLE = 'Quiz de Afinidade';

/**
 * The exact label required on the start button (Req 9.3).
 * @type {string}
 */
export const QUIZ_START_LABEL = 'Começar o Quiz';

/**
 * Quiz introduction page (route "/quiz").
 *
 * Renders the title "Quiz de Afinidade" (Req 9.1) and neutral introductory text
 * explaining that the Quiz measures proximity of opinions and does not recommend
 * a vote (Req 9.1), the list of covered Themes — Economia, Papel do Estado,
 * Segurança Pública, Meio Ambiente, Educação (Req 9.2) — and a "Começar o Quiz"
 * button that navigates to `/quiz/perguntas` (Req 9.3, 9.4). The theme labels are
 * sourced from `getThemes('quiz')` via `useProviderData` so they stay in sync
 * with the Data_Store. Because it renders a `Link`, it must be rendered within a
 * Router in tests.
 *
 * @returns {JSX.Element} The Quiz introduction view.
 */
export default function QuizIntroPage() {
  const { data: themes } = useProviderData(() => getThemes('quiz'), []);
  const quizThemes = themes ?? [];

  return (
    <main className={`container ${styles.intro}`}>
      <section className={styles.header} aria-labelledby="quiz-intro-title">
        <h1 id="quiz-intro-title" className={styles.title}>
          {QUIZ_INTRO_TITLE}
        </h1>
        <p className={styles.lead}>
          Este quiz mede a proximidade entre as suas opiniões e as posições dos
          candidatos. Ele não recomenda em quem votar: o resultado é apenas uma
          comparação para ajudar você a formar a sua própria conclusão.
        </p>
      </section>

      <section
        className={`card ${styles.themesCard}`}
        aria-labelledby="quiz-themes-title"
      >
        <h2 id="quiz-themes-title" className={styles.sectionTitle}>
          Temas abordados
        </h2>
        <ul className={styles.themeList}>
          {quizThemes.map((theme) => (
            <li key={theme.id} className={styles.themeItem}>
              {theme.label}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actions}>
        <Link to="/quiz/perguntas" className={styles.startButton}>
          {QUIZ_START_LABEL}
        </Link>
      </div>
    </main>
  );
}
