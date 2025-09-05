import { Poset } from "./Poset";

/** Join/meet on a poset (when they exist on the carrier). */
export type Lattice<A> = Poset<A> & {
  join: (x:A,y:A)=>A; // x ⊔ y (least upper bound)
  meet: (x:A,y:A)=>A; // x ⊓ y (greatest lower bound)
};

export type BoundedLattice<A> = Lattice<A> & { top: A; bot: A };

/** Finite-complete lattice: all sups/infs for finite subsets, with explicit top/bot. */
export type CompleteLattice<A> = BoundedLattice<A> & {
  sup: (S:A[])=>A; // finite sup (we'll implement via scanning)
  inf: (S:A[])=>A; // finite inf
};

/** Build the boolean lattice P(U) (powerset) ordered by ⊆ on a finite U. */
export function powersetLattice<U>(univ: U[], eq: (x:U,y:U)=>boolean): CompleteLattice<U[]> {
  // enumerate all subsets
  const elems: U[][] = [];
  const n = univ.length;
  for (let mask=0; mask < (1<<n); mask++) {
    const s: U[] = [];
    for (let i=0;i<n;i++) if (mask & (1<<i)) s.push(univ[i]);
    elems.push(s);
  }
  const subset = (A:U[], B:U[]) => A.every(x => B.some(y=>eq(x,y)));
  const leq = subset;
  const eqSet = (A:U[],B:U[]) => subset(A,B) && subset(B,A);
  const bot: U[] = [];
  const top: U[] = univ.slice();
  const union = (A:U[],B:U[]) => {
    const out = A.slice();
    for (const b of B) if (!out.some(x=>eq(x,b))) out.push(b);
    return out;
  };
  const inter = (A:U[],B:U[]) => A.filter(a => B.some(b=>eq(a,b)));

  const sup = (S: U[][]) => S.reduce((acc, s) => union(acc,s), bot);
  const inf = (S: U[][]) => S.length ? S.reduce((acc,s)=> inter(acc,s), top) : top;

  return {
    elems, leq, eq: eqSet,
    join: union, meet: inter,
    top, bot, sup, inf,
    show: (s)=>`{${s.map(String).join(",")}}`
  };
}

/** Least fixed point in a finite complete lattice via iteration from ⊥. */
export function lfp<A>(L: CompleteLattice<A>, f: (a:A)=>A): A {
  // requiring f to be monotone is the usual premise—callers should ensure it.
  let cur = L.bot;
  for (let i=0;i<10000;i++) { // generous cap for safety
    const next = f(cur);
    if (L.eq(next as any, cur as any)) return cur;
    cur = next;
  }
  throw new Error("lfp: did not converge (check monotonicity or lattice size)");
}