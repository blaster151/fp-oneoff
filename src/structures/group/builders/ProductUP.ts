import { FiniteGroup, GroupHom } from "../Isomorphism";
import { PairingScheme } from "../pairing/PairingScheme";

/** Projections π1, π2 : G×H → G,H for a chosen pairing scheme. */
export function projections<A, B, O>(
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  S: PairingScheme<A, B, O>,
  GH: FiniteGroup<O>
): { pi1: GroupHom<O, A>; pi2: GroupHom<O, B> } {
  return {
    pi1: { source: GH, target: G, f: (o) => S.left(o) },
    pi2: { source: GH, target: H, f: (o) => S.right(o) }
  };
}

/** Pairing ⟨f,g⟩ : K → G×H with π1∘⟨f,g⟩ = f and π2∘⟨f,g⟩ = g. */
export function pairHom<K, A, B, O>(
  K: FiniteGroup<K>,
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  S: PairingScheme<A, B, O>,
  GH: FiniteGroup<O>,
  f: GroupHom<K, A>,
  g: GroupHom<K, B>
): GroupHom<K, O> {
  return { source: K, target: GH, f: (k) => S.pair(f.f(k), g.f(k)) };
}

/** Extensional equality of group homs by pointwise equality on a finite carrier. */
export function homEqByPoints<X, Y>(h1: GroupHom<X, Y>, h2: GroupHom<X, Y>): boolean {
  for (const x of h1.source.elems) {
    if (!h1.target.eq(h1.f(x), h2.f(x))) return false;
  }
  return true;
}