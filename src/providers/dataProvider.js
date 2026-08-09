// src/providers/dataProvider.js
//
// Data_Provider — the single seam between the presentation layer and the
// Data_Store. Pages and components request data exclusively through these
// functions and never import the raw data modules directly, so the underlying
// source (local JS today, an HTTP API tomorrow) can be swapped without touching
// any page component.
//
// Design contracts (see design.md § Data_Provider Interface):
//   - Immutability: every function returns a deep-cloned, deeply-frozen copy so
//     callers can never mutate the singleton Data_Store. This keeps the store
//     safe and keeps domain functions referentially transparent.
//   - Office/state scoping is centralized here (Design Property 2) so pages do
//     not encode data-shape knowledge.
//   - Not-found is null, never a throw (Req 4.5).
//   - Async-readiness: the MVP returns values synchronously, but the shapes and
//     the consuming `useProviderData` hook tolerate a Promise so a `fetch(...)`
//     swap is drop-in.
//
// Validates / supports: Requirements 13.5, 2.3, 3.1, 3.2, 4.5, 10.1, 9.2.

import { candidates } from '../data/dataSource.js';
import { questions } from '../data/questions.js';
import { proposalThemes, quizThemes, states } from '../data/topics.js';

/**
 * The two offices covered by the MVP. Exposed as constants so callers compare
 * against a shared value rather than re-typing the literal string.
 */
export const OFFICE_PRESIDENTE = 'Presidente da República';
export const OFFICE_GOVERNADOR = 'Governador';

/**
 * Deeply clone a value so the returned structure shares no references with the
 * Data_Store. Prefers the structured clone algorithm when available and falls
 * back to a JSON round-trip (the Data_Store contains only JSON-safe values).
 *
 * @template T
 * @param {T} value
 * @returns {T} a structural copy
 */
function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * Recursively freeze a value so neither it nor any nested object/array can be
 * mutated by a caller. Operates on an already-cloned structure.
 *
 * @template T
 * @param {T} value
 * @returns {Readonly<T>} the same value, deeply frozen
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  // Freeze children first so the object is fully immutable once it is frozen.
  for (const key of Object.keys(value)) {
    deepFreeze(value[key]);
  }
  return Object.freeze(value);
}

/**
 * Produce an immutable, caller-owned copy of a Data_Store value.
 *
 * @template T
 * @param {T} value
 * @returns {Readonly<T>}
 */
function immutableCopy(value) {
  return deepFreeze(deepClone(value));
}

/**
 * Return all selectable states (UFs) available in the Data_Store. Adding a state
 * to the Data_Store requires no page changes (Req 2.3).
 *
 * @returns {ReadonlyArray<Readonly<import('../data/topics.js').StateOption>>}
 */
export function getStates() {
  return immutableCopy(states);
}

/**
 * Return candidates for an office. Scoping is centralized here (Design
 * Property 2): the result contains exactly the candidates whose `position`
 * equals `office`, and — when `office` is "Governador" and a `uf` is provided —
 * whose `state` equals that `uf`. No other candidates are returned.
 *
 * @param {"Presidente da República"|"Governador"} office
 * @param {string} [uf] - two-letter UF used to scope the Governador list (Req 3.2)
 * @returns {ReadonlyArray<Readonly<import('../data/candidates.js').Candidate>>}
 */
export function getCandidatesByOffice(office, uf) {
  const scopeByState = office === OFFICE_GOVERNADOR && uf !== undefined && uf !== null;

  const matched = candidates.filter((candidate) => {
    if (candidate.position !== office) return false;
    if (scopeByState && candidate.state !== uf) return false;
    return true;
  });

  return immutableCopy(matched);
}

/**
 * Return a single candidate by id, or `null` when no candidate matches. Never
 * throws, so the profile page can render a friendly not-found view (Req 4.5).
 *
 * @param {string} id
 * @returns {Readonly<import('../data/candidates.js').Candidate>|null}
 */
export function getCandidateById(id) {
  const found = candidates.find((candidate) => candidate.id === id);
  return found ? immutableCopy(found) : null;
}

/**
 * Return the objective quiz questions (Req 10.1).
 *
 * @returns {ReadonlyArray<Readonly<import('../data/questions.js').Question>>}
 */
export function getQuestions() {
  return immutableCopy(questions);
}

/**
 * Return the themes for a given usage. Callers request either the proposal
 * theme set (Req 6.1) or the quiz theme set (Req 9.2); the quiz set is the
 * default because it drives the affinity feature.
 *
 * @param {"proposal"|"quiz"} [kind="quiz"]
 * @returns {ReadonlyArray<Readonly<import('../data/topics.js').Theme>>}
 */
export function getThemes(kind = 'quiz') {
  const source = kind === 'proposal' ? proposalThemes : quizThemes;
  return immutableCopy(source);
}
