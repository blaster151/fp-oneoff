import { Group, Homomorphism } from "../iso/IsomorphismWitnesses";

// Monomorphism = left cancellable
export function isMonomorphism<A, B>(f: Homomorphism<A, B>): boolean {
  // Use the finite carrier on the source to check injectivity
  const E = f.source.elems;
  for (let i = 0; i < E.length; i++) {
    for (let j = i + 1; j < E.length; j++) {
      const xi = E[i]!;
      const xj = E[j]!;
      if (f.target.eq(f.map(xi), f.map(xj)) && !f.source.eq(xi, xj)) {
        return false;
      }
    }
  }
  return true;
}

// Enhanced monomorphism check for finite groups
export function isMonomorphismFinite<A, B>(
  f: Homomorphism<A, B>,
  elementsA: A[]
): boolean {
  // Check that it's a homomorphism first
  for (const a1 of elementsA) {
    for (const a2 of elementsA) {
      const opResult = f.source.op(a1, a2);
      const mapResult = f.target.op(f.map(a1), f.map(a2));
      if (!f.target.eq(f.map(opResult), mapResult)) return false;
    }
  }
  
  // Check injectivity: f(x) = f(y) ⟹ x = y
  for (let i = 0; i < elementsA.length; i++) {
    for (let j = i + 1; j < elementsA.length; j++) {
      const x = elementsA[i];
      const y = elementsA[j];
      if (f.target.eq(f.map(x), f.map(y))) {
        if (!f.source.eq(x, y)) {
          return false; // Not injective
        }
      }
    }
  }
  
  return true;
}

// Epimorphism = right cancellable
export function isEpimorphism<A, B>(
  f: Homomorphism<A, B>
): (elements: A[], targetElements: B[]) => boolean {
  // For groups, epimorphism ⟺ surjective homomorphism
  return (elements: A[], targetElements: B[]) => {
    // Check if every target element is in the image
    for (const targetElem of targetElements) {
      let found = false;
      for (const sourceElem of elements) {
        if (f.target.eq(f.map(sourceElem), targetElem)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  };
}

// Enhanced epimorphism check for finite groups
export function isEpimorphismFinite<A, B>(
  f: Homomorphism<A, B>,
  elementsA: A[],
  elementsB: B[]
): boolean {
  // Check surjectivity: every element in target is hit
  const image = new Set<B>();
  for (const a of elementsA) {
    image.add(f.map(a));
  }
  
  // Check if all target elements are in the image
  for (const b of elementsB) {
    let found = false;
    for (const img of image) {
      if (f.target.eq(img, b)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  
  // Also check that it's a homomorphism
  for (const a1 of elementsA) {
    for (const a2 of elementsA) {
      const opResult = f.source.op(a1, a2);
      const mapResult = f.target.op(f.map(a1), f.map(a2));
      if (!f.target.eq(f.map(opResult), mapResult)) return false;
    }
  }
  
  return true;
}

// Left cancellability witness (categorical definition of monomorphism)
export function leftCancellable<A, B, C>(
  f: Homomorphism<A, B>
): (g: Homomorphism<B, C>, h: Homomorphism<B, C>) => boolean {
  return (g: Homomorphism<B, C>, h: Homomorphism<B, C>) => {
    // Check: g ∘ f = h ∘ f ⟹ g = h
    // This is a simplified check - in practice you'd check for all elements
    const testElement = f.source.id;
    const gCompF = g.map(f.map(testElement));
    const hCompF = h.map(f.map(testElement));
    
    if (g.target.eq(gCompF, hCompF)) {
      // If compositions are equal, check if g and h are equal
      return g.target.eq(g.map(f.target.id), h.map(f.target.id));
    }
    return true; // Compositions are different, so no contradiction
  };
}

// Right cancellability witness (categorical definition of epimorphism)
export function rightCancellable<A, B, C>(
  f: Homomorphism<A, B>
): (g: Homomorphism<C, A>, h: Homomorphism<C, A>) => boolean {
  return (g: Homomorphism<C, A>, h: Homomorphism<C, A>) => {
    // Check: f ∘ g = f ∘ h ⟹ g = h
    const testElement = g.source.id; // C
    const fCompG = f.map(g.map(testElement)); // B
    const fCompH = f.map(h.map(testElement)); // B

    if (f.target.eq(fCompG, fCompH)) {
      // IMPORTANT: compare g and h in A (their TARGET), not in C (their SOURCE)
      return g.target.eq(g.map(testElement), h.map(testElement));
    }
    return true;
  };
}

// Combined morphism type that can be any of mono/epi/iso
export interface Morphism<A, B> extends Homomorphism<A, B> {
  isMono?: boolean;
  isEpi?: boolean;
  isIso?: boolean;
}

// Factory function to create morphisms with categorical properties
export function createMorphism<A, B>(
  source: Group<A>,
  target: Group<B>,
  map: (a: A) => B,
  elementsA?: A[],
  elementsB?: B[]
): Morphism<A, B> {
  const hom: Homomorphism<A, B> = { source, target, map };
  
  const morphism: Morphism<A, B> = { ...hom };
  
  if (elementsA && elementsB) {
    morphism.isMono = isMonomorphismFinite(hom, elementsA);
    morphism.isEpi = isEpimorphismFinite(hom, elementsA, elementsB);
    morphism.isIso = morphism.isMono && morphism.isEpi;
  }
  
  return morphism;
}