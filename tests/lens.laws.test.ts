import { describe, it, expect } from 'vitest';
import { lens, propLens, checkLensLaws, fstLens, view, over, setL } from '../src/types/catkit-optics';

type Person = { name: string; age: number };

describe('Lens laws (smoke)', () => {
  it('propLens("age") satisfies get-set, set-get, set-set', () => {
    const ageL = propLens<Person, 'age', number>('age');
    const p: Person = { name: 'A', age: 40 };
    const report = checkLensLaws(ageL as any, p, 41, 42);
    expect(report).toEqual({ getSet: true, setGet: true, setSet: true });

    // extra sanity
    expect(view(ageL as any, p)).toBe(40);
    expect((setL(ageL as any, 10)(p) as Person).age).toBe(10);
    expect((over(ageL as any, (n: number) => n + 1)(p) as Person).age).toBe(41);
  });

  it('fstLens() focuses first element', () => {
    const L = fstLens<number, string>();
    const pair: [number, string] = [1, 'x'];
    expect(view(L as any, pair)).toBe(1);
    expect(setL(L as any, 5)(pair)).toEqual([5, 'x']);
  });
});