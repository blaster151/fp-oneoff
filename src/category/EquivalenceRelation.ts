// Build a generic equivalence relation witness system
// We want to capture: reflexive, symmetric, transitive

export interface EquivalenceWitness<A> {
  reflexive: (a: A) => boolean;
  symmetric: (a: A, b: A) => boolean;
  transitive: (a: A, b: A, c: A) => boolean;
}

// Helper to build from a predicate
export function makeEquivalence<A>(
  rel: (a: A, b: A) => boolean
): EquivalenceWitness<A> {
  return {
    reflexive: (a) => rel(a, a),
    symmetric: (a, b) => rel(a, b) === rel(b, a),
    transitive: (a, b, c) =>
      !rel(a, b) || !rel(b, c) || rel(a, c)
  };
}

// Enhanced version that can work with finite sets for exhaustive checking
export interface FiniteEquivalenceWitness<A> extends EquivalenceWitness<A> {
  // For finite sets, we can check all elements
  checkAllElements: (elements: A[]) => boolean;
}

export function makeFiniteEquivalence<A>(
  rel: (a: A, b: A) => boolean,
  elements: A[]
): FiniteEquivalenceWitness<A> {
  const base = makeEquivalence(rel);
  
  return {
    ...base,
    checkAllElements: (testElements: A[]) => {
      // Check reflexivity for all elements
      for (const a of testElements) {
        if (!base.reflexive(a)) return false;
      }
      
      // Check symmetry for all pairs
      for (let i = 0; i < testElements.length; i++) {
        for (let j = 0; j < testElements.length; j++) {
          const ei = testElements[i];
          const ej = testElements[j];
          if (ei !== undefined && ej !== undefined && !base.symmetric(ei, ej)) return false;
        }
      }
      
      // Check transitivity for all triples
      for (let i = 0; i < testElements.length; i++) {
        for (let j = 0; j < testElements.length; j++) {
          for (let k = 0; k < testElements.length; k++) {
            const ei = testElements[i];
            const ej = testElements[j];
            const ek = testElements[k];
            if (ei !== undefined && ej !== undefined && ek !== undefined && !base.transitive(ei, ej, ek)) return false;
          }
        }
      }
      
      return true;
    }
  };
}

// Utility to verify that a relation is actually an equivalence relation
export function verifyEquivalenceRelation<A>(
  rel: (a: A, b: A) => boolean,
  testElements: A[]
): boolean {
  const witness = makeFiniteEquivalence(rel, testElements);
  return witness.checkAllElements(testElements);
}