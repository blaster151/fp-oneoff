/** Basic finite group structure */
export interface FiniteGroup<T> {
  elems: T[];
  eq: (a: T, b: T) => boolean;
  op: (a: T, b: T) => T;
  id: T;
  inv: (a: T) => T;
}

/** Cyclic group Z/nZ */
export function Zn(n: number): FiniteGroup<number> {
  const elems = Array.from({ length: n }, (_, i) => i);
  
  return {
    elems,
    eq: (a, b) => a === b,
    op: (a, b) => (a + b) % n,
    id: 0,
    inv: (a) => (n - a) % n
  };
}