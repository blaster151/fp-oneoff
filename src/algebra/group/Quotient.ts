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
  if (!N.elems) throw new Error("Subgroup missing elems property");
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
  
  // Handle case where N is a congruence relation without elems
  let cos: Coset<A>[];
  if (!N.elems) {
    // Treat as congruence relation - create equivalence classes
    const classes = new Map<string, A[]>();
    for (const g of G.elems) {
      let found = false;
      for (const [key, classElems] of classes) {
        if (classElems.some(h => (N as any).eq?.(g, h))) {
          classElems.push(g);
          found = true;
          break;
        }
      }
      if (!found) {
        classes.set(JSON.stringify(g), [g]);
      }
    }
    cos = Array.from(classes.values()).map(set => ({ rep: set[0]!, set }));
  } else {
    cos = cosets(G, N);
  }

  const findCoset = (g: A) => cos.find(c => (G.eq ?? eqDefault)(c.rep, g) || c.set.some(x => (G.eq ?? eqDefault)(x,g)))!;

  const op = (c1: Coset<A>, c2: Coset<A>) => {
    const gh = G.op(c1.rep, c2.rep);
    return findCoset(gh);
  };

  const e = findCoset((G as any).e ?? (G as any).id);
  const inv = (c: Coset<A>) => findCoset(G.inv(c.rep));

  const result: Group<Coset<A>> = {
    elems: cos,
    eq,
    op,
    id: e,
    inv
  };
  if ((G as any).name || (N as any).name) {
    (result as any).label = `${(G as any).name ?? "G"}/${(N as any).name ?? "N"}`;
  }
  return result;
}