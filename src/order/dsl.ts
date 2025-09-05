import { Poset, posetEqFromLeq } from "./Poset";
import { Lattice, BoundedLattice, CompleteLattice } from "./Lattice";

/** Build a finite poset from a set of elements + a list of ≤ pairs; closes reflexive/transitive hull. */
export function posetFromPairs<A>(
  elems: A[],
  leqPairs: Array<[A,A]>,
  eqA: (x:A,y:A) => boolean
): Poset<A> {
  const n = elems.length;
  const leqMat: boolean[][] = Array.from({length:n},()=>Array(n).fill(false));
  const idx = (a:A) => elems.findIndex(x=>eqA(x,a));
  for (let i=0;i<n;i++) leqMat[i][i]=true;
  for (const [a,b] of leqPairs){ const i=idx(a), j=idx(b); if(i<0||j<0) throw new Error("pair element not in elems"); leqMat[i][j]=true; }
  // transitive closure (Floyd–Warshall)
  for (let k=0;k<n;k++) for (let i=0;i<n;i++) if (leqMat[i][k]) for (let j=0;j<n;j++) if (leqMat[k][j]) leqMat[i][j]=true;
  const leq = (a:A,b:A)=> leqMat[idx(a)][idx(b)];
  const eq  = (a:A,b:A)=> leq(a,b) && leq(b,a);
  return { elems, leq, eq, show: (a)=>String(a) };
}

/** Build a **subset** poset quickly: P(U) with ⊆ (same as powerset, but via DSL). */
export function subsetPoset<U>(univ: U[], eqU: (x:U,y:U)=>boolean) {
  // enumerate all subsets
  const n = univ.length;
  const subsets: U[][] = [];
  for (let mask=0; mask<(1<<n); mask++){
    const s: U[] = []; for (let i=0;i<n;i++) if (mask&(1<<i)) s.push(univ[i]);
    subsets.push(s);
  }
  const leq = (A:U[],B:U[]) => A.every(x => B.some(y=>eqU(x,y)));
  const eq  = (A:U[],B:U[]) => leq(A,B) && leq(B,A);
  return { elems: subsets, leq, eq } as Poset<U[]>;
}

/** Given a finite poset, derive join/meet when they exist by scanning all upper/lower bounds. */
export function latticeFromPoset<A>(P: Poset<A>): BoundedLattice<A> {
  const { elems, leq } = P;
  // compute top and bot as unique max/min if present
  const mins = elems.filter(a => elems.every(b => !(!P.eq(a,b) && leq(b,a))));
  const maxs = elems.filter(a => elems.every(b => !(!P.eq(a,b) && leq(a,b))));
  if (mins.length !== 1 || maxs.length !== 1) throw new Error("latticeFromPoset: need unique ⊥ and ⊤");
  const bot = mins[0], top = maxs[0];

  function join(x:A,y:A): A {
    const uppers = elems.filter(u => leq(x,u) && leq(y,u));
    // pick minimal among uppers
    const mins = uppers.filter(u => uppers.every(v => !(P.leq(v,u) && !P.eq(u,v))));
    if (mins.length!==1) throw new Error("join not unique");
    return mins[0];
  }

  function meet(x:A,y:A): A {
    const lowers = elems.filter(u => leq(u,x) && leq(u,y));
    const maxs = lowers.filter(u => lowers.every(v => !(P.leq(u,v) && !P.eq(u,v))));
    if (maxs.length!==1) throw new Error("meet not unique");
    return maxs[0];
  }

  return { ...P, bot, top, join, meet };
}

/** Upgrade to a CompleteLattice by providing finite sup/inf via joins/meets scans. */
export function completeFromBounded<A>(L: BoundedLattice<A>): CompleteLattice<A> {
  const sup = (S:A[]) => {
    if (S.length===0) return L.bot;
    return S.reduce((acc,x)=> L.join(acc,x));
  };
  const inf = (S:A[]) => {
    if (S.length===0) return L.top;
    return S.reduce((acc,x)=> L.meet(acc,x));
  };
  return { ...L, sup, inf };
}

/** Shortcuts for common tiny lattices. */
export const Tiny = {
  boolean: (n:number) => subsetPoset(Array.from({length:n},(_,i)=>i), (a,b)=>a===b),
  threeChain: () => posetFromPairs([0,1,2], [[0,1],[1,2]], (a,b)=>a===b),
};