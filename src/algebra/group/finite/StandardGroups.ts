// StandardGroups.ts
import type { CayleyTable } from "../iso/CanonicalTable";

/** Klein four-group V4: elements 0..3 with table encoding Z2 × Z2. */
export function V4(): CayleyTable {
  // group law: componentwise XOR on pairs (0=00,1=01,2=10,3=11)
  const op = (a: number, b: number) => a ^ b;
  const n = 4; const t: CayleyTable = Array.from({ length: n }, () => Array(n).fill(0));
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) t[a]![b] = op(a, b);
  return t;
}

/** Cyclic group C_n as addition mod n. */
export function Cn(n: number): CayleyTable {
  const t: CayleyTable = Array.from({ length: n }, () => Array(n).fill(0));
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) t[a]![b] = (a + b) % n;
  return t;
}