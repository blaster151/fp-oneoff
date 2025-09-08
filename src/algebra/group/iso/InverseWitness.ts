import { Group, Homomorphism } from "./IsomorphismWitnesses";

// Witness that f and g are inverses
export interface InverseWitness<A, B> {
  f: Homomorphism<A, B>;
  g: Homomorphism<B, A>;
  leftIdentity: boolean;
  rightIdentity: boolean;
}

export function makeInverseWitness<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): InverseWitness<A, B> {
  // Check g ∘ f = 1_A (left identity)
  const leftIdentity = elemsA.every(a => f.source.eq(g.map(f.map(a)), a));
  
  // Check f ∘ g = 1_B (right identity)
  const rightIdentity = elemsB.every(b => f.target.eq(f.map(g.map(b)), b));
  
  return { f, g, leftIdentity, rightIdentity };
}

export function isIsomorphismByInverse<A, B>(
  witness: InverseWitness<A, B>
): boolean {
  return witness.leftIdentity && witness.rightIdentity;
}

// Enhanced version that also checks homomorphism properties
export interface CompleteInverseWitness<A, B> extends InverseWitness<A, B> {
  fIsHomomorphism: boolean;
  gIsHomomorphism: boolean;
  isCompleteIsomorphism: boolean;
}

export function makeCompleteInverseWitness<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): CompleteInverseWitness<A, B> {
  const base = makeInverseWitness(f, g, elemsA, elemsB);
  
  // Check that f is a homomorphism
  const fIsHomomorphism = elemsA.every(a1 => 
    elemsA.every(a2 => {
      const opResult = f.source.op(a1, a2);
      const mapResult = f.target.op(f.map(a1), f.map(a2));
      return f.target.eq(f.map(opResult), mapResult);
    })
  );
  
  // Check that g is a homomorphism
  const gIsHomomorphism = elemsB.every(b1 => 
    elemsB.every(b2 => {
      const opResult = g.source.op(b1, b2);
      const mapResult = g.target.op(g.map(b1), g.map(b2));
      return g.target.eq(g.map(opResult), mapResult);
    })
  );
  
  const isCompleteIsomorphism = base.leftIdentity && base.rightIdentity && 
                                fIsHomomorphism && gIsHomomorphism;
  
  return {
    ...base,
    fIsHomomorphism,
    gIsHomomorphism,
    isCompleteIsomorphism
  };
}

// Utility to create isomorphism from witness
export function createIsomorphismFromWitness<A, B>(
  witness: CompleteInverseWitness<A, B>
): { forward: Homomorphism<A, B>; backward: Homomorphism<B, A> } | null {
  if (!witness.isCompleteIsomorphism) {
    return null; // Not a valid isomorphism
  }
  
  return {
    forward: witness.f,
    backward: witness.g
  };
}

// Theorem 4 implementation: f is isomorphism ⟺ f has two-sided inverse
export function theorem4Characterization<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): (g: Homomorphism<B, A>) => CompleteInverseWitness<A, B> {
  return (g: Homomorphism<B, A>) => {
    return makeCompleteInverseWitness(f, g, elemsA, elemsB);
  };
}

// Check if a homomorphism can be extended to an isomorphism
export function canExtendToIsomorphism<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): boolean {
  // First check if f is bijective
  // Check injectivity
  for (let i = 0; i < elemsA.length; i++) {
    for (let j = i + 1; j < elemsA.length; j++) {
      if (f.target.eq(f.map(elemsA[i]), f.map(elemsA[j]))) {
        if (!f.source.eq(elemsA[i], elemsA[j])) {
          return false; // Not injective
        }
      }
    }
  }
  
  // Check surjectivity
  for (const b of elemsB) {
    let found = false;
    for (const a of elemsA) {
      if (f.target.eq(f.map(a), b)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  
  // If bijective, we can construct the inverse
  return true;
}

// Construct inverse homomorphism from bijective homomorphism
export function constructInverse<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): Homomorphism<B, A> | null {
  if (!canExtendToIsomorphism(f, elemsA, elemsB)) {
    return null;
  }
  
  // Construct the inverse map
  const inverseMap = new Map<B, A>();
  for (const a of elemsA) {
    inverseMap.set(f.map(a), a);
  }
  
  return {
    source: f.target,
    target: f.source,
    map: (b: B) => {
      const result = inverseMap.get(b);
      if (result === undefined) {
        throw new Error(`No inverse found for ${b}`);
      }
      return result;
    }
  };
}