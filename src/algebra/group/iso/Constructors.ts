import type { FiniteGroup } from "../Group";
import type { GroupHom } from "../Hom";
import type { GroupIso } from "../structures";

// Build a GroupHom, caller promises it's a homomorphism (tests can verify)
export function hom<A, B>(source: FiniteGroup<A>, target: FiniteGroup<B>, f: (a: A) => B): GroupHom<unknown, unknown, A, B> {
  return { source, target, f };
}

// Build a GroupIso with witness predicates.
// For finite groups, witnesses can systematically check the laws by enumeration.
// For infinite groups, you can pass simple point-checkers (e.g., leftInverse(b) := target.eq(to.map(from.map(b)), b)).
export function iso<A, B>(
  to: GroupHom<unknown, unknown, A, B>,
  from: GroupHom<unknown, unknown, B, A>,
  leftInverse: (b: B) => boolean,
  rightInverse: (a: A) => boolean
): GroupIso<A, B> {
  return { to, from, leftInverse, rightInverse };
}