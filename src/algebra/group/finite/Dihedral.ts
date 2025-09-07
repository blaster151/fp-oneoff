// Dihedral.ts
// Finite dihedral group D_n of order 2n: symmetries of a regular n-gon.
// Elements encoded as pairs (i, f) where i in 0..n-1 is rotation power r^i,
// and f in {0,1} marks flip (0=no flip, 1=flip).
// Multiplication rules (with i,j mod n):
//   (i,0)·(j,0) = (i+j, 0)
//   (i,0)·(j,1) = (i+j, 1)
//   (i,1)·(j,0) = (i-j, 1)
//   (i,1)·(j,1) = (i-j, 0)

import type { CayleyTable } from "../iso/CanonicalTable";

export function Dn(n: number): CayleyTable {
  if (n < 3) throw new Error("Dn requires n>=3");
  const N = 2 * n;
  const idx = (i: number, f: number) => i + (f ? n : 0); // pack (i,f) -> 0..2n-1
  const unpack = (a: number) => (a < n ? [a, 0] as const : [a - n, 1] as const);

  const t: CayleyTable = Array.from({ length: N }, () => Array(N).fill(0));

  for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
    const [i, fa] = unpack(a);
    const [j, fb] = unpack(b);

    let k: number, f: number;
    if (fa === 0 && fb === 0) { k = (i + j) % n; f = 0; }
    else if (fa === 0 && fb === 1) { k = (i + j) % n; f = 1; }
    else if (fa === 1 && fb === 0) { k = (i - j + n) % n; f = 1; }
    else /* fa=1, fb=1 */      { k = (i - j + n) % n; f = 0; }

    t[a][b] = idx(k, f);
  }
  return t;
}