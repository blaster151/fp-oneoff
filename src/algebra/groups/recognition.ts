// src/algebra/groups/recognition.ts
import { FiniteGroup } from "./core";
import { Hom } from "./hom";

// check injective (mono ⇔ injective in Grp for finite)
export function isInjective<G, H>(f: Hom<G, H>): boolean {
  const { src: G, dst: H } = f;
  for (const g1 of G.elements) for (const g2 of G.elements) {
    if (H.eq(f.map(g1), f.map(g2)) && !G.eq(g1, g2)) return false;
  }
  return true;
}

// check surjective (epi ⇔ surjective in Grp for finite)
export function isSurjective<G, H>(f: Hom<G, H>): boolean {
  const { src: G, dst: H } = f;
  return H.elements.every(h => G.elements.some(g => H.eq(f.map(g), h)));
}

// iso ⇔ bijective homomorphism
export function isIsomorphism<G, H>(f: Hom<G, H>): boolean {
  return isInjective(f) && isSurjective(f);
}