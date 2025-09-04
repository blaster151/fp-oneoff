// A tiny iso layer that piggybacks on your existing FiniteGroup/GroupHom code.
// We store BOTH directions so composition and inverses are trivial.

import { GroupHom } from "../GrpCat";
import { homEqByPoints, comp, id } from "../cat/GroupCat";
import { FiniteGroup } from "../Group";

export type GroupIso<A, B> = {
  forward: GroupHom<A, B>;
  backward: GroupHom<B, A>;
};

// Identity isomorphism on G
export function isoId<A>(G: FiniteGroup<A>): GroupIso<A, A> {
  const i = id<A>(G);
  return { forward: i, backward: i };
}

// Compose B⟶C with A⟶B to get A⟶C
export function isoComp<A, B, C>(ab: GroupIso<A, B>, bc: GroupIso<B, C>): GroupIso<A, C> {
  return {
    forward: comp(ab.forward, bc.forward),
    backward: comp(bc.backward, ab.backward),
  };
}

// Inverse of an iso (swap directions)
export function isoInverse<A, B>(ab: GroupIso<A, B>): GroupIso<B, A> {
  return { forward: ab.backward, backward: ab.forward };
}

// Pointwise equality on the forward direction (finite sources)
export function isoEqByPoints<A, B>(x: GroupIso<A, B>, y: GroupIso<A, B>): boolean {
  return homEqByPoints(x.forward, y.forward);
}