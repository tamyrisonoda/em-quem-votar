// src/components/ProposalCard/ProposalCard.jsx
//
// Renders a single candidate proposal (Req 6.2). Each proposal belongs to a
// Theme, but the grouping BY theme (theme headers, omitting empty themes) is
// the responsibility of the parent CandidateProfilePage; this component renders
// exactly one proposal card. It shows the proposal-specific source text
// "Dados demonstrativos" (Req 6.3) — note this is the shorter proposal source
// text, distinct from the full DemonstrativeLabel "Dados demonstrativos para o
// MVP".
//
// Validates: Requirements 6.2, 6.3.

import styles from './ProposalCard.module.css';

/**
 * The exact source text shown on each proposal card (Req 6.3).
 * Distinct from the full DemonstrativeLabel string used elsewhere.
 * @type {string}
 */
export const PROPOSAL_SOURCE_TEXT = 'Dados demonstrativos';

/**
 * Render a single proposal as a card.
 *
 * Accepts either a `proposal` object ({ theme, text }) or the individual
 * `text`/`theme` props; the explicit `text`/`theme` props take precedence when
 * both are supplied. The proposal `text` is rendered as the card body, and the
 * fixed source text "Dados demonstrativos" is rendered beneath it. A `theme`
 * label may optionally be displayed, but theme grouping/headers remain the
 * parent page's responsibility. Uses the shared `.card` class for rounded
 * corners + soft shadow (Req 15.4) with neutral token styling.
 *
 * @param {Object} props
 * @param {{theme?: string, text?: string}} [props.proposal] - proposal record
 * @param {string} [props.text] - proposal description (overrides proposal.text)
 * @param {string} [props.theme] - theme label for display (overrides proposal.theme)
 * @param {string} [props.className] - extra class names for placement variations
 * @returns {JSX.Element}
 */
export default function ProposalCard({ proposal, text, theme, className }) {
  const proposalText = text ?? proposal?.text ?? '';
  const themeLabel = theme ?? proposal?.theme;
  const classes = className
    ? `card ${styles.proposal} ${className}`
    : `card ${styles.proposal}`;

  return (
    <article className={classes}>
      {themeLabel ? <span className={styles.theme}>{themeLabel}</span> : null}
      <p className={styles.text}>{proposalText}</p>
      <small className={styles.source}>{PROPOSAL_SOURCE_TEXT}</small>
    </article>
  );
}
