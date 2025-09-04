import { FiniteGroup, GroupHom, isIsomorphism } from "../Isomorphism";

/** conj_g : G → G, x ↦ g x g^{-1} */
export function conjugation<A>(G: FiniteGroup<A>, g: A): GroupHom<A, A> {
  return {
    source: G,
    target: G,
    f: (x) => G.op(G.op(g, x), G.inv(g))
  };
}

/** Prove it's an automorphism by exhibiting inverse conj_{g^{-1}}. */
export function isInnerAutomorphism<A>(G: FiniteGroup<A>, g: A): boolean {
  const cg = conjugation(G, g);
  // An isomorphism checker already verifies existence of inverse.
  return isIsomorphism(G, G, cg.f) !== null;
}