import { Group, Subgroup } from "./structures";

export interface Coset<A> {
  rep: A;      // chosen representative
  set: A[];    // full coset elements
}

function eqDefault<T>(a: T, b: T) { return Object.is(a,b); }

function uniqueByEq<A>(xs: A[], eq: (x:A,y:A)=>boolean): A[] {
  const out: A[] = [];
  for (const x of xs) {
    if (!out.some(y => eq(x,y))) out.push(x);
  }
  return out;
}

export function leftCoset<A>(G: Group<A>, N: Subgroup<A>, g: A): Coset<A> {
  const eq = G.eq ?? eqDefault;
  const set = uniqueByEq(N.elems.map(n => G.op(g, n)), eq);
  return { rep: g, set };
}

export function sameCoset<A>(G: Group<A>, c1: Coset<A>, c2: Coset<A>): boolean {
  const eq = G.eq ?? eqDefault;
  if (c1.set.length !== c2.set.length) return false;
  return c1.set.every(x => c2.set.some(y => eq(x,y)));
}

/**
 * Build the set of distinct left cosets { gN | g ∈ G }.
 * Assumes N is a subgroup (normality checked elsewhere; kernel will be normal).
 */
export function cosets<A>(G: Group<A>, N: Subgroup<A>): Coset<A>[] {
  const eq = (c1: Coset<A>, c2: Coset<A>) => sameCoset(G, c1, c2);
  const all = G.elems.map(g => leftCoset(G, N, g));
  return uniqueByEq(all, eq);
}

/** Check normality: g n g^{-1} ∈ N for all g∈G,n∈N. */
export function isNormal<A>(G: Group<A>, N: Subgroup<A>): boolean {
  const eqN = N.eq ?? G.eq ?? eqDefault;
  const inN = (x: A) => N.elems.some(n => (eqN(n,x)));
  for (const g of G.elems) {
    const ginv = G.inv(g);
    for (const n of N.elems) {
      const conj = G.op(G.op(g, n), ginv);
      if (!inN(conj)) return false;
    }
  }
  return true;
}

/**
 * Quotient group G / N, represented by cosets, with operation [g][h] = [gh].
 * Precondition: N is normal in G.
 */
export function quotientGroup<A>(G: Group<A>, N: Subgroup<A>): Group<Coset<A>> {
  const eq = (c1: Coset<A>, c2: Coset<A>) => sameCoset(G, c1, c2);
  const cos = cosets(G, N);

  const findCoset = (g: A) => cos.find(c => (G.eq ?? eqDefault)(c.rep, g) || c.set.some(x => (G.eq ?? eqDefault)(x,g)))!;

  const op = (c1: Coset<A>, c2: Coset<A>) => {
    const gh = G.op(c1.rep, c2.rep);
    return findCoset(gh);
  };

  const e = findCoset(G.e);
  const inv = (c: Coset<A>) => findCoset(G.inv(c.rep));

  return {
    name: `${G.name ?? "G"}/${N.name ?? "N"}`,
    elems: cos,
    op, e, inv, eq
  };
}