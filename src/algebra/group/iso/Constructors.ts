import type { FiniteGroup } from "../Group";
import type { GroupHom } from "../Hom";
// Do not import GroupIso from ../structures — it's a different type universe.
// import type { GroupIso } from "../structures";

/** Build a GroupHom; caller promises it's a homomorphism (tests can verify). */
export function hom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  f: (a: A) => B
): GroupHom<unknown, unknown, A, B> {
  return { source, target, map: f };
}

/** Local iso-with-witnesses type compatible with Hom.ts' GroupHom shape. */
export interface IsoWithWitnesses<A, B> {
  to: GroupHom<unknown, unknown, A, B>;
  from: GroupHom<unknown, unknown, B, A>;
  leftInverse: (b: B) => boolean;   // witness predicate
  rightInverse: (a: A) => boolean;  // witness predicate
}

/** Build a Group isomorphism record with witness predicates. */
export function iso<A, B>(
  to: GroupHom<unknown, unknown, A, B>,
  from: GroupHom<unknown, unknown, B, A>,
  leftInverse: (b: B) => boolean,
  rightInverse: (a: A) => boolean
): IsoWithWitnesses<A, B> {
  return { to, from, leftInverse, rightInverse };
}
