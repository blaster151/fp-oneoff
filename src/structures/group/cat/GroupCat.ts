import { GroupHom } from "../GrpCat";

/** Identity homomorphism. */
export function id<A>(Obj: GroupHom<A, A>["source"]): GroupHom<A, A> {
  return { source: Obj, target: Obj, f: (a: A) => a };
}

/** Composition g ∘ f. Types ensure target/source match. */
export function comp<A, B, C>(f: GroupHom<A, B>, g: GroupHom<B, C>): GroupHom<A, C> {
  return { source: f.source, target: g.target, f: (a: A) => g.f(f.f(a)) };
}

/** Extensional equality of homs on a finite source. */
export function homEqByPoints<A, B>(h1: GroupHom<A, B>, h2: GroupHom<A, B>): boolean {
  for (const a of h1.source.elems) if (!h1.target.eq(h1.f(a), h2.f(a))) return false;
  return true;
}

/** Check universal property of a given product (π1,π2). */
export function verifyProductUP<K, A, B, O>(
  K: GroupHom<K, K>["source"],
  f: GroupHom<K, A>,
  g: GroupHom<K, B>,
  pair: (f: GroupHom<K, A>, g: GroupHom<K, B>) => GroupHom<K, O>,
  pi1: GroupHom<O, A>,
  pi2: GroupHom<O, B>
): { mediating: GroupHom<K, O>; ok: boolean } {
  const u = pair(f, g);
  const lhs1 = comp(u, pi1), lhs2 = comp(u, pi2);
  const ok = homEqByPoints(lhs1, f) && homEqByPoints(lhs2, g);
  return { mediating: u, ok };
}