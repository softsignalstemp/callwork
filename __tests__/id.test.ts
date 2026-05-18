import { generateId } from '../src/utils/id';

describe('generateId', () => {
  it('restituisce una stringa non vuota', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('genera ID unici su chiamate ravvicinate', () => {
    const ids = Array.from({ length: 1000 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(1000);
  });

  it('contiene il separatore atteso', () => {
    expect(generateId()).toContain('-');
  });
});
