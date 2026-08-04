/**
 * Affinity_Engine — pure, deterministic affinity computation.
 *
 * Converts quiz answers into per-theme user vectors and computes, per candidate,
 * an overall affinity and a per-theme affinity. All outputs are integers bounded
 * to [0, 100], and ranking is deterministic with ties broken by candidate id.
 *
 * This module has no React, no I/O, and no side effects — it is directly unit-
 * and property-testable.
 *
 * @module domain/affinityEngine
 */

/**
 * Maximum possible distance between two points on the shared 1..5 Likert scale.
 * @type {number}
 */
export const MAX_DELTA = 4;

/**
 * @typedef {Object.<string, number>} Answers
 *   Map of questionId -> selected AnswerOption.value (1..5).
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} theme
 * @property {string} [text]
 * @property {Array<Object>} [options]
 */

/**
 * @typedef {Object} ThemeAffinity
 * @property {string} theme       - Theme id
 * @property {number} percentage  - integer in [0, 100]
 */

/**
 * @typedef {Object} AffinityResult
 * @property {string} candidateId
 * @property {number} overall              - integer in [0, 100]
 * @property {ThemeAffinity[]} byTheme
 */

/**
 * Clamp a number into the inclusive [0, 100] range.
 * @param {number} n
 * @returns {number}
 */
function clampPercentage(n) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

/**
 * Build a per-theme user vector from the answers.
 *
 * For each quiz theme, averages the values of the answered questions belonging
 * to that theme. Themes with no answered questions are excluded from the vector.
 *
 * @param {Answers} answers - map of questionId -> value (1..5)
 * @param {Question[]} questions - quiz questions (each carries a `theme`)
 * @returns {Object.<string, number>} theme -> mean answer value
 */
export function buildUserVector(answers, questions) {
  /** @type {Object.<string, {sum: number, count: number}>} */
  const accumulators = {};

  const answerMap = answers || {};
  const questionList = questions || [];

  for (const question of questionList) {
    if (!question || question.theme == null) continue;
    const value = answerMap[question.id];
    // Only answered questions contribute to the vector.
    if (value == null) continue;

    const theme = question.theme;
    if (!accumulators[theme]) {
      accumulators[theme] = { sum: 0, count: 0 };
    }
    accumulators[theme].sum += value;
    accumulators[theme].count += 1;
  }

  /** @type {Object.<string, number>} */
  const userVector = {};
  for (const theme of Object.keys(accumulators)) {
    const { sum, count } = accumulators[theme];
    // count is guaranteed >= 1 for any theme present in the accumulator.
    userVector[theme] = sum / count;
  }

  return userVector;
}

/**
 * Compute the affinity result for a single candidate against a user vector.
 *
 * For each theme present in the user vector, the absolute distance to the
 * candidate's position is converted to a similarity percentage:
 *   delta         = abs(userVector[theme] - candidate.positions[theme])
 *   themeAffinity = round((1 - delta / MAX_DELTA) * 100)
 * If the candidate has no position for a theme present in the user vector,
 * that theme contributes 0% for the candidate.
 *
 * The overall affinity is the rounded mean of the per-theme affinities. When
 * the user vector has no themes, `overall` is 0.
 *
 * @param {Object.<string, number>} userVector - theme -> mean answer value
 * @param {Object} candidate - a Candidate record (uses `id` and `positions`)
 * @returns {AffinityResult}
 */
export function computeAffinity(userVector, candidate) {
  const vector = userVector || {};
  const positions = (candidate && candidate.positions) || {};
  const candidateId = candidate ? candidate.id : undefined;

  const themes = Object.keys(vector);
  /** @type {ThemeAffinity[]} */
  const byTheme = [];
  let affinitySum = 0;

  for (const theme of themes) {
    let percentage;
    if (Object.prototype.hasOwnProperty.call(positions, theme) && positions[theme] != null) {
      const delta = Math.abs(vector[theme] - positions[theme]);
      percentage = clampPercentage(Math.round((1 - delta / MAX_DELTA) * 100));
    } else {
      // Missing candidate position for a theme present in the user vector.
      percentage = 0;
    }
    byTheme.push({ theme, percentage });
    affinitySum += percentage;
  }

  const overall = themes.length === 0
    ? 0
    : clampPercentage(Math.round(affinitySum / themes.length));

  return { candidateId, overall, byTheme };
}

/**
 * Compute and rank affinity results for all candidates.
 *
 * Builds the user vector once, computes each candidate's affinity, then sorts
 * by overall affinity descending, breaking ties by candidate id ascending
 * (lexicographic). The ordering is deterministic and permutation-invariant.
 *
 * @param {Answers} answers - map of questionId -> value (1..5)
 * @param {Question[]} questions - quiz questions
 * @param {Object[]} candidates - candidate records
 * @returns {AffinityResult[]} sorted by overall desc, then id asc
 */
export function computeResults(answers, questions, candidates) {
  const userVector = buildUserVector(answers, questions);
  const candidateList = candidates || [];

  const results = candidateList.map((candidate) => computeAffinity(userVector, candidate));

  results.sort((a, b) => {
    if (b.overall !== a.overall) {
      return b.overall - a.overall;
    }
    // Deterministic tie-break: ascending lexicographic candidate id.
    const idA = String(a.candidateId);
    const idB = String(b.candidateId);
    if (idA < idB) return -1;
    if (idA > idB) return 1;
    return 0;
  });

  return results;
}
