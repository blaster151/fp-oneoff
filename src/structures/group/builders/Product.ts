import { FiniteGroup } from "../Group";
import { PairingScheme, eqFromScheme } from "../pairing/PairingScheme";

/** Cartesian product G×H using an arbitrary pairing scheme O. */
export function productGroup<A, B, O>(
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  S: PairingScheme<A, B, O>
): FiniteGroup<O> {
  // enumerate O-carrier by pairing every element
  const elems: O[] = [];
  for (const a of G.elems) {
    for (const b of H.elems) {
      elems.push(S.pair(a, b));
    }
  }

  const eq = eqFromScheme(G.eq, H.eq, S);
  const op = (o1: O, o2: O): O =>
    S.pair(G.op(S.left(o1), S.left(o2)), H.op(S.right(o1), S.right(o2)));
  const id = S.pair(G.id, H.id);
  const inv = (o: O): O => S.pair(G.inv(S.left(o)), H.inv(S.right(o)));

  return { elems, eq, op, id, inv };
}