import { Group } from "./structures";

export type Eq<G> = (x: G, y: G) => boolean;

/** A congruence ≈ on a group G: an equivalence relation compatible with op. */
export interface Congruence<G> {
  readonly G: Group<G>;
  readonly eqv: Eq<G>; // equivalence: reflexive/symmetric/transitive (caller responsible)
  /** Compatibility: if x≈x' and y≈y' then x◦y ≈ x'◦y' */
  readonly comp: (x: G, x1: G, y: G, y1: G) => boolean;
}

/** Kernel-pair congruence from a homomorphism f: x≈y ⇔ f(x)=f(y). */
export function congruenceFromHom<G, H>(
  G: Group<G>, H: Group<H>, f: (g: G) => H
): Congruence<G> {
  const eqH = H.eq ?? ((a: H, b: H) => a === b);
  const eqv: Eq<G> = (x, y) => eqH(f(x), f(y));
  const comp = (x: G, x1: G, y: G, y1: G) => {
    // Check if x≈x' and y≈y' implies x◦y ≈ x'◦y'
    // This follows from f being a homomorphism: f(x◦y) = f(x)◦f(y)
    return eqH(f(G.op(x, y)), f(G.op(x1, y1)));
  };
  return { G, eqv, comp };
}