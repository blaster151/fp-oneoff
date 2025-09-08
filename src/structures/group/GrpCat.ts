import type { FiniteGroup } from "./Group";
import { GroupHom, hom } from "./Hom";
import { productGroupTuples as productGroup, proj1 as _proj1, proj2 as _proj2, pairIntoProduct as _pairIntoProduct } from "./builders/Product";

// Re-export the homomorphism types and functions for backward compatibility
export { GroupHom, hom, productGroup };

export const proj1 = _proj1;
export const proj2 = _proj2;
export const pairIntoProduct = _pairIntoProduct;

/** Identity homomorphism */
export function idHom<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  return hom(G, G, (a) => a, undefined, () => true);
}

/** Composition of homomorphisms */
export function compose<A, B, C>(
  f: GroupHom<A, B>, 
  g: GroupHom<B, C>
): GroupHom<A, C> {
  return hom(
    f.source,
    g.target,
    (a) => g.f(f.f(a)),
    undefined,
    () => (f.verify?.() ?? true) && (g.verify?.() ?? true)
  );
}

// Back-compat alias (TODO deprecate and remove after callers are migrated)
export const comp = compose;



import { trivial } from "./Group";

// Unique hom G → 1 and 1 → G
export function toTrivial<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  const One = trivial(G.id, G.eq);
  return hom(G, One, (_a: A) => One.id, undefined, () => true) as any;
}
export function fromTrivial<A>(G: FiniteGroup<A>): GroupHom<A, A> {
  const One = trivial(G.id, G.eq);
  return hom(One, G, (_: A) => G.id, undefined, () => true) as any;
}

// "Collapse" hom h : G → G, x ↦ e (always a hom)
export function collapse<A>(G: FiniteGroup<A>): GroupHom<A,A> {
  return hom(G, G, (_a:A) => G.id, undefined, () => true);
}
