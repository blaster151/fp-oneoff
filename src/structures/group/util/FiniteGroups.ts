import { FiniteGroup } from "../Group";

export function Zn(n: number): FiniteGroup<number> {
  const elements = Array.from({ length: n }, (_, i) => i);
  return {
    elements,
    eq: (a, b) => a === b,
    op: (a, b) => (a + b) % n,
    id: 0,
    inv: (a) => (n - a) % n
  };
}

export const Z2 = Zn(2);
export const Z3 = Zn(3);
export const Z4 = Zn(4);
export const Z8 = Zn(8);