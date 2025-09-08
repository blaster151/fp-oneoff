import { FiniteGroup, eqOf } from "./Group";
import { GroupHom } from "./Hom";

/**
 * Theorem 6: The image of a group homomorphism is always a subgroup of the codomain.
 * 
 * Given f: G → H, the set f[G] = {f(x) | x ∈ G} is closed under multiplication,
 * contains the identity, and is closed under inverses — so it is a subgroup of H.
 */

export interface ImageSubgroup<A, B> {
  readonly source: FiniteGroup<A>;
  readonly target: FiniteGroup<B>;
  readonly homomorphism: GroupHom<unknown, unknown, A, B>;
  readonly image: FiniteGroup<B>;
  readonly inclusion: GroupHom<unknown, unknown, B, B>; // inclusion map from image to target
}

/**
 * Constructs the image subgroup of a group homomorphism.
 * 
 * The image subgroup consists of all elements in the codomain that are
 * mapped to by some element in the domain.
 */
export function imageSubgroup<A, B>(f: GroupHom<unknown, unknown, A, B>): ImageSubgroup<A, B> {
  const G = f.source;
  const H = f.target;
  const eqH = eqOf(H);
  
  // Compute the image: f[G] = {f(x) | x ∈ G}
  const imageElements: B[] = [];
  for (const x of G.elems as ReadonlyArray<A>) {
    const y = f.map(x);
    // Avoid duplicates using the target group's equality
    if (!imageElements.some(z => eqH(z, y))) {
      imageElements.push(y);
    }
  }
  
  // Create the image subgroup with operations inherited from H
  const imageGroup: FiniteGroup<B> = {
    elems: imageElements,
    op: H.op as (a: B, b: B) => B,
    id: H.id as B,
    inv: H.inv as (a: B) => B
  };
  if (H.eq) (imageGroup as any).eq = H.eq;
  (imageGroup as any).name = `Im(${f.name ?? 'f'})`;
  
  // Create the inclusion homomorphism from image to target
  const inclusion: GroupHom<unknown, unknown, B, B> = {
    source: imageGroup,
    target: H as FiniteGroup<B>,
    map: (b: B) => b, // identity map
    name: `incl: Im(${f.name ?? 'f'}) → ${H.name ?? 'H'}`
  };
  
  return {
    source: G,
    target: H,
    homomorphism: f,
    image: imageGroup,
    inclusion
  };
}

/**
 * Verifies that the constructed image is indeed a subgroup.
 * 
 * Checks the three subgroup axioms:
 * 1. Closure under operation
 * 2. Contains identity
 * 3. Closed under inverses
 */
export function verifyImageSubgroup<A, B>(img: ImageSubgroup<A, B>): boolean {
  const Im = img.image;
  const H = img.target;
  const eqH = eqOf(H);
  const eqIm = eqOf(Im);
  
  // 1. Closure under operation
  for (const a of Im.elems) {
    for (const b of Im.elems) {
      const ab = H.op(a, b);
      if (!Im.elems.some(c => eqH(c, ab))) {
        return false; // Not closed under operation
      }
    }
  }
  
  // 2. Contains identity
  if (!Im.elems.some(a => eqH(a, H.id))) {
    return false; // Identity not in image
  }
  
  // 3. Closed under inverses
  for (const a of Im.elems) {
    const aInv = H.inv(a);
    if (!Im.elems.some(b => eqH(b, aInv))) {
      return false; // Inverse not in image
    }
  }
  
  return true;
}

/**
 * Computes the size of the image subgroup.
 */
export function imageSize<A, B>(f: GroupHom<unknown, unknown, A, B>): number {
  const H = f.target;
  const eqH = eqOf(H);
  
  const imageElements: B[] = [];
  for (const x of f.source.elems as ReadonlyArray<A>) {
    const y = f.map(x);
    if (!imageElements.some(z => eqH(z, y))) {
      imageElements.push(y);
    }
  }
  
  return imageElements.length;
}

/**
 * Checks if a homomorphism is surjective by comparing image size to target size.
 */
export function isSurjective<A, B>(f: GroupHom<A, B>): boolean {
  return imageSize(f) === f.target.elems.length;
}

/**
 * Creates a surjective homomorphism by restricting the codomain to the image.
 */
export function makeSurjective<A, B>(f: GroupHom<A, B>): GroupHom<A, B> {
  const img = imageSubgroup(f);
  return {
    source: f.source,
    target: img.image,
    map: f.map,
    name: f.name ? `${f.name}_surj` : 'surj'
  };
}