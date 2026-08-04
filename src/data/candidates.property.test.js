// Property-based test for the Candidate schema of the Data_Store.
//
// Validates: Requirements 13.2, 13.3, 13.4 (Design Property 18).
//
// The Data_Store `candidates` array is a FIXED, finite set (not generated), so
// the "property" is asserted by iterating over EVERY candidate and checking the
// schema invariant. The invariant is additionally wrapped in a fast-check
// property (>= 100 iterations) that samples candidates via fc.constantFrom, so
// the schema check is exercised across the whole set under fast-check's runner.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { candidates } from './candidates.js';
import { IDEOLOGIES, POSITION_KEYS } from '../test/generators.js';

const NUM_RUNS = 100;

const OFFICES = ['Presidente da República', 'Governador'];

// --- Schema assertion for a single Candidate --------------------------------
//
// Asserts every field required by the Candidate schema (design.md / Req 13.2),
// the numeric `positions` keys (Req 13.3), and the `finances` shape (Req 13.4).
function assertCandidateSchema(candidate) {
  expect(candidate).toBeTypeOf('object');
  expect(candidate).not.toBeNull();

  // id: non-empty string
  expect(candidate.id).toBeTypeOf('string');
  expect(candidate.id.length).toBeGreaterThan(0);

  // name / number / party: strings (Req 13.2)
  expect(candidate.name).toBeTypeOf('string');
  expect(candidate.number).toBeTypeOf('string');
  expect(candidate.party).toBeTypeOf('string');

  // position: one of the two offices
  expect(OFFICES).toContain(candidate.position);

  // state: string UF for Governador, null for Presidente
  if (candidate.position === 'Governador') {
    expect(candidate.state).toBeTypeOf('string');
    expect(candidate.state.length).toBeGreaterThan(0);
  } else {
    expect(candidate.state).toBeNull();
  }

  // ideology: one of the five ordered categories
  expect(IDEOLOGIES).toContain(candidate.ideology);

  // photo / bio: strings
  expect(candidate.photo).toBeTypeOf('string');
  expect(candidate.bio).toBeTypeOf('string');

  // education: array of {graduacao:string, universidade:string, ano:number}
  expect(Array.isArray(candidate.education)).toBe(true);
  candidate.education.forEach((entry) => {
    expect(entry.graduacao).toBeTypeOf('string');
    expect(entry.universidade).toBeTypeOf('string');
    expect(entry.ano).toBeTypeOf('number');
    expect(Number.isFinite(entry.ano)).toBe(true);
  });

  // proposals: array of {theme:string, text:string}
  expect(Array.isArray(candidate.proposals)).toBe(true);
  candidate.proposals.forEach((proposal) => {
    expect(proposal.theme).toBeTypeOf('string');
    expect(proposal.theme.length).toBeGreaterThan(0);
    expect(proposal.text).toBeTypeOf('string');
  });

  // finances: {total:number, sources:[{category:string, percentage:number}]} (Req 13.4)
  expect(candidate.finances).toBeTypeOf('object');
  expect(candidate.finances).not.toBeNull();
  expect(candidate.finances.total).toBeTypeOf('number');
  expect(Number.isFinite(candidate.finances.total)).toBe(true);
  expect(Array.isArray(candidate.finances.sources)).toBe(true);
  expect(candidate.finances.sources.length).toBeGreaterThan(0);
  candidate.finances.sources.forEach((source) => {
    expect(source.category).toBeTypeOf('string');
    expect(source.category.length).toBeGreaterThan(0);
    expect(source.percentage).toBeTypeOf('number');
    expect(Number.isFinite(source.percentage)).toBe(true);
  });

  // history: array of {year:number, event:string}
  expect(Array.isArray(candidate.history)).toBe(true);
  candidate.history.forEach((entry) => {
    expect(entry.year).toBeTypeOf('number');
    expect(Number.isFinite(entry.year)).toBe(true);
    expect(entry.event).toBeTypeOf('string');
  });

  // positions: numeric keys economia/estado/seguranca/meioAmbiente/educacao,
  // each a number and (per design) an integer in 1..5 (Req 13.3)
  expect(candidate.positions).toBeTypeOf('object');
  expect(candidate.positions).not.toBeNull();
  POSITION_KEYS.forEach((key) => {
    const weight = candidate.positions[key];
    expect(weight).toBeTypeOf('number');
    expect(Number.isInteger(weight)).toBe(true);
    expect(weight).toBeGreaterThanOrEqual(1);
    expect(weight).toBeLessThanOrEqual(5);
  });
}

describe('Data_Store candidates — Property 18: conform to the Candidate schema', () => {
  // Feature: em-quem-votar, Property 18: Every candidate conforms to the Candidate schema
  it('every candidate in the Data_Store conforms to the Candidate schema (direct iteration)', () => {
    expect(candidates.length).toBeGreaterThan(0);
    candidates.forEach((candidate) => assertCandidateSchema(candidate));
  });

  // Feature: em-quem-votar, Property 18: Every candidate conforms to the Candidate schema
  it('holds for any sampled candidate (fast-check, >= 100 iterations)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...candidates), (candidate) => {
        assertCandidateSchema(candidate);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
