import { FiniteGroup } from "./core";

// Cyclic group (Z_n, +)
export function Zn(n: number): FiniteGroup<number> {
  const norm = (x: number) => ((x % n) + n) % n;
  const E = Array.from({ length: n }, (_, i) => i);
  return {
    elements: E,
    id: 0,
    op: (a, b) => norm(a + b),
    inv: (a) => norm(-a),
    eq: (a, b) => a === b,
    show: (a) => String(a)
  };
}