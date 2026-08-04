// src/domain/candidateFilter.js
//
// Pure, IO-free candidate filtering logic used by the candidate-listing UI.
// Combines a case-insensitive name/party substring search with an ideology
// selection. It never mutates its inputs.
//
// Validates: Requirements 3.5, 3.7, 3.8, 3.9 (Design Property 1).

/**
 * Sentinel ideology selection meaning "no ideology constraint".
 * @type {"Todos"}
 */
export const IDEOLOGY_ALL = 'Todos';

/**
 * Normalize a string for case-insensitive, locale-aware comparison.
 * Uses `toLocaleLowerCase` so accented/unicode characters fold consistently.
 *
 * @param {unknown} value
 * @returns {string} the lowercased string, or "" for nullish/non-string input
 */
function normalize(value) {
  if (value === null || value === undefined) return '';
  return String(value).toLocaleLowerCase();
}

/**
 * Determine whether a single candidate satisfies the active predicates.
 *
 * @param {import('../data/candidates.js').Candidate} candidate
 * @param {string} normalizedQuery - already-normalized (lowercased) search text
 * @param {boolean} searchActive - whether the search predicate should apply
 * @param {string} ideology - selected ideology, or "Todos" for no constraint
 * @returns {boolean}
 */
function candidateMatches(candidate, normalizedQuery, searchActive, ideology) {
  // Ideology predicate (active only when not "Todos").
  if (ideology !== IDEOLOGY_ALL && candidate.ideology !== ideology) {
    return false;
  }

  // Search predicate (active only when the query is non-blank). The match uses
  // the query as typed (case-folded) so it stays faithful to a literal
  // substring test rather than silently trimming user input.
  if (searchActive) {
    const nameMatch = normalize(candidate.name).includes(normalizedQuery);
    const partyMatch = normalize(candidate.party).includes(normalizedQuery);
    if (!nameMatch && !partyMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Filter a list of candidates by a search query and an ideology selection.
 *
 * Semantics (Design Property 1): the result contains exactly those candidates
 * that satisfy every active predicate:
 *   - the candidate's `name` OR `party` contains `query` as a case-insensitive
 *     substring (predicate active only when `query` is non-blank), AND
 *   - when `ideology` is not "Todos", the candidate's `ideology` equals the
 *     selected ideology.
 *
 * An empty/blank query combined with `ideology === "Todos"` returns the input
 * set unchanged (same members, in the same order). The input array is never
 * mutated.
 *
 * @param {import('../data/candidates.js').Candidate[]} candidates
 * @param {Object} [options]
 * @param {string} [options.query=""] - search text (matched against name/party)
 * @param {string} [options.ideology="Todos"] - ideology selection or "Todos"
 * @returns {import('../data/candidates.js').Candidate[]} a new filtered array
 */
export function filterCandidates(candidates, { query = '', ideology = IDEOLOGY_ALL } = {}) {
  if (!Array.isArray(candidates)) return [];

  const normalizedQuery = normalize(query);
  // A query that is empty or whitespace-only imposes no search constraint.
  const searchActive = normalizedQuery.trim().length > 0;

  // Fast path: no active predicates -> return a shallow copy of the input set.
  if (!searchActive && ideology === IDEOLOGY_ALL) {
    return candidates.slice();
  }

  return candidates.filter((candidate) =>
    candidateMatches(candidate, normalizedQuery, searchActive, ideology)
  );
}
