import { FiniteGroup } from "../Group";
import { GroupHom, hom } from "../Hom";
import { PairingScheme } from "../pairing/PairingScheme";

/** Projections π1, π2 : G×H → G,H for a chosen pairing scheme. */
export function projections<A, B, O>(
  G: FiniteGroup<A>,
  H: FiniteGroup<B>,
  S: PairingScheme<A, B, O>,
  GH: FiniteGroup<O>
): { pi1: GroupHom<O, A>; pi2: GroupHom<O, B> } {
  return {
    pi1: hom(GH, G, (o) => S.left(o), undefined, () => true),
    pi2: hom(GH, H, (o) => S.right(o), undefined, () => true)
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
  return hom(K, GH, (k) => S.pair(f.f(k), g.f(k)), undefined, () => true);
}
