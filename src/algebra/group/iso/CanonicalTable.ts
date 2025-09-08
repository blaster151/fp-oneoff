// CanonicalTable.ts
// Finite-group canonicalization: "same up to relabeling" -> same canonical key.

export type ElemId = number; // 0..n-1
export type CayleyTable = number[][]; // table[a][b] = c with 0..n-1 indices

/** Basic sanity: table is n×n, entries in [0..n-1], each row/col is a permutation. */
export function isLatinSquare(table: CayleyTable): boolean {
  const n = table.length;
  for (const row of table) if (row.length !== n) return false;
  for (let i = 0; i < n; i++) {
    const seenRow = new Set<number>();
    const seenCol = new Set<number>();
    for (let j = 0; j < n; j++) {
      const r = table[i]?.[j];
      const c = table[j]?.[i];
      if (r === undefined || c === undefined || r < 0 || r >= n || c < 0 || c >= n) return false;
      seenRow.add(r);
      seenCol.add(c);
    }
    if (seenRow.size !== n || seenCol.size !== n) return false;
  }
  return true;
}

/** Serialize a table into a compact canonical string. */
function serialize(table: CayleyTable): string {
  return table.map(row => row.join(",")).join("|");
}

/** Apply a permutation p to relabel elements: p: oldId -> newId. */
export function relabel(table: CayleyTable, p: number[]): CayleyTable {
  const n = table.length;
  const inv: number[] = Array(n);
  for (let i = 0; i < n; i++) {
    const pi = p[i];
    if (pi !== undefined) inv[pi] = i;
  }
  const out: CayleyTable = Array.from({ length: n }, () => Array(n).fill(0));
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++) {
      const c = table[a]?.[b];
      const pa = p[a];
      const pb = p[b];
      const pc = c !== undefined ? p[c] : undefined;
      if (pa !== undefined && pb !== undefined && pc !== undefined) {
        const outRow = out[pa];
        if (outRow) outRow[pb] = pc;
      }
    }
  return out;
}

/** Enumerate all permutations of size n (n <= ~8 recommended). */
function* permutations(n: number): Generator<number[]> {
  const a = Array.from({ length: n }, (_, i) => i);
  function* heap(k: number): Generator<number[]> {
    if (k === 1) { yield a.slice(); return; }
    yield* heap(k - 1);
    for (let i = 0; i < k - 1; i++) {
      const ai = a[i];
      const ak1 = a[k - 1];
      const a0 = a[0];
      if (ai !== undefined && ak1 !== undefined && a0 !== undefined) {
        if (k % 2 === 0) [a[i], a[k - 1]] = [ak1, ai];
        else [a[0], a[k - 1]] = [ak1, a0];
      }
      yield* heap(k - 1);
    }
  }
  yield* heap(n);
}

/**
 * Compute a canonical key: the lexicographically smallest serialization over all relabelings.
 * WARNING: factorial-time; fine for n<=8. For larger groups, use invariants or provided witnesses.
 */
export function canonicalKey(table: CayleyTable): string {
  const n = table.length;
  let best: string | null = null;
  for (const p of permutations(n)) {
    const t = relabel(table, p);
    const s = serialize(t);
    if (best === null || s < best) best = s;
  }
  return best!;
}