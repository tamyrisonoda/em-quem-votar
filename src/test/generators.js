// fast-check arbitraries for the "Em Quem Votar" domain data models.
//
// These generators are shared by the property-based tests defined in later
// tasks (e.g. 2.4, 3.2, 4.2, 4.4, 4.5, 4.6, 8.4, 8.6, ...). They mirror the
// data models documented in design.md. Where it is useful, the arbitraries are
// parametrizable (fixed office, fixed ideology, fixed theme, id ranges, ...)
// so downstream tests can constrain the input space intelligently.
//
// All values are fictional / demonstrative and follow the shared 1..5 Likert
// scale used by candidate positions and quiz answer option values.

import fc from 'fast-check';

// --- Domain constants -------------------------------------------------------

/** Ordered ideology categories (Glossary: Ideology_Category). */
export const IDEOLOGIES = [
  'Esquerda',
  'Centro-esquerda',
  'Centro',
  'Centro-direita',
  'Direita',
];

/** Offices covered by the MVP (Candidate.position). */
export const OFFICES = ['Presidente da República', 'Governador'];

/** Quiz themes (design.md: economia, estado, seguranca, meioAmbiente, educacao). */
export const QUIZ_THEMES = [
  'economia',
  'estado',
  'seguranca',
  'meioAmbiente',
  'educacao',
];

/** Proposal themes (Req 6.1). */
export const PROPOSAL_THEMES = [
  'saude',
  'educacao',
  'economia',
  'meioAmbiente',
  'seguranca',
  'habitacao',
  'transporte',
];

/** The numeric keys carried by a Candidate.positions object (Req 13.3). */
export const POSITION_KEYS = [
  'economia',
  'estado',
  'seguranca',
  'meioAmbiente',
  'educacao',
];

/** A representative set of Brazilian UF codes for Governador scoping. */
export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

// --- Primitive / scalar arbitraries ----------------------------------------

/** The shared 1..5 Likert scale value (positions and answer option values). */
export const scaleValueArb = fc.integer({ min: 1, max: 5 });

/** An ideology category. */
export const ideologyArb = fc.constantFrom(...IDEOLOGIES);

/** An office. */
export const officeArb = fc.constantFrom(...OFFICES);

/** A quiz theme id. */
export const quizThemeArb = fc.constantFrom(...QUIZ_THEMES);

/** A proposal theme id. */
export const proposalThemeArb = fc.constantFrom(...PROPOSAL_THEMES);

/** A two-letter UF code. */
export const ufArb = fc.constantFrom(...UFS);

/** A non-empty identifier suitable for candidate/question/option ids. */
export const idArb = fc.hexaString({ minLength: 6, maxLength: 12 });

/**
 * A search query arbitrary: mixed case plus unicode strings, including empty.
 * Exercises the case-insensitive, unicode-aware search path (Req 3.5).
 */
export const searchQueryArb = fc.oneof(
  fc.string(),
  fc.string({ minLength: 1, maxLength: 8 }),
  fc.unicodeString({ maxLength: 8 }),
  fc.fullUnicodeString({ maxLength: 8 }),
);

// --- Positions --------------------------------------------------------------

/**
 * A Positions object: integer weights 1..5 for each of the five position keys.
 * @param {Object} [options]
 * @param {string[]} [options.keys] - override which keys to include.
 */
export function positionsArb(options = {}) {
  const keys = options.keys ?? POSITION_KEYS;
  return fc.record(
    Object.fromEntries(keys.map((k) => [k, scaleValueArb])),
  );
}

// --- Quiz: AnswerOption / Question / Answers -------------------------------

/**
 * An AnswerOption: {id, label, value} with value on the 1..5 scale.
 * @param {Object} [options]
 * @param {number} [options.value] - fix the option value.
 */
export function answerOptionArb(options = {}) {
  const valueArb = options.value != null ? fc.constant(options.value) : scaleValueArb;
  return fc.record({
    id: idArb,
    label: fc.string({ minLength: 1, maxLength: 30 }),
    value: valueArb,
  });
}

/**
 * A Question: {id, theme, text, options}. `theme` is a quiz theme id and
 * `options` is a non-empty list of AnswerOptions.
 * @param {Object} [options]
 * @param {string} [options.theme] - fix the question theme.
 */
export function questionArb(options = {}) {
  const themeArb = options.theme != null ? fc.constant(options.theme) : quizThemeArb;
  return fc.record({
    id: idArb,
    theme: themeArb,
    text: fc.string({ minLength: 1, maxLength: 80 }),
    options: fc.array(answerOptionArb(), { minLength: 2, maxLength: 5 }),
  });
}

/**
 * A list of Questions with unique ids.
 * @param {Object} [options]
 * @param {number} [options.minLength=1]
 * @param {number} [options.maxLength=10]
 * @param {string} [options.theme] - fix the theme for every question.
 */
export function questionsArb(options = {}) {
  const { minLength = 1, maxLength = 10, theme } = options;
  return fc.uniqueArray(questionArb({ theme }), {
    selector: (q) => q.id,
    minLength,
    maxLength,
  });
}

/**
 * An Answers map: questionId -> value (1..5). Generic dictionary form for
 * tests that do not need alignment with a specific question set.
 */
export const answersArb = fc.dictionary(idArb, scaleValueArb);

/**
 * Build an Answers map aligned to a concrete list of questions. Each question
 * is answered with a value drawn from its own options (so answers are always
 * valid selections). Useful for affinity-engine property tests.
 * @param {Array<{id:string, options:Array<{value:number}>}>} questions
 */
export function answersForQuestionsArb(questions) {
  if (questions.length === 0) return fc.constant({});
  return fc.tuple(
    ...questions.map((q) =>
      fc.constantFrom(...q.options.map((o) => o.value)),
    ),
  ).map((values) =>
    Object.fromEntries(questions.map((q, i) => [q.id, values[i]])),
  );
}

// --- Finances ---------------------------------------------------------------

/** A FinanceSource: {category, percentage} with percentage 0..100. */
export const financeSourceArb = fc.record({
  category: fc.string({ minLength: 1, maxLength: 30 }),
  percentage: fc.integer({ min: 0, max: 100 }),
});

/** A Finances object: {total, sources}. */
export const financesArb = fc.record({
  total: fc.double({ min: 0, max: 1000, noNaN: true }),
  sources: fc.array(financeSourceArb, { minLength: 1, maxLength: 6 }),
});

// --- History / Education / Proposals ---------------------------------------

/** A HistoryEntry: {year, event}. */
export const historyEntryArb = fc.record({
  year: fc.integer({ min: 1900, max: 2030 }),
  event: fc.string({ minLength: 1, maxLength: 60 }),
});

/** An EducationEntry: {graduacao, universidade, ano}. */
export const educationEntryArb = fc.record({
  graduacao: fc.string({ minLength: 1, maxLength: 40 }),
  universidade: fc.string({ minLength: 1, maxLength: 40 }),
  ano: fc.integer({ min: 1950, max: 2030 }),
});

/** A Proposal: {theme, text}. */
export const proposalArb = fc.record({
  theme: proposalThemeArb,
  text: fc.string({ minLength: 1, maxLength: 80 }),
});

// --- Candidate --------------------------------------------------------------

/**
 * A Candidate record (design.md / Req 13.2). State is derived from office:
 * "Governador" gets a UF, "Presidente da República" gets null — unless an
 * explicit `state` override is supplied.
 *
 * @param {Object} [options]
 * @param {string} [options.office]    - fix the office ("Presidente da República"|"Governador").
 * @param {string} [options.ideology]  - fix the ideology category.
 * @param {string|null} [options.state] - fix the state (UF or null).
 */
export function candidateArb(options = {}) {
  const officeValueArb = options.office != null ? fc.constant(options.office) : officeArb;
  const ideologyValueArb = options.ideology != null ? fc.constant(options.ideology) : ideologyArb;

  return fc
    .record({
      id: idArb,
      name: fc.string({ minLength: 1, maxLength: 40 }),
      number: fc
        .integer({ min: 10, max: 99999 })
        .map((n) => String(n)),
      party: fc.string({ minLength: 1, maxLength: 12 }),
      position: officeValueArb,
      ideology: ideologyValueArb,
      photo: fc.webUrl(),
      bio: fc.string({ maxLength: 200 }),
      education: fc.array(educationEntryArb, { maxLength: 4 }),
      proposals: fc.array(proposalArb, { maxLength: 8 }),
      finances: financesArb,
      history: fc.array(historyEntryArb, { maxLength: 6 }),
      positions: positionsArb(),
    })
    .chain((candidate) => {
      if (candidate.position === 'Governador') {
        if (options.state !== undefined) {
          return fc.constant({ ...candidate, state: options.state });
        }
        return ufArb.map((uf) => ({ ...candidate, state: uf }));
      }
      // Presidente da República: no state (unless explicitly overridden).
      const state = options.state !== undefined ? options.state : null;
      return fc.constant({ ...candidate, state });
    });
}

/**
 * A list of Candidates with unique ids (useful for provider/ranking tests
 * that rely on id-based tie-breaking).
 * @param {Object} [options] - forwarded to candidateArb, plus:
 * @param {number} [options.minLength=1]
 * @param {number} [options.maxLength=8]
 */
export function candidatesArb(options = {}) {
  const { minLength = 1, maxLength = 8, ...candidateOptions } = options;
  return fc.uniqueArray(candidateArb(candidateOptions), {
    selector: (c) => c.id,
    minLength,
    maxLength,
  });
}
