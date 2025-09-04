import type { FiniteGroup } from "./Group";

/** Group homomorphism */
export interface GroupHom<A, B> {
  f: (a: A) => B;
  verify(): boolean;
}

/** Create a group homomorphism */
export function hom<A, B>(
  G: FiniteGroup<A>, 
  H: FiniteGroup<B>, 
  f: (a: A) => B
): GroupHom<A, B> {
  return {
    f,
    verify() {
      // Check f(id_G) = id_H
      if (!H.eq(f(G.id), H.id)) return false;
      
      // Check f(a * b) = f(a) * f(b) for a few sample points
      for (let i = 0; i < Math.min(3, G.elems.length); i++) {
        for (let j = 0; j < Math.min(3, G.elems.length); j++) {
          const a = G.elems[i];
          const b = G.elems[j];
          if (!H.eq(f(G.op(a, b)), H.op(f(a), f(b)))) return false;
        }
      }
      return true;
    }
  };
}

/** Identity homomorphism */
export function idHom<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  return hom(G, G, (a) => a);
}

/** Composition of homomorphisms */
export function comp<A, B, C>(
  f: GroupHom<A, B>, 
  g: GroupHom<B, C>
): GroupHom<A, C> {
  return {
    f: (a) => g.f(f.f(a)),
    verify() {
      return f.verify() && g.verify();
    }
  };
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
  return hom(productGroup(G, H), G, ([a, b]) => a);
}

/** Projection π2: G × H → H */
export function proj2<A, B>(G: FiniteGroup<A>, H: FiniteGroup<B>): GroupHom<[A, B], B> {
  return hom(productGroup(G, H), H, ([a, b]) => b);
}

/** Pair into product: K → G × H given K → G and K → H */
export function pairIntoProduct<K, A, B>(
  K: FiniteGroup<K>,
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  u: GroupHom<K, A>,
  v: GroupHom<K, B>
): GroupHom<K, [A, B]> {
  return {
    f: (k) => [u.f(k), v.f(k)],
    verify() {
      return u.verify() && v.verify();
    }
  };
}