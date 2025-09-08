import type { Group, GroupHom, GroupIso } from "../Group";

// Build a GroupHom, caller promises it's a homomorphism (tests can verify)
export function hom<A, B>(source: Group<A>, target: Group<B>, f: (a: A) => B): GroupHom<A, B> {
  return { source, target, map: f };
}

// Build a GroupIso with witness predicates.
// For finite groups, witnesses can systematically check the laws by enumeration.
// For infinite groups, you can pass simple point-checkers (e.g., leftInverse(b) := target.eq(to.map(from.map(b)), b)).
export function iso<A, B>(
  to: GroupHom<A, B>,
  from: GroupHom<B, A>,
  leftInverse: (b: B) => boolean,
  rightInverse: (a: A) => boolean
): GroupIso<A, B> {
  return { to, from, leftInverse, rightInverse };
}