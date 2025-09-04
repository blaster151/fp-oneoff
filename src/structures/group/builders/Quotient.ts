import { FiniteGroup, GroupHom } from "../Isomorphism";
import { isSubgroup } from "../Subgroup";

/** Decide membership in a finite subgroup by carrier + eq. */
function inSubgroup<A>(S: FiniteGroup<A>, a: A): boolean {
  return S.elems.some(x => S.eq(x, a));
}

/** Check normality: g * n * g^{-1} ∈ N for all g∈G, n∈N. */
export function isNormalSubgroup<A>(G: FiniteGroup<A>, N: FiniteGroup<A>): boolean {
  if (!isSubgroup(G, N)) return false;
  for (const g of G.elems) {
    for (const n of N.elems) {
      const conj = G.op(G.op(g, n), G.inv(g));
      if (!inSubgroup(N, conj)) return false;
    }
  }
  return true;
}

/** Build all left cosets aN = { a*n | n∈N } with a chosen canon rep. */
function leftCoset<A>(G: FiniteGroup<A>, N: FiniteGroup<A>, a: A): A[] {
  return N.elems.map(n => G.op(a, n));
}

/** Equality of cosets: aN = bN  ⇔  a*b^{-1} ∈ N. */
function sameCosetRep<A>(G: FiniteGroup<A>, N: FiniteGroup<A>, a: A, b: A): boolean {
  const rel = G.op(a, G.inv(b));
  return inSubgroup(N, rel);
}

/** Enumerate distinct left cosets with chosen reps (first-seen). */
function enumerateCosets<A>(G: FiniteGroup<A>, N: FiniteGroup<A>): { rep: A; elems: A[] }[] {
  const reps: A[] = [];
  for (const a of G.elems) {
    if (!reps.some(r => sameCosetRep(G, N, a, r))) reps.push(a);
  }
  return reps.map(rep => ({ rep, elems: leftCoset(G, N, rep) }));
}

export interface Quotient<A> extends FiniteGroup<{ rep: A }> {
  /** All cosets with their chosen representatives and element lists (debug aid). */
  cosets: { rep: A; elems: A[] }[];
}

/** Finite quotient group G/N (left cosets). Requires N ▹ G. */
export function quotientGroup<A>(G: FiniteGroup<A>, N: FiniteGroup<A>): Quotient<A> {
  if (!isNormalSubgroup(G, N)) throw new Error("quotientGroup: N is not normal in G");

  const cosets = enumerateCosets(G, N);

  // helper: find coset containing a
  const containing = (a: A) =>
    cosets.find(c => c.elems.some(x => G.eq(x, a)))!;

  const elems = cosets.map(c => ({ rep: c.rep }));

  const eq = (x: { rep: A }, y: { rep: A }) => sameCosetRep(G, N, x.rep, y.rep);

  const op = (x: { rep: A }, y: { rep: A }) => {
    const prod = G.op(x.rep, y.rep);
    const c = containing(prod);
    return { rep: c.rep };
    // well-defined because N is normal
  };

  const id = { rep: containing(G.id).rep };

  const inv = (x: { rep: A }) => {
    const rinv = G.inv(x.rep);
    const c = containing(rinv);
    return { rep: c.rep };
  };

  return { elems, eq, op, id, inv, cosets };
}

/** Kernel of a hom f: G→H as a subgroup of G. */
export function kernel<A, B>(f: GroupHom<A, B>): FiniteGroup<A> {
  const G = f.source;
  const kerElems = G.elems.filter(a => f.target.eq(f.f(a), f.target.id));
  return {
    elems: kerElems,
    eq: G.eq,
    op: (a, b) => G.op(a, b),
    id: G.id,
    inv: (a) => G.inv(a)
  };
}

/** Image of f: G→H as a subgroup of H. */
export function image<A, B>(f: GroupHom<A, B>): FiniteGroup<B> {
  const H = f.target;
  const elems: B[] = [];
  for (const a of f.source.elems) {
    const b = f.f(a);
    if (!elems.some(x => H.eq(x, b))) elems.push(b);
  }
  return { elems, eq: H.eq, op: H.op, id: H.id, inv: H.inv };
}