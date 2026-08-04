import { describe, it, expect } from 'vitest';
import { candidates } from './candidates.js';

/**
 * Data-content smoke test for the Data_Store (Task 2.5).
 *
 * Asserts the fictional candidate dataset satisfies:
 *  - Req 13.1: at least five candidate records are provided.
 *  - Req 13.6: the data is fictional only — no real politicians' names or
 *    real party acronyms are presented as real.
 */

// Well-known REAL Brazilian politician surnames/full names. The dataset must
// not contain any of these. Kept lowercase for case-insensitive comparison.
const REAL_POLITICIAN_NAMES = [
  'lula',
  'bolsonaro',
  'dilma',
  'temer',
  'ciro',
  'marina silva',
  'haddad',
  'alckmin',
  'doria',
];

// Well-known REAL Brazilian party acronyms/names. The invented parties in the
// dataset (PMS, PDR, MDN, PLN, UNP) are intentionally NOT in this list.
const REAL_PARTIES = [
  'pt',
  'pl',
  'psdb',
  'mdb',
  'pdt',
  'psol',
  'pp',
  'união brasil',
  'uniao brasil',
  'republicanos',
  'psb',
  'pcdob',
  'pc do b',
];

const norm = (value) => String(value).trim().toLowerCase();

describe('candidates Data_Store — content smoke test', () => {
  it('provides at least five candidate records (Req 13.1)', () => {
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBeGreaterThanOrEqual(5);
  });

  it('contains only fictional candidate names — no real politicians (Req 13.6)', () => {
    for (const candidate of candidates) {
      const name = norm(candidate.name);
      for (const real of REAL_POLITICIAN_NAMES) {
        expect(
          name.includes(real),
          `Candidate name "${candidate.name}" matches real politician marker "${real}"`,
        ).toBe(false);
      }
    }
  });

  it('contains only invented party acronyms — no real parties (Req 13.6)', () => {
    for (const candidate of candidates) {
      const party = norm(candidate.party);
      // exact-match against the denylist so invented acronyms (PMS, PDR, MDN,
      // PLN, UNP) are never flagged by an accidental substring collision.
      expect(
        REAL_PARTIES.includes(party),
        `Candidate party "${candidate.party}" matches a real party acronym`,
      ).toBe(false);
    }
  });

  it('uses unique candidate ids', () => {
    const ids = candidates.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every candidate the demonstrative-friendly invented shape', () => {
    for (const candidate of candidates) {
      expect(typeof candidate.id).toBe('string');
      expect(candidate.id.length).toBeGreaterThan(0);
      expect(typeof candidate.name).toBe('string');
      expect(candidate.name.length).toBeGreaterThan(0);
      expect(typeof candidate.party).toBe('string');
      expect(candidate.party.length).toBeGreaterThan(0);
      expect(['Presidente da República', 'Governador']).toContain(candidate.position);
    }
  });
});
