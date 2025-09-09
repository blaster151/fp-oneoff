import { GroupHom } from "./Hom";

// Bijective (finite): injective + surjective by counting / membership
export function isInjective<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  const G = f.source, H = f.target;
  if (!G.elements) throw new Error("isInjective: need finite source.");
  const images = G.elements.map(f.map);
  return G.elements.every((x: any, i: number) =>
    G.elements!.slice(i+1).every((y: any) => !H.eq(images[i]!, f.map(y)))
  );
}
export function isSurjective<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  const G = f.source, H = f.target;
  if (!G.elements || !H.elements) throw new Error("isSurjective: need finite source/target.");
  return H.elements.every((h: any) => G.elements!.some((g: any) => H.eq(f.map(g), h)));
}
export function isBijective<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  return isInjective(f) && isSurjective(f);
}

// Categorical characterizations (finite, by brute witnesses):
// mono ⇔ left-cancellable; epi ⇔ right-cancellable.
export function isMonomorphism<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  // left-cancellable: for all g1,g2 : X->A, if f∘g1 = f∘g2 then g1 = g2.
  // Finite brute version: suffice to check on point-level equality of images for all x in X,
  // picking X = A and g1=id, g2=translation-by-a (this reduces to injectivity test).
  // So for finite groups, mono ⇔ injective.
  return isInjective(f);
}
export function isEpimorphism<A,B>(f: GroupHom<unknown,unknown,A,B>): boolean {
  // For groups (in Set-like context), epi ⇔ surjective (finite case effortless).
  return isSurjective(f);
}