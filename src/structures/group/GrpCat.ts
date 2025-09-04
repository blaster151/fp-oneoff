import type { FiniteGroup } from "./Group";

/** Group homomorphism */
export interface GroupHom<A, B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  f: (a: A) => B;
  verify?(): boolean;
}

// Factory to build a well-typed homomorphism object.
export function hom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  f: (a: A) => B,
  verify?: () => boolean
): GroupHom<A, B> {
  return { source, target, f, verify };
}

/** Identity homomorphism */
export function idHom<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  return hom(G, G, (a) => a, () => true);
}

/** Composition of homomorphisms */
export function comp<A, B, C>(
  f: GroupHom<A, B>, 
  g: GroupHom<B, C>
): GroupHom<A, C> {
  return hom(
    f.source,
    g.target,
    (a) => g.f(f.f(a)),
    () => (f.verify?.() ?? true) && (g.verify?.() ?? true)
  );
}

/** Product group G × H */
export function productGroup<A, B>(
  G: FiniteGroup<A>, 
  H: FiniteGroup<B>
): FiniteGroup<[A, B]> {
  const elems: [A, B][] = [];
  for (const a of G.elems) {
    for (const b of H.elems) {
      elems.push([a, b]);
    }
  }
  
  return {
    elems,
    eq: ([a1, b1], [a2, b2]) => G.eq(a1, a2) && H.eq(b1, b2),
    op: ([a1, b1], [a2, b2]) => [G.op(a1, a2), H.op(b1, b2)],
    id: [G.id, H.id],
    inv: ([a, b]) => [G.inv(a), H.inv(b)]
  };
}

/** Projection π1: G × H → G */
export function proj1<A, B>(G: FiniteGroup<A>, H: FiniteGroup<B>): GroupHom<[A, B], A> {
  return hom(productGroup(G, H), G, ([a, b]) => a, () => true);
}

/** Projection π2: G × H → H */
export function proj2<A, B>(G: FiniteGroup<A>, H: FiniteGroup<B>): GroupHom<[A, B], B> {
  return hom(productGroup(G, H), H, ([a, b]) => b, () => true);
}

/** Pair into product: K → G × H given K → G and K → H */
export function pairIntoProduct<K, A, B>(
  K: FiniteGroup<K>,
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  u: GroupHom<K, A>,
  v: GroupHom<K, B>
): GroupHom<K, [A, B]> {
  return hom(
    K,
    productGroup(G, H),
    (k) => [u.f(k), v.f(k)],
    () => (u.verify?.() ?? true) && (v.verify?.() ?? true)
  );
}

import { trivial } from "./Group";

// Unique hom G → 1 and 1 → G
export function toTrivial<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  const One = trivial(G.id, G.eq);
  return hom(G, One, (_a: A) => One.id, () => true) as any;
}
export function fromTrivial<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  const One = trivial(G.id, G.eq);
  return hom(One, G, (_: A) => G.id, () => true) as any;
}

// "Collapse" hom h : G → G, x ↦ e (always a hom)
export function collapse<A>(G: FiniteGroup<A>): GroupHom<A,A> {
  return hom(G, G, (_a:A) => G.id, () => true);
}
