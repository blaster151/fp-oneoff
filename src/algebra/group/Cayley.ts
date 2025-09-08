import type { FiniteGroup } from "./Group";

// Build the Cayley table as a 2D matrix indexed by element positions.
export function cayleyTable<A>(G: FiniteGroup<A>): A[][] {
  const n = G.elems.length;
  const tbl: A[][] = Array.from({ length: n }, () => Array<A>(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ei = G.elems[i];
      const ej = G.elems[j];
      if (ei !== undefined && ej !== undefined) {
        tbl[i]![j] = G.op(ei, ej);
      }
    }
  }
  return tbl;
}

// Does there exist a relabeling (permutation of indices) that makes two tables identical?
export function isSameTableUpToRename<A, B>(GA: FiniteGroup<A>, GB: FiniteGroup<B>): boolean {
  const a = cayleyTable(GA);
  const b = cayleyTable(GB);
  const n = GA.elems.length;
  if (n !== GB.elems.length) return false;

  // Try all permutations for small n; (for larger n, you'd use a smarter search)
  const idx = Array.from({ length: n }, (_, i) => i);
  function nextPerm(p: number[]) {
    // Heap's algorithm would be better; here is a simple lexicographic next-permutation:
    let i = n - 2;
    while (i >= 0 && (p[i] ?? 0) > (p[i + 1] ?? 0)) i--;
    if (i < 0) return false;
    let j = n - 1;
    const pi = p[i];
    if (pi === undefined) return false;
    while ((p[j] ?? 0) < pi) j--;
    const pj = p[j];
    if (pj === undefined) return false;
    [p[i], p[j]] = [pj, pi];
    let l = i + 1, r = n - 1;
    while (l < r) { 
      const pl = p[l];
      const pr = p[r];
      if (pl !== undefined && pr !== undefined) {
        [p[l], p[r]] = [pr, pl]; 
      }
      l++; 
      r--; 
    }
    return true;
  }

  const perm = idx.slice();
  do {
    let ok = true;
    for (let i = 0; ok && i < n; i++) {
      for (let j = 0; ok && j < n; j++) {
        // Compare a[i][j] renamed equals b[perm[i]][perm[j]]
        // We need to check if the result of a[i][j] maps to the same position
        // as the result of b[perm[i]][perm[j]] under the permutation
        const resultA = a[i]?.[j];
        const piPerm = perm[i];
        const pjPerm = perm[j];
        const resultB = piPerm !== undefined && pjPerm !== undefined ? b[piPerm]?.[pjPerm] : undefined;
        
        // Find the positions of these results in their respective groups
        if (resultA === undefined || resultB === undefined) {
          ok = false;
          break;
        }
        const posA = GA.elems.indexOf(resultA);
        const posB = GB.elems.indexOf(resultB);
        
        // The results should map to the same position under the permutation
        const permPosB = perm[posB];
        if (posA !== permPosB) {
          ok = false;
          break;
        }
      }
    }
    if (ok) return true;
  } while (nextPerm(perm));

  return false;
}