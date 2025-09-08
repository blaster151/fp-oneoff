import { Group, Homomorphism } from "../iso/IsomorphismWitnesses";

// Categorical monomorphism: left-cancellable morphisms
// f is monomorphism if whenever f ∘ g = f ∘ h, then g = h
export function isMonomorphism<A, B, J>(
  f: Homomorphism<A, B>,
  testPairs: Array<{
    g: Homomorphism<J, A>;
    h: Homomorphism<J, A>;
  }>,
  elemsJ: J[]
): boolean {
  // f is monomorphism if whenever f ∘ g = f ∘ h, then g = h
  for (const { g, h } of testPairs) {
    // Check if f ∘ g = f ∘ h
    const compositionsEqual = elemsJ.every(j => {
      const fgResult = f.map(g.map(j));
      const fhResult = f.map(h.map(j));
      return f.target.eq(fgResult, fhResult);
    });
    
    // If compositions are equal, check if g = h
    if (compositionsEqual) {
      const gEqualsH = elemsJ.every(j => {
        const gResult = g.map(j);
        const hResult = h.map(j);
        return g.source.eq(gResult, hResult);
      });
      
      // If f ∘ g = f ∘ h but g ≠ h, then f is not a monomorphism
      if (!gEqualsH) {
        return false;
      }
    }
  }
  
  return true;
}

// Enhanced monomorphism check with exhaustive testing for finite groups
export function isMonomorphismFinite<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): boolean {
  // For finite groups, we can check injectivity directly
  // This is equivalent to left-cancellability in concrete categories
  
  // Check injectivity: f(x) = f(y) ⟹ x = y
  for (let i = 0; i < elemsA.length; i++) {
    for (let j = i + 1; j < elemsA.length; j++) {
      const x = elemsA[i];
      const y = elemsA[j];
      
      if (f.target.eq(f.map(x), f.map(y))) {
        if (!f.source.eq(x, y)) {
          return false; // Not injective, hence not a monomorphism
        }
      }
    }
  }
  
  return true;
}

// Generate test pairs for monomorphism checking
export function generateMonomorphismTestPairs<A, B, J>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsJ: J[]
): Array<{
  g: Homomorphism<J, A>;
  h: Homomorphism<J, A>;
}> {
  const testPairs: Array<{
    g: Homomorphism<J, A>;
    h: Homomorphism<J, A>;
  }> = [];
  
  // Generate pairs of homomorphisms from J to A
  // For simplicity, we'll generate constant maps and identity-like maps
  for (const a1 of elemsA) {
    for (const a2 of elemsA) {
      const g: Homomorphism<J, A> = {
        source: f.source, // Assuming J has same structure as A for simplicity
        target: f.source,
        map: (_) => a1
      };
      
      const h: Homomorphism<J, A> = {
        source: f.source,
        target: f.source,
        map: (_) => a2
      };
      
      testPairs.push({ g, h });
    }
  }
  
  return testPairs;
}

// Categorical characterization: monomorphism = left-cancellable
export function isLeftCancellable<A, B, J>(
  f: Homomorphism<A, B>,
  elemsJ: J[]
): (g: Homomorphism<J, A>, h: Homomorphism<J, A>) => boolean {
  return (g: Homomorphism<J, A>, h: Homomorphism<J, A>) => {
    // Check if f ∘ g = f ∘ h implies g = h
    const compositionsEqual = elemsJ.every(j => {
      const fgResult = f.map(g.map(j));
      const fhResult = f.map(h.map(j));
      return f.target.eq(fgResult, fhResult);
    });
    
    if (!compositionsEqual) {
      return true; // If compositions aren't equal, cancellation doesn't apply
    }
    
    // If compositions are equal, check if g = h
    const gEqualsH = elemsJ.every(j => {
      const gResult = g.map(j);
      const hResult = h.map(j);
      return g.source.eq(gResult, hResult);
    });
    
    return gEqualsH;
  };
}

// Bridge from set-theoretic injectivity to categorical monomorphism
export function injectivityToMonomorphism<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[]
): {
  isInjective: boolean;
  isMonomorphism: boolean;
  equivalence: boolean;
} {
  // Check injectivity (set-theoretic)
  const isInjective = isMonomorphismFinite(f, elemsA, []);
  
  // Check monomorphism (categorical)
  const testPairs = generateMonomorphismTestPairs(f, elemsA, elemsA);
  const isMono = isMonomorphism(f, testPairs, elemsA);
  
  // In concrete categories like Grp, injective ⟺ monomorphism
  const equivalence = isInjective === isMono;
  
  return {
    isInjective,
    isMonomorphism: isMono,
    equivalence
  };
}

// Example: Z → R inclusion is injective but not left-invertible in Grp
export function createInclusionExample(): {
  inclusion: Homomorphism<number, number>;
  isInjective: boolean;
  hasLeftInverse: boolean;
  isMonomorphism: boolean;
} {
  // Simulate Z → R inclusion (using numbers for simplicity)
  const Z: Group<number> = {
    id: 0,
    op: (x, y) => x + y,
    inv: (x) => -x,
    eq: (x, y) => x === y
  };
  
  const R: Group<number> = {
    id: 0,
    op: (x, y) => x + y,
    inv: (x) => -x,
    eq: (x, y) => x === y
  };
  
  const inclusion: Homomorphism<number, number> = {
    source: Z,
    target: R,
    map: (x) => x // Identity map (simplified)
  };
  
  const elemsZ = [0, 1, -1, 2, -2]; // Finite subset of Z
  const elemsR = [0, 1, -1, 2, -2, 0.5, -0.5]; // Finite subset of R
  
  // Check injectivity
  const isInjective = isMonomorphismFinite(inclusion, elemsZ, elemsR);
  
  // Check if it has a left inverse (in the finite case, this is simplified)
  const hasLeftInverse = false; // In general, Z → R has no left inverse in Grp
  
  // Check monomorphism property
  const testPairs = generateMonomorphismTestPairs(inclusion, elemsZ, elemsZ);
  const isMono = isMonomorphism(inclusion, testPairs, elemsZ);
  
  return {
    inclusion,
    isInjective,
    hasLeftInverse,
    isMonomorphism: isMono
  };
}

// Utility to create morphism with categorical properties
export function createMorphismWithProperties<A, B>(
  source: Group<A>,
  target: Group<B>,
  map: (a: A) => B,
  elemsA: A[],
  elemsB: B[]
): Homomorphism<A, B> & {
  isMonomorphism: boolean;
  isEpimorphism: boolean;
  isIsomorphism: boolean;
} {
  const morphism: Homomorphism<A, B> = {
    source,
    target,
    map
  };
  
  // Check monomorphism (injectivity for finite groups)
  const isMonomorphism = isMonomorphismFinite(morphism, elemsA, elemsB);
  
  // Check epimorphism (surjectivity for finite groups)
  const isEpimorphism = elemsB.every(b => {
    return elemsA.some(a => target.eq(map(a), b));
  });
  
  // Check isomorphism (bijectivity for finite groups)
  const isIsomorphism = isMonomorphism && isEpimorphism;
  
  return {
    ...morphism,
    isMonomorphism,
    isEpimorphism,
    isIsomorphism
  };
}