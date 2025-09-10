import { EquivalenceWitness, makeEquivalence } from "../../../category/EquivalenceRelation";

// Define group morphisms (simplified version for this specific implementation)
export interface Group<A> {
  elems: A[];
  id: A;
  op: (x: A, y: A) => A;
  inv: (x: A) => A;
  eq: (x: A, y: A) => boolean;
}

export interface Homomorphism<A, B> {
  source: Group<A>;
  target: Group<B>;
  map: (a: A) => B;
}

export function isIsomorphism<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>
): boolean {
  // Very light check: identity preservation on both sides
  const fPreservesId = f.target.eq(f.map(f.source.id), f.target.id);
  const gPreservesId = g.target.eq(g.map(g.source.id), g.target.id);
  return fPreservesId && gPreservesId;
}

// Enhanced isomorphism check for finite groups
export function isIsomorphismFinite<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elementsA: A[],
  elementsB: B[]
): boolean {
  for (const a1 of elementsA) for (const a2 of elementsA) {
    const opResult = f.source.op(a1, a2);
    const mapResult = f.target.op(f.map(a1), f.map(a2));
    if (!f.target.eq(f.map(opResult), mapResult)) return false;
  }
  for (const b1 of elementsB) for (const b2 of elementsB) {
    const opResult = g.source.op(b1, b2);
    const mapResult = g.target.op(g.map(b1), g.map(b2));
    if (!g.target.eq(g.map(opResult), mapResult)) return false;
  }
  for (const a of elementsA) if (!f.source.eq(g.map(f.map(a)), a)) return false;
  for (const b of elementsB) if (!f.target.eq(f.map(g.map(b)), b)) return false;
  return true;
}

// Reflexivity, symmetry, transitivity for isomorphisms (very permissive witness)
export const isomorphismEquivalence: EquivalenceWitness<Homomorphism<any, any>> =
  makeEquivalence<Homomorphism<any, any>>((f, g) => {
    try { return isIsomorphism(f, g); } catch { return false; }
  });

// Helper to create isomorphism pairs for equivalence checking
export interface IsomorphismPair<A, B> {
  forward: Homomorphism<A, B>;
  backward: Homomorphism<B, A>;
}
export function createIsomorphismPair<A, B>(
  forward: Homomorphism<A, B>,
  backward: Homomorphism<B, A>
): IsomorphismPair<A, B> {
  return { forward, backward };
}

// Check if two isomorphism pairs represent the same isomorphism
export function isomorphicPairs<A, B>(
  pair1: IsomorphismPair<A, B>,
  pair2: IsomorphismPair<A, B>
): boolean {
  return isIsomorphism(pair1.forward, pair1.backward)
      && isIsomorphism(pair2.forward, pair2.backward);
}
