import { GroupHom } from "./Hom";
import { eqOf } from "./Group";

// Bijective (finite): injective + surjective by counting / membership
export function isInjective<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  const G = f.source, H = f.target;
  const eqH = eqOf(H);
  if (!G.elems) throw new Error("isInjective: need finite source.");

  // Check: for all x≠y in G.elems, f(x) ≠ f(y)
  for (let i = 0; i < G.elems.length; i++) {
    const fx = f.map(G.elems[i]!);
    for (let j = i + 1; j < G.elems.length; j++) {
      const fy = f.map(G.elems[j]!);
      if (eqH(fx, fy)) return false;
    }
  }
  return true;
}

export function isSurjective<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  const G = f.source, H = f.target;
  const eqH = eqOf(H);
  if (!G.elems || !H.elems) throw new Error("isSurjective: need finite source/target.");

  return H.elems.every((h) => G.elems!.some((g) => eqH(f.map(g), h)));
}

export function isBijective<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  return isInjective(f) && isSurjective(f);
}

// Categorical characterizations (finite, by brute witnesses):
// mono ⇔ left-cancellable; epi ⇔ right-cancellable.
export function isMonomorphism<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  // For (finite) groups, monomorphism ⇔ injective.
  return isInjective(f);
}

export function isEpimorphism<A, B>(f: GroupHom<unknown, unknown, A, B>): boolean {
  // For (finite) groups, epimorphism ⇔ surjective.
  return isSurjective(f);
}
