// src/pages/CandidateProfilePage.jsx
//
// CandidateProfilePage — the candidate detail view served at "/candidato/:id"
// (Req 4). It reads the `:id` route param, loads the candidate through the
// Data_Provider (`getCandidateById`) via `useProviderData`, and either renders a
// friendly not-found view when the id is unknown (Req 4.5) or composes the full
// profile: a CandidateProfileHeader (Req 4.1, 4.2) plus a ProfileTabs control
// (Req 4.3, 4.4) whose four panels are:
//
//   - Bio       — biography summary (Req 5.1), a "Formação" card listing each
//                 education entry's graduação/universidade/ano (Req 5.2), a
//                 "Trajetória" card of prior experiences/positions derived from
//                 the candidate's history (Req 5.3), and a DemonstrativeLabel
//                 (Req 5.4).
//   - Propostas — proposals grouped by theme via `groupProposalsByTheme`, which
//                 omits empty themes (Req 6.1, 6.4); each theme label is a header
//                 and each proposal renders as a ProposalCard (Req 6.2).
//   - Finanças  — a FinanceCard for the candidate's finances (Req 7.1).
//   - Histórico — a HistoryTimeline for the candidate's history (Req 8.1).
//
// Data flows exclusively through the Data_Provider, so the sync→async swap stays
// isolated to `useProviderData` and this page needs no changes when the source
// is replaced.
//
// Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.4,
// 7.1, 8.1.

import { Link, useParams } from 'react-router-dom';
import { getCandidateById } from '../providers/dataProvider.js';
import { useProviderData } from '../hooks/useProviderData.js';
import { groupProposalsByTheme } from '../domain/proposalGrouping.js';
import CandidateProfileHeader from '../components/CandidateProfileHeader/CandidateProfileHeader.jsx';
import ProfileTabs from '../components/ProfileTabs/ProfileTabs.jsx';
import ProposalCard from '../components/ProposalCard/ProposalCard.jsx';
import FinanceCard from '../components/FinanceCard/FinanceCard.jsx';
import HistoryTimeline from '../components/HistoryTimeline/HistoryTimeline.jsx';
import DemonstrativeLabel from '../components/DemonstrativeLabel/DemonstrativeLabel.jsx';
import styles from './CandidateProfilePage.module.css';

/**
 * Message shown when the `:id` path param matches no candidate (Req 4.5).
 * @type {string}
 */
export const NOT_FOUND_MESSAGE = 'Candidato não encontrado.';

/**
 * Render the "Bio" tab content for a candidate (Req 5.1–5.4).
 *
 * Shows the biography summary, a "Formação" card enumerating each education
 * entry's graduação, universidade, and ano, a "Trajetória" card built from the
 * candidate's history entries (prior experiences / previous positions), and a
 * DemonstrativeLabel marking the content as fictional.
 *
 * @param {import('../data/candidates.js').Candidate} candidate
 * @returns {JSX.Element}
 */
function BioPanel({ candidate }) {
  const education = candidate.education ?? [];
  const history = candidate.history ?? [];

  return (
    <div className={styles.bio}>
      {/* Biography summary (Req 5.1) */}
      <p className={styles.bioSummary}>{candidate.bio}</p>

      {/* Formação card (Req 5.2) */}
      <section className={`card ${styles.card}`} aria-labelledby="formacao-heading">
        <h2 id="formacao-heading" className={styles.cardHeading}>
          Formação
        </h2>
        {education.length > 0 ? (
          <ul className={styles.formacaoList}>
            {education.map((entry, index) => (
              <li
                key={`${entry.graduacao}-${index}`}
                className={styles.formacaoItem}
                data-testid="education-entry"
              >
                <span className={styles.formacaoGraduacao}>{entry.graduacao}</span>
                <span className={styles.formacaoDetail}>
                  {entry.universidade} · {entry.ano}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nenhuma formação disponível.</p>
        )}
      </section>

      {/* Trajetória card — derived from history (Req 5.3) */}
      <section className={`card ${styles.card}`} aria-labelledby="trajetoria-heading">
        <h2 id="trajetoria-heading" className={styles.cardHeading}>
          Trajetória
        </h2>
        {history.length > 0 ? (
          <ul className={styles.trajetoriaList}>
            {history.map((entry, index) => (
              <li
                key={`${entry.year}-${index}`}
                className={styles.trajetoriaItem}
                data-testid="trajetoria-entry"
              >
                <span className={styles.trajetoriaYear}>{entry.year}</span>
                <span className={styles.trajetoriaEvent}>{entry.event}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nenhuma trajetória disponível.</p>
        )}
      </section>

      {/* Demonstrative-data label (Req 5.4) */}
      <DemonstrativeLabel />
    </div>
  );
}

/**
 * Render the "Propostas" tab content for a candidate (Req 6.1, 6.2, 6.4).
 *
 * Groups the candidate's proposals by theme with `groupProposalsByTheme`, which
 * follows the canonical theme order and omits themes with no proposals. Each
 * non-empty theme renders its label as a header followed by one ProposalCard per
 * proposal.
 *
 * @param {import('../data/candidates.js').Candidate} candidate
 * @returns {JSX.Element}
 */
function ProposalsPanel({ candidate }) {
  const groups = groupProposalsByTheme(candidate.proposals ?? []);

  if (groups.length === 0) {
    return <p className={styles.empty}>Nenhuma proposta disponível.</p>;
  }

  return (
    <div className={styles.proposals}>
      {groups.map((group) => (
        <section
          key={group.theme}
          className={styles.proposalGroup}
          aria-label={group.label}
          data-testid="proposal-group"
        >
          <h2 className={styles.proposalTheme}>{group.label}</h2>
          <div className={styles.proposalCards}>
            {group.proposals.map((proposal, index) => (
              <ProposalCard key={`${group.theme}-${index}`} proposal={proposal} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Candidate profile page for the "/candidato/:id" route.
 *
 * Reads the `:id` route param with `useParams`, loads the candidate through the
 * Data_Provider (`getCandidateById`) via `useProviderData` keyed on the id, and
 * renders a not-found view when the candidate is missing (Req 4.5). When found,
 * it renders the CandidateProfileHeader and a four-tab ProfileTabs (Bio,
 * Propostas, Finanças, Histórico) whose panels present the biography/education/
 * trajectory, theme-grouped proposals, campaign finances, and history timeline
 * respectively.
 *
 * @returns {JSX.Element}
 */
export default function CandidateProfilePage() {
  const { id } = useParams();
  const { data: candidate } = useProviderData(() => getCandidateById(id), [id]);

  if (!candidate) {
    return (
      <section className={`container ${styles.notFound}`}>
        <p className={styles.notFoundMessage}>{NOT_FOUND_MESSAGE}</p>
        <Link className={styles.notFoundLink} to="/">
          Voltar para o início
        </Link>
      </section>
    );
  }

  const tabs = [
    { label: 'Bio', content: <BioPanel candidate={candidate} /> },
    { label: 'Propostas', content: <ProposalsPanel candidate={candidate} /> },
    { label: 'Finanças', content: <FinanceCard finances={candidate.finances} /> },
    { label: 'Histórico', content: <HistoryTimeline history={candidate.history} /> },
  ];

  return (
    <section className={`container ${styles.page}`}>
      <CandidateProfileHeader candidate={candidate} />
      <ProfileTabs tabs={tabs} />
    </section>
  );
}
