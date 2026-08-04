/**
 * proposalGrouping — pure helper that groups a candidate's proposals by theme.
 *
 * Used by the Candidate Profile "Propostas" tab (CandidateProfilePage). Kept as
 * a pure, dependency-free function so it is directly unit- and property-testable
 * without rendering any React.
 *
 * Behavior (Req 6.1, 6.2, 6.3, 6.4):
 *  - Groups proposals by their `theme` id.
 *  - Group order follows the canonical `proposalThemes` order from the
 *    Data_Store (src/data/topics.js).
 *  - Themes that have no proposals are omitted entirely (Req 6.4).
 *  - Each proposal retains its original data; every proposal ends up in exactly
 *    one group matching its theme (no loss, no duplication).
 *
 * @typedef {Object} Theme
 * @property {string} id
 * @property {string} label
 *
 * @typedef {Object} ProposalGroup
 * @property {string} theme        - theme id
 * @property {string} label        - theme display label
 * @property {Array<Object>} proposals - proposals belonging to this theme
 */

import { proposalThemes as defaultProposalThemes } from '../data/topics.js';

/**
 * Group a candidate's proposals by theme, preserving the canonical theme order
 * and omitting themes with no proposals.
 *
 * @param {Array<{theme: string}>} proposals - the candidate's proposals.
 * @param {Theme[]} [proposalThemes=defaultProposalThemes] - ordered theme list
 *   (id + label). Defaults to the Data_Store `proposalThemes` for testability.
 * @returns {ProposalGroup[]} ordered groups, one per non-empty theme, in the
 *   order themes appear in `proposalThemes`.
 */
export function groupProposalsByTheme(proposals, proposalThemes = defaultProposalThemes) {
  const list = Array.isArray(proposals) ? proposals : [];

  return proposalThemes
    .map((theme) => ({
      theme: theme.id,
      label: theme.label,
      proposals: list.filter((proposal) => proposal.theme === theme.id),
    }))
    .filter((group) => group.proposals.length > 0);
}
