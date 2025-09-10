import { FiniteGroup } from "./core";

// Cyclic group (Z_n, +)
export function Zn(n: number): FiniteGroup<number> {
  const norm = (x: number) => ((x % n) + n) % n;
  const E: number[] = Array.from({ length: n }, (_, i) => i);
  return {
    elems: E,
    id: 0,
    op: (a: number, b: number) => norm(a + b),
    inv: (a: number) => norm(-a),
    eq: (a: number, b: number) => a === b,
    show: (a: number) => String(a),
  };
}
