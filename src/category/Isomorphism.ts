// General categorical interface: morphism with inverse
export interface Category<A> {
  id: (a: A) => A;
  compose: <X, Y, Z>(
    f: (y: Y) => Z,
    g: (x: X) => Y
  ) => (x: X) => Z;
}

// Generic morphism in any category
export interface Morphism<A, B> {
  source: A;
  target: B;
  map: (a: A) => B;
}

// Categorical isomorphism witness
export interface CategoricalInverseWitness<A, B> {
  f: Morphism<A, B>;
  g: Morphism<B, A>;
  leftIdentity: boolean;
  rightIdentity: boolean;
}

export function hasInverse<A, B>(
  f: (a: A) => B,
  g: (b: B) => A,
  elemsA: A[],
  elemsB: B[],
  eqA: (a1: A, a2: A) => boolean = (a1, a2) => a1 === a2,
  eqB: (b1: B, b2: B) => boolean = (b1, b2) => b1 === b2
): boolean {
  // Check g ∘ f = 1_A (left identity)
  const left = elemsA.every(a => eqA(g(f(a)), a));
  
  // Check f ∘ g = 1_B (right identity)
  const right = elemsB.every(b => eqB(f(g(b)), b));
  
  return left && right;
}

// Make categorical inverse witness
export function makeCategoricalInverseWitness<A, B>(
  f: Morphism<A, B>,
  g: Morphism<B, A>,
  elemsA: A[],
  elemsB: B[],
  eqA: (a1: A, a2: A) => boolean = (a1, a2) => a1 === a2,
  eqB: (b1: B, b2: B) => boolean = (b1, b2) => b1 === b2
): CategoricalInverseWitness<A, B> {
  const leftIdentity = elemsA.every(a => eqA(g.map(f.map(a)), a));
  const rightIdentity = elemsB.every(b => eqB(f.map(g.map(b)), b));
  
  return { f, g, leftIdentity, rightIdentity };
}

// Check if morphism is categorical isomorphism
export function isCategoricalIsomorphism<A, B>(
  witness: CategoricalInverseWitness<A, B>
): boolean {
  return witness.leftIdentity && witness.rightIdentity;
}

// Generic category instance for functions
export const FunctionCategory: Category<any> = {
  id: (a) => a,
  compose: <X, Y, Z>(f: (y: Y) => Z, g: (x: X) => Y) => (x: X) => f(g(x))
};

// Generic category instance for groups (using our existing Group interface)
export function makeGroupCategory<A>(G: { eq: (a: A, b: A) => boolean }): Category<A> {
  return {
    id: (a: A) => a,
    compose: <X, Y, Z>(f: (y: Y) => Z, g: (x: X) => Y) => (x: X) => f(g(x))
  };
}

// Bridge from group-specific to categorical
export function groupToCategorical<A, B>(
  groupF: { source: any; target: any; map: (a: A) => B },
  groupG: { source: any; target: any; map: (b: B) => A }
): { f: Morphism<A, B>; g: Morphism<B, A> } {
  return {
    f: {
      source: groupF.source,
      target: groupF.target,
      map: groupF.map
    },
    g: {
      source: groupG.source,
      target: groupG.target,
      map: groupG.map
    }
  };
}

// Theorem 4 in categorical terms
export function theorem4Categorical<A, B>(
  f: Morphism<A, B>,
  elemsA: A[],
  elemsB: B[],
  eqA: (a1: A, a2: A) => boolean = (a1, a2) => a1 === a2,
  eqB: (b1: B, b2: B) => boolean = (b1, b2) => b1 === b2
): (g: Morphism<B, A>) => CategoricalInverseWitness<A, B> {
  return (g: Morphism<B, A>) => {
    return makeCategoricalInverseWitness(f, g, elemsA, elemsB, eqA, eqB);
  };
}

// Utility to check if a function is bijective (for any category with finite objects)
export function isBijective<A, B>(
  f: (a: A) => B,
  elemsA: A[],
  elemsB: B[],
  eqB: (b1: B, b2: B) => boolean = (b1, b2) => b1 === b2
): boolean {
  // Check injectivity
  for (let i = 0; i < elemsA.length; i++) {
    for (let j = i + 1; j < elemsA.length; j++) {
      const ai = elemsA[i];
      const aj = elemsA[j];
      if (ai !== undefined && aj !== undefined && eqB(f(ai), f(aj))) {
        return false; // Not injective
      }
    }
  }
  
  // Check surjectivity
  for (const b of elemsB) {
    let found = false;
    for (const a of elemsA) {
      if (eqB(f(a), b)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  
  return true;
}

// Construct inverse function from bijective function
export function constructInverseFunction<A, B>(
  f: (a: A) => B,
  elemsA: A[],
  elemsB: B[],
  eqB: (b1: B, b2: B) => boolean = (b1, b2) => b1 === b2
): ((b: B) => A) | null {
  if (!isBijective(f, elemsA, elemsB, eqB)) {
    return null;
  }
  
  // Construct the inverse map
  const inverseMap = new Map<B, A>();
  for (const a of elemsA) {
    inverseMap.set(f(a), a);
  }
  
  return (b: B) => {
    const result = inverseMap.get(b);
    if (result === undefined) {
      throw new Error(`No inverse found for ${b}`);
    }
    return result;
  };
}