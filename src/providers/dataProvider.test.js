// src/providers/dataProvider.test.js
//
// Sanity unit tests for the Data_Provider. Property-based scoping coverage
// (Design Property 2) is added separately in task 3.2.

import { describe, it, expect } from 'vitest';
import {
  getStates,
  getCandidatesByOffice,
  getCandidateById,
  getQuestions,
  getThemes,
  OFFICE_PRESIDENTE,
  OFFICE_GOVERNADOR,
} from './dataProvider.js';
import { candidates } from '../data/dataSource.js';
import { proposalThemes, quizThemes, states } from '../data/topics.js';
import { questions } from '../data/questions.js';

describe('getStates', () => {
  it('returns every selectable state', () => {
    expect(getStates().map((s) => s.uf)).toEqual(states.map((s) => s.uf));
  });

  it('returns a deeply frozen copy that does not alias the store', () => {
    const result = getStates();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
    expect(result).not.toBe(states);
    expect(result[0]).not.toBe(states[0]);
    expect(() => {
      result[0].uf = 'ZZ';
    }).toThrow();
    expect(states[0].uf).not.toBe('ZZ');
  });
});

describe('getCandidatesByOffice', () => {
  it('returns only Presidente candidates for the Presidente office', () => {
    const result = getCandidatesByOffice(OFFICE_PRESIDENTE);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.position === OFFICE_PRESIDENTE)).toBe(true);
  });

  it('scopes Governador candidates by UF when provided', () => {
    const result = getCandidatesByOffice(OFFICE_GOVERNADOR, 'SP');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.position === OFFICE_GOVERNADOR && c.state === 'SP')).toBe(true);
  });

  it('returns all Governador candidates when no UF is provided', () => {
    const all = candidates.filter((c) => c.position === OFFICE_GOVERNADOR);
    expect(getCandidatesByOffice(OFFICE_GOVERNADOR)).toHaveLength(all.length);
  });

  it('returns an empty list for a UF with no candidates', () => {
    expect(getCandidatesByOffice(OFFICE_GOVERNADOR, 'ZZ')).toEqual([]);
  });
});

describe('getCandidateById', () => {
  it('returns the matching candidate', () => {
    const known = candidates[0];
    expect(getCandidateById(known.id).id).toBe(known.id);
  });

  it('returns null for an unknown id without throwing', () => {
    expect(getCandidateById('does-not-exist')).toBeNull();
  });
});

describe('getQuestions', () => {
  it('returns every quiz question, deeply frozen', () => {
    const result = getQuestions();
    expect(result.map((q) => q.id)).toEqual(questions.map((q) => q.id));
    expect(Object.isFrozen(result[0].options[0])).toBe(true);
  });
});

describe('getThemes', () => {
  it('defaults to the quiz theme set', () => {
    expect(getThemes().map((t) => t.id)).toEqual(quizThemes.map((t) => t.id));
  });

  it('returns proposal themes when requested', () => {
    expect(getThemes('proposal').map((t) => t.id)).toEqual(proposalThemes.map((t) => t.id));
  });
});
