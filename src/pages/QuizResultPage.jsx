// src/pages/QuizResultPage.jsx
//
// QuizResultPage — the guarded affinity result view served at "/quiz/resultado".
//
// Guard (Req 12.6): the page derives completion from the quiz CONTEXT, not a
// stored flag, so a direct URL entry cannot spoof it. If not every quiz question
// has been answered, it renders <Navigate to="/quiz" replace /> to send the User
// back to the quiz intro. This cannot be bypassed by typing the URL directly.
//
// When the quiz is complete, the page computes the ranked results with the pure
// Affinity_Engine `computeResults(answers, questions, candidates)` and renders:
//   - the exact title "Seu resultado" and heading
//     "Candidatos com maior afinidade com suas respostas" (Req 12.1),
//   - one <ResultCard> per candidate, in computeResults order (descending
//     affinity, ties by id), each showing the overall Affinity_Percentage and a
//     per-theme breakdown (Req 12.2, 12.3),
//   - an explanation stating the percentage is a proximity/comparison measure
//     and NOT a vote recommendation (Req 12.4).
//
// Candidate set choice (documented): computeResults ranks a candidate SET, and
// there is no getAllCandidates provider function. To make the result meaningful
// across the whole MVP, this page ranks the CONCATENATION of both offices'
// candidates — getCandidatesByOffice('Presidente da República') plus
// getCandidatesByOffice('Governador') — rather than a single office. This keeps
// the ranking comparison broad while going through the Data_Provider seam.
//
// CRITICAL (Req 12.5): no copy on this page may ever contain the phrases
// "Seu candidato é", "Você deveria votar em", or "Vote em". All wording here is
// deliberately framed as comparison/proximity, never as a recommendation.
//
// Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6.

import { Navigate } from 'react-router-dom';
import {
  getQuestions,
  getThemes,
  getCandidatesByOffice,
  OFFICE_PRESIDENTE,
  OFFICE_GOVERNADOR,
} from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import { computeResults } from '../domain/affinityEngine.js';
import { useQuiz } from '../context/QuizContext.jsx';
import ResultCard from '../components/ResultCard/ResultCard.jsx';
import styles from './QuizResultPage.module.css';

/**
 * The exact page title mandated by the spec (Req 12.1).
 * @type {string}
 */
export const RESULT_TITLE = 'Seu resultado';

/**
 * The exact heading mandated by the spec (Req 12.1).
 * @type {string}
 */
export const RESULT_HEADING = 'Candidatos com maior afinidade com suas respostas';

/**
 * Quiz result page.
 *
 * Reads the quiz answers from {@link useQuiz}. It first loads the questions via
 * the Data_Provider and applies the completion guard: when `isAllAnswered` is
 * false the page redirects to "/quiz" with `<Navigate replace />` (Req 12.6).
 *
 * When complete, it loads both offices' candidates (concatenated), the quiz
 * themes (used as id→label for readable per-theme breakdowns), computes the
 * ranked results with `computeResults`, and renders the title, heading, ranked
 * <ResultCard> list, and the not-a-recommendation explanation. A candidates-by-id
 * map lets each ResultCard receive its candidate record in ranking order.
 *
 * @returns {JSX.Element}
 */
export default function QuizResultPage() {
  const { answers, isAllAnswered } = useQuiz();

  const { data: questions } = useProviderData(() => getQuestions(), []);
  const { data: presidentes } = useProviderData(
    () => getCandidatesByOffice(OFFICE_PRESIDENTE),
    [],
  );
  const { data: governadores } = useProviderData(
    () => getCandidatesByOffice(OFFICE_GOVERNADOR),
    [],
  );
  const { data: themes } = useProviderData(() => getThemes('quiz'), []);

  const questionList = questions ?? [];

  // Guard (Req 12.6): completion is derived from context, never a stored flag.
  if (!isAllAnswered(questionList)) {
    return <Navigate to="/quiz" replace />;
  }

  // Documented choice: rank both offices' candidates together (see file header).
  const candidates = [...(presidentes ?? []), ...(governadores ?? [])];

  // Only candidates with a COMPLETE set of quiz positions can be ranked — this
  // keeps the quiz honest with real data (candidates not yet analysed are not
  // shown with a misleading 0%). Demonstrative candidates all carry positions,
  // so nothing changes in demo mode.
  const QUIZ_POSITION_KEYS = ['economia', 'estado', 'seguranca', 'meioAmbiente', 'educacao'];
  const scored = candidates.filter(
    (c) => c && c.positions && QUIZ_POSITION_KEYS.every((k) => typeof c.positions[k] === 'number'),
  );

  // theme id -> display label, so the per-theme breakdown is human-readable.
  const themeLabels = (themes ?? []).reduce((map, theme) => {
    map[theme.id] = theme.label;
    return map;
  }, {});

  // candidate id -> record, to hand each ResultCard its candidate in rank order.
  const candidatesById = scored.reduce((map, candidate) => {
    map[candidate.id] = candidate;
    return map;
  }, {});

  const results = computeResults(answers, questionList, scored);

  return (
    <section className={`container ${styles.page}`}>
      <header className={styles.head}>
        <p className={styles.title}>{RESULT_TITLE}</p>
        <h1 className={styles.heading}>{RESULT_HEADING}</h1>
      </header>

      <p className={styles.explanation}>
        A porcentagem de afinidade indica o quão próximas suas respostas estão das
        posições de cada candidato. É uma medida de comparação e proximidade de
        opiniões, e não uma indicação de em quem você deve votar. Use o resultado
        para explorar e formar a sua própria conclusão.
      </p>

      {results.length === 0 ? (
        <p className={styles.explanation}>
          Ainda não há candidatos avaliados para o quiz. As posições dos
          candidatos são definidas a partir dos planos de governo e de fontes
          públicas, e serão publicadas conforme a análise for concluída.
        </p>
      ) : (
        <ol className={styles.results}>
          {results.map((result) => {
            const candidate = candidatesById[result.candidateId];
            if (!candidate) return null;
            return (
              <li key={result.candidateId} className={styles.item}>
                <ResultCard
                  candidate={candidate}
                  result={result}
                  themeLabels={themeLabels}
                />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
