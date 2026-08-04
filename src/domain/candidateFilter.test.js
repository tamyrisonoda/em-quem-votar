import { describe, it, expect } from 'vitest';
import { filterCandidates, IDEOLOGY_ALL } from './candidateFilter.js';

const candidates = [
  { id: 'a', name: 'Ana Prado', party: 'PVX', ideology: 'Esquerda' },
  { id: 'b', name: 'Bruno Lima', party: 'MDN', ideology: 'Centro' },
  { id: 'c', name: 'Célia Nôvoa', party: 'PVX', ideology: 'Direita' },
];

describe('filterCandidates', () => {
  it('returns the input set unchanged for empty query + "Todos"', () => {
    const result = filterCandidates(candidates, { query: '', ideology: IDEOLOGY_ALL });
    expect(result).toEqual(candidates);
    expect(result).not.toBe(candidates); // new array, no mutation
  });

  it('treats a whitespace-only query as no search constraint', () => {
    const result = filterCandidates(candidates, { query: '   ', ideology: IDEOLOGY_ALL });
    expect(result).toHaveLength(candidates.length);
  });

  it('matches name substrings case-insensitively', () => {
    const result = filterCandidates(candidates, { query: 'ANA' });
    expect(result.map((c) => c.id)).toEqual(['a']);
  });

  it('matches party substrings case-insensitively', () => {
    const result = filterCandidates(candidates, { query: 'pvx' });
    expect(result.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('folds accented/unicode characters', () => {
    const result = filterCandidates(candidates, { query: 'CÉLIA' });
    expect(result.map((c) => c.id)).toEqual(['c']);
  });

  it('applies the ideology constraint when not "Todos"', () => {
    const result = filterCandidates(candidates, { ideology: 'Direita' });
    expect(result.map((c) => c.id)).toEqual(['c']);
  });

  it('applies query AND ideology together', () => {
    const result = filterCandidates(candidates, { query: 'pvx', ideology: 'Esquerda' });
    expect(result.map((c) => c.id)).toEqual(['a']);
  });

  it('returns an empty array when nothing matches', () => {
    const result = filterCandidates(candidates, { query: 'zzz' });
    expect(result).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const snapshot = candidates.slice();
    filterCandidates(candidates, { query: 'ana', ideology: 'Centro' });
    expect(candidates).toEqual(snapshot);
  });
});
