import type { Group, GroupHom, GroupIso } from "../Group";

// Build a GroupHom, caller promises it's a homomorphism (tests can verify)
export function hom<A, B>(source: Group<A>, target: Group<B>, f: (a: A) => B): GroupHom<A, B> {
  const result = { source, target, map: f };
  // Add verify method for compatibility
  (result as any).verify = () => {
    // Simple verification - check if it's a homomorphism
    if (!source.elems || !target.elems) return true;
    for (const x of source.elems) {
      for (const y of source.elems) {
        const lhs = f(source.op(x, y));
        const rhs = target.op(f(x), f(y));
        const eq = target.eq ?? ((a: B, b: B) => a === b);
        if (!eq(lhs, rhs)) return false;
      }
    }
    return true;
  };
  return result;
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