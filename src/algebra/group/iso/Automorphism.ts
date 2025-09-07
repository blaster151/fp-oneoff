// Automorphism.ts
import { CayleyTable, relabel } from "./CanonicalTable";

export type Perm = number[]; // p[i] = image of i

export function composePerm(p: Perm, q: Perm): Perm {
  // (p ∘ q)(i) = p[q[i]]
  const n = p.length, r = new Array(n);
  for (let i = 0; i < n; i++) r[i] = p[q[i]!]!;
  return r;
}
export function idPerm(n: number): Perm { return Array.from({length:n}, (_,i)=>i); }
export function eqPerm(p: Perm, q: Perm): boolean {
  if (p.length !== q.length) return false;
  for (let i=0;i<p.length;i++) if (p[i]!==q[i]) return false;
  return true;
}

/** Brute force: enumerate all permutations (n ≤ ~8 recommended). */
function* permutations(n: number): Generator<Perm> {
  const a = Array.from({ length: n }, (_, i) => i);
  function* heap(k: number): Generator<Perm> {
    if (k === 1) { yield a.slice(); return; }
    yield* heap(k - 1);
    for (let i = 0; i < k - 1; i++) {
      if (k % 2 === 0) [a[i], a[k - 1]] = [a[k - 1]!, a[i]!];
      else [a[0], a[k - 1]] = [a[k - 1]!, a[0]!];
      yield* heap(k - 1);
    }
  }
  yield* heap(n);
}

/** All automorphisms as permutations p with relabel(table,p) = table. */
export function automorphisms(table: CayleyTable): Perm[] {
  const n = table.length;
  const autos: Perm[] = [];
  for (const p of permutations(n)) {
    const t2 = relabel(table, p);
    // test equality
    let ok = true;
    outer: for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) if (t2[i]![j] !== table[i]![j]) { ok = false; break outer; }
    }
    if (ok) autos.push(p);
  }
  return autos;
}

/** Build a Cayley table for the automorphism group (composition of permutations). */
export function autGroupTable(autos: Perm[]): CayleyTable {
  const m = autos.length;
  const t: CayleyTable = Array.from({ length: m }, () => Array(m).fill(0));

  // index each perm
  const key = (p: Perm) => p.join(",");
  const idx = new Map<string, number>();
  autos.forEach((p, i) => idx.set(key(p), i));

  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
    const r = composePerm(autos[i]!, autos[j]!); // i ∘ j
    const k = idx.get(key(r));
    if (k === undefined) throw new Error("closure failed: not a subgroup? (bug)");
    t[i]![j] = k;
  }
  return t;
}