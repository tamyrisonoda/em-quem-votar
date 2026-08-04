import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  IDEOLOGIES,
  OFFICES,
  QUIZ_THEMES,
  PROPOSAL_THEMES,
  POSITION_KEYS,
  UFS,
  scaleValueArb,
  searchQueryArb,
  positionsArb,
  answerOptionArb,
  questionArb,
  questionsArb,
  answersArb,
  answersForQuestionsArb,
  financeSourceArb,
  financesArb,
  historyEntryArb,
  educationEntryArb,
  proposalArb,
  candidateArb,
  candidatesArb,
} from './generators.js';

// Self-check: sample each arbitrary and assert it produces structurally valid
// values matching the design.md data models. These are not property tests for
// production code — they guard the shared generators themselves.

const isInt = (n, min, max) =>
  Number.isInteger(n) && n >= min && n <= max;

describe('generators self-check', () => {
  it('scaleValueArb yields integers 1..5', () => {
    fc.assert(
      fc.property(scaleValueArb, (v) => isInt(v, 1, 5)),
    );
  });

  it('searchQueryArb yields strings', () => {
    fc.assert(
      fc.property(searchQueryArb, (q) => typeof q === 'string'),
    );
  });

  it('positionsArb yields all five keys as integers 1..5', () => {
    fc.assert(
      fc.property(positionsArb(), (p) => {
        for (const key of POSITION_KEYS) {
          if (!isInt(p[key], 1, 5)) return false;
        }
        return Object.keys(p).length === POSITION_KEYS.length;
      }),
    );
  });

  it('answerOptionArb yields {id,label,value} with value 1..5', () => {
    fc.assert(
      fc.property(answerOptionArb(), (o) =>
        typeof o.id === 'string' &&
        typeof o.label === 'string' &&
        isInt(o.value, 1, 5),
      ),
    );
  });

  it('answerOptionArb honours a fixed value', () => {
    fc.assert(
      fc.property(answerOptionArb({ value: 3 }), (o) => o.value === 3),
    );
  });

  it('questionArb yields a quiz-theme question with >=2 options', () => {
    fc.assert(
      fc.property(questionArb(), (q) =>
        typeof q.id === 'string' &&
        QUIZ_THEMES.includes(q.theme) &&
        typeof q.text === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2,
      ),
    );
  });

  it('questionArb honours a fixed theme', () => {
    fc.assert(
      fc.property(questionArb({ theme: 'economia' }), (q) => q.theme === 'economia'),
    );
  });

  it('questionsArb yields unique ids', () => {
    fc.assert(
      fc.property(questionsArb({ maxLength: 6 }), (qs) => {
        const ids = qs.map((q) => q.id);
        return new Set(ids).size === ids.length;
      }),
    );
  });

  it('answersArb yields a questionId -> (1..5) map', () => {
    fc.assert(
      fc.property(answersArb, (answers) =>
        Object.values(answers).every((v) => isInt(v, 1, 5)),
      ),
    );
  });

  it('answersForQuestionsArb answers every question with a valid option value', () => {
    fc.assert(
      fc.property(
        questionsArb({ minLength: 1, maxLength: 6 }).chain((questions) =>
          fc.tuple(fc.constant(questions), answersForQuestionsArb(questions)),
        ),
        ([questions, answers]) =>
          questions.every((q) => {
            const chosen = answers[q.id];
            return q.options.some((o) => o.value === chosen);
          }),
      ),
    );
  });

  it('financeSourceArb yields {category, percentage 0..100}', () => {
    fc.assert(
      fc.property(financeSourceArb, (s) =>
        typeof s.category === 'string' && isInt(s.percentage, 0, 100),
      ),
    );
  });

  it('financesArb yields {total>=0, non-empty sources}', () => {
    fc.assert(
      fc.property(financesArb, (f) =>
        typeof f.total === 'number' &&
        f.total >= 0 &&
        Array.isArray(f.sources) &&
        f.sources.length >= 1,
      ),
    );
  });

  it('historyEntryArb yields {year, event}', () => {
    fc.assert(
      fc.property(historyEntryArb, (h) =>
        Number.isInteger(h.year) && typeof h.event === 'string',
      ),
    );
  });

  it('educationEntryArb yields {graduacao, universidade, ano}', () => {
    fc.assert(
      fc.property(educationEntryArb, (e) =>
        typeof e.graduacao === 'string' &&
        typeof e.universidade === 'string' &&
        Number.isInteger(e.ano),
      ),
    );
  });

  it('proposalArb yields a proposal-theme entry', () => {
    fc.assert(
      fc.property(proposalArb, (p) =>
        PROPOSAL_THEMES.includes(p.theme) && typeof p.text === 'string',
      ),
    );
  });

  it('candidateArb yields a schema-conformant candidate', () => {
    fc.assert(
      fc.property(candidateArb(), (c) => {
        const baseOk =
          typeof c.id === 'string' &&
          typeof c.name === 'string' &&
          typeof c.number === 'string' &&
          typeof c.party === 'string' &&
          OFFICES.includes(c.position) &&
          IDEOLOGIES.includes(c.ideology) &&
          typeof c.photo === 'string' &&
          typeof c.bio === 'string' &&
          Array.isArray(c.education) &&
          Array.isArray(c.proposals) &&
          Array.isArray(c.history) &&
          POSITION_KEYS.every((k) => isInt(c.positions[k], 1, 5));
        // State is a UF for Governador and null for Presidente.
        const stateOk =
          c.position === 'Governador'
            ? UFS.includes(c.state)
            : c.state === null;
        return baseOk && stateOk;
      }),
    );
  });

  it('candidateArb honours fixed office/ideology/state', () => {
    fc.assert(
      fc.property(
        candidateArb({ office: 'Governador', ideology: 'Centro', state: 'SP' }),
        (c) =>
          c.position === 'Governador' &&
          c.ideology === 'Centro' &&
          c.state === 'SP',
      ),
    );
  });

  it('candidatesArb yields unique candidate ids', () => {
    fc.assert(
      fc.property(candidatesArb({ maxLength: 6 }), (cs) => {
        const ids = cs.map((c) => c.id);
        return new Set(ids).size === ids.length;
      }),
    );
  });
});
