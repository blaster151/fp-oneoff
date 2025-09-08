import type { Group } from "./Group";

// Build the Cayley table as a 2D matrix indexed by element positions.
export function cayleyTable<A>(G: Group<A>): A[][] {
  if (!G.elements) throw new Error("finite elements required");
  const n = G.elements.length;
  const tbl: A[][] = Array.from({ length: n }, () => Array<A>(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      tbl[i][j] = G.op(G.elements[i], G.elements[j]);
    }
  }
  return tbl;
}

// Does there exist a relabeling (permutation of indices) that makes two tables identical?
export function isSameTableUpToRename<A, B>(GA: Group<A>, GB: Group<B>): boolean {
  if (!GA.elements || !GB.elements) return false;
  const a = cayleyTable(GA);
  const b = cayleyTable(GB);
  const n = GA.elements.length;
  if (n !== GB.elements.length) return false;

  // Try all permutations for small n; (for larger n, you'd use a smarter search)
  const idx = Array.from({ length: n }, (_, i) => i);
  function nextPerm(p: number[]) {
    // Heap's algorithm would be better; here is a simple lexicographic next-permutation:
    let i = n - 2;
    while (i >= 0 && p[i] > p[i + 1]) i--;
    if (i < 0) return false;
    let j = n - 1;
    while (p[j] < p[i]) j--;
    [p[i], p[j]] = [p[j], p[i]];
    let l = i + 1, r = n - 1;
    while (l < r) { [p[l], p[r]] = [p[r], p[l]]; l++; r--; }
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
        const resultA = a[i][j];
        const resultB = b[perm[i]][perm[j]];
        
        // Find the positions of these results in their respective groups
        const posA = GA.elements.indexOf(resultA);
        const posB = GB.elements.indexOf(resultB);
        
        // The results should map to the same position under the permutation
        if (posA !== perm[posB]) {
          ok = false;
          break;
        }
      }
    }
    if (ok) return true;
  } while (nextPerm(perm));

  return false;
}