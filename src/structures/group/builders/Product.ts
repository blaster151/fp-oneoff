import { FiniteGroup } from "../Group";
import { PairingScheme, eqFromScheme, arrayTupleScheme } from "../pairing/PairingScheme";
import { GroupHom, hom } from "../Hom";

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

/** Simple tuple-based product G×H = FiniteGroup<[A, B]>. */
export function productGroupTuples<A, B>(
  G: FiniteGroup<A>, 
  H: FiniteGroup<B>
): FiniteGroup<[A, B]> {
  return productGroup(G, H, arrayTupleScheme());
}

/** Projection π1: G × H → G */
export function proj1<A, B>(G: FiniteGroup<A>, H: FiniteGroup<B>): GroupHom<[A, B], A> {
  return hom(productGroupTuples(G, H), G, ([a, b]) => a, () => true);
}

/** Projection π2: G × H → H */
export function proj2<A, B>(G: FiniteGroup<A>, H: FiniteGroup<B>): GroupHom<[A, B], B> {
  return hom(productGroupTuples(G, H), H, ([a, b]) => b, () => true);
}

/** Pair into product: K → G × H given K → G and K → H */
export function pairIntoProduct<K, A, B>(
  K: FiniteGroup<K>,
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  u: GroupHom<K, A>,
  v: GroupHom<K, B>
): GroupHom<K, [A, B]> {
  return hom(
    K,
    productGroupTuples(G, H),
    (k) => [u.f(k), v.f(k)],
    () => (u.verify?.() ?? true) && (v.verify?.() ?? true)
  );
}