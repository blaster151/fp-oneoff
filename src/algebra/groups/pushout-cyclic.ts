import { Cyclic, Zmod, Z, CycHom } from "./cyclic";

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) { const t = a % b; a = b; b = t; }
  return a;
}
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

export interface CycPairGroup {
  M: Cyclic;
  N: Cyclic;
  // canonical representative of coset in (Z_m ⊕ Z_n)/<(u,-v)>
  norm(p: [Z, Z]): [Z, Z];
  add(p: [Z, Z], q: [Z, Z]): [Z, Z];
  neg(p: [Z, Z]): [Z, Z];
  eq(p: [Z, Z], q: [Z, Z]): boolean;
  id: [Z, Z];
  size: number;
  show?(p: [Z, Z]): string;
}

/**
 * Pushout of f: Z_k -> Z_m (1 |-> u) and g: Z_k -> Z_n (1 |-> v)
 * implemented as (Z_m ⊕ Z_n) / <(u,-v)>
 */
export function pushoutCyclic(
  f: CycHom, g: CycHom
): CycPairGroup {
  const M = f.dst, N = g.dst;
  const u = f.imgOfOne;                     // in Z_m
  const v = g.imgOfOne;                     // in Z_n

  // Order of (u,-v) in Z_m × Z_n
  const ord_u = M.n / gcd(M.n, u);
  const ord_v = N.n / gcd(N.n, v);
  const ord_h = lcm(ord_u, ord_v);

  // Reduction: subtract t*(u,-v) for t chosen to normalize first and/or second coordinate.
  // A simple canonicalization: reduce t mod ord_h so (a,b) -> (a - t*u, b + t*v) with t chosen
  // to make, say, the first coordinate lie in a fixed residue class among its orbit.
  // We'll pick the unique t in [0, ord_h-1] such that a - t*u is minimal nonnegative mod M.n
  // among that orbit (ties broken by making b canonical mod N.n after that adjustment).
  const norm = ([a0, b0]: [Z, Z]): [Z, Z] => {
    const mod = (x: number, n: number) => ((x % n) + n) % n;
    let best: [Z, Z] | null = null;

    const a_raw = mod(a0, M.n), b_raw = mod(b0, N.n);
    for (let t = 0; t < ord_h; t++) {
      const a = mod(a_raw - t * u, M.n);
      const b = mod(b_raw + t * v, N.n);
      if (best === null) { best = [a, b]; continue; }
      const [ba, bb] = best;
      // lexicographic tie-break
      if (a < ba || (a === ba && b < bb)) best = [a, b];
    }
    return best!;
  };

  const add = (p: [Z, Z], q: [Z, Z]): [Z, Z] =>
    norm([M.add(p[0], q[0]), N.add(p[1], q[1])]);

  const neg = (p: [Z, Z]): [Z, Z] =>
    norm([M.neg(p[0]), N.neg(p[1])]);

  const eq = (p: [Z, Z], q: [Z, Z]) => {
    const pn = norm(p), qn = norm(q);
    return pn[0] === qn[0] && pn[1] === qn[1];
  };

  // group size = (m*n)/ord_h
  const size = (M.n * N.n) / ord_h;

  return {
    M, N, norm, add, neg, eq,
    id: norm([M.id, N.id]),
    size,
    show: ([a, b]) => `[${a} mod ${M.n}, ${b} mod ${N.n}]`,
  };
}
