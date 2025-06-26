import { describe, it, expect } from 'vitest';
import { generatePairs, pairKey, progressPercent, Pair } from './utils';

describe('generatePairs', () => {
  it('returns all unique pairs for 3 items', () => {
    const pairs = generatePairs([1, 2, 3]);
    const expected: Pair[] = [
      [1, 2],
      [1, 3],
      [2, 3],
    ];
    // Sort for comparison since generatePairs shuffles
    const toKey = (p: Pair) => p.slice().sort((a, b) => a - b).join('-');
    expect(pairs.map(toKey).sort()).toEqual(expected.map(toKey).sort());
  });

  it('returns empty array for less than 2 items', () => {
    expect(generatePairs([])).toEqual([]);
    expect(generatePairs([1])).toEqual([]);
  });
});

describe('pairKey', () => {
  it('is order-independent', () => {
    expect(pairKey([1, 2])).toBe(pairKey([2, 1]));
    expect(pairKey([3, 5])).toBe('3-5');
    expect(pairKey([5, 3])).toBe('3-5');
  });
});

describe('progressPercent', () => {
  it('returns 0 if no pairs', () => {
    expect(progressPercent(new Set(), [])).toBe(0);
  });

  it('returns correct percent as pairs are compared', () => {
    const items = [1, 2, 3, 4];
    const pairs = generatePairs(items);
    const set = new Set<string>();
    expect(progressPercent(set, pairs)).toBe(0);
    set.add(pairKey([1, 2]));
    expect(progressPercent(set, pairs)).toBe(Math.round((1 / pairs.length) * 100));
    set.add(pairKey([2, 3]));
    expect(progressPercent(set, pairs)).toBe(Math.round((2 / pairs.length) * 100));
    // Complete all pairs
    pairs.forEach(p => set.add(pairKey(p)));
    expect(progressPercent(set, pairs)).toBe(100);
  });
}); 