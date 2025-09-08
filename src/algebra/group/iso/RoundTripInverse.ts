import { Group, Homomorphism } from "./IsomorphismWitnesses";

// Round-trip inverse checking that encodes the proof flow
export function checkIsInverse<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[],
  opA: (x: A, y: A) => A,
  opB: (x: B, y: B) => B
): boolean {
  // Step 1: Group law preservation - g must be a homomorphism
  // This encodes the proof: g(x ⋆ y) = g(f(g(x)) ⋆ f(g(y))) = g(f(g(x ⋆ y))) = x ⋆ y
  const preservesOp = elemsB.every((x) =>
    elemsB.every((y) => {
      const lhs = g.map(opB(x, y));
      const rhs = opA(g.map(x), g.map(y));
      return g.target.eq(lhs, rhs);
    })
  );

  // Step 2: Identity round-trips (left and right identity laws)
  const left = elemsA.every(a => f.source.eq(g.map(f.map(a)), a));
  const right = elemsB.every(b => f.target.eq(f.map(g.map(b)), b));

  return preservesOp && left && right;
}

// Enhanced version that also checks f is a homomorphism
export function checkIsCompleteInverse<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): {
  fIsHomomorphism: boolean;
  gIsHomomorphism: boolean;
  leftIdentity: boolean;
  rightIdentity: boolean;
  isCompleteInverse: boolean;
} {
  // Check f is a homomorphism
  const fIsHomomorphism = elemsA.every(a1 =>
    elemsA.every(a2 => {
      const opResult = f.source.op(a1, a2);
      const mapResult = f.target.op(f.map(a1), f.map(a2));
      return f.target.eq(f.map(opResult), mapResult);
    })
  );

  // Check g is a homomorphism (the key insight from the proof)
  const gIsHomomorphism = elemsB.every(b1 =>
    elemsB.every(b2 => {
      const opResult = g.source.op(b1, b2);
      const mapResult = g.target.op(g.map(b1), g.map(b2));
      return g.target.eq(g.map(opResult), mapResult);
    })
  );

  // Check identity round-trips
  const leftIdentity = elemsA.every(a => f.source.eq(g.map(f.map(a)), a));
  const rightIdentity = elemsB.every(b => f.target.eq(f.map(g.map(b)), b));

  const isCompleteInverse = fIsHomomorphism && gIsHomomorphism && 
                           leftIdentity && rightIdentity;

  return {
    fIsHomomorphism,
    gIsHomomorphism,
    leftIdentity,
    rightIdentity,
    isCompleteInverse
  };
}

// Theorem 4 implementation: f is isomorphism ⟺ f has homomorphic two-sided inverse
export function theorem4RoundTrip<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): (g: Homomorphism<B, A>) => boolean {
  return (g: Homomorphism<B, A>) => {
    const check = checkIsCompleteInverse(f, g, elemsA, elemsB);
    return check.isCompleteInverse;
  };
}

// Proof flow implementation: Forward direction
// If f is isomorphism, then g (the inverse) must be a homomorphism
export function forwardDirectionProof<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): {
  fIsBijective: boolean;
  gIsHomomorphism: boolean;
  conclusion: boolean;
} {
  // First check if f is bijective (injective + surjective)
  const fIsBijective = isBijectiveHomomorphism(f, elemsA, elemsB);
  
  // Then check if g preserves the group operation (the key proof step)
  const gIsHomomorphism = elemsB.every(b1 =>
    elemsB.every(b2 => {
      const opResult = g.source.op(b1, b2);
      const mapResult = g.target.op(g.map(b1), g.map(b2));
      return g.target.eq(g.map(opResult), mapResult);
    })
  );

  // Conclusion: if f is bijective and g is homomorphism, then f is isomorphism
  const conclusion = fIsBijective && gIsHomomorphism;

  return {
    fIsBijective,
    gIsHomomorphism,
    conclusion
  };
}

// Proof flow implementation: Converse direction
// If f has homomorphic two-sided inverse, then f is isomorphism
export function converseDirectionProof<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): {
  gIsHomomorphism: boolean;
  leftIdentity: boolean;
  rightIdentity: boolean;
  conclusion: boolean;
} {
  // Check g is homomorphism
  const gIsHomomorphism = elemsB.every(b1 =>
    elemsB.every(b2 => {
      const opResult = g.source.op(b1, b2);
      const mapResult = g.target.op(g.map(b1), g.map(b2));
      return g.target.eq(g.map(opResult), mapResult);
    })
  );

  // Check two-sided inverse property
  const leftIdentity = elemsA.every(a => f.source.eq(g.map(f.map(a)), a));
  const rightIdentity = elemsB.every(b => f.target.eq(f.map(g.map(b)), b));

  // Conclusion: if g is homomorphism and two-sided inverse, then f is isomorphism
  const conclusion = gIsHomomorphism && leftIdentity && rightIdentity;

  return {
    gIsHomomorphism,
    leftIdentity,
    rightIdentity,
    conclusion
  };
}

// Helper function to check if homomorphism is bijective
function isBijectiveHomomorphism<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): boolean {
  // Check injectivity: f(x) = f(y) ⟹ x = y
  for (let i = 0; i < elemsA.length; i++) {
    for (let j = i + 1; j < elemsA.length; j++) {
      if (f.target.eq(f.map(elemsA[i]), f.map(elemsA[j]))) {
        if (!f.source.eq(elemsA[i], elemsA[j])) {
          return false; // Not injective
        }
      }
    }
  }

  // Check surjectivity: every element in target is mapped to
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

  return true;
}

// Law-level checking: enforce that inverses must be homomorphisms
export function enforceInverseLaws<A, B>(
  f: Homomorphism<A, B>,
  g: Homomorphism<B, A>,
  elemsA: A[],
  elemsB: B[]
): {
  law1_fIsHomomorphism: boolean;
  law2_gIsHomomorphism: boolean;
  law3_leftIdentity: boolean;
  law4_rightIdentity: boolean;
  allLawsSatisfied: boolean;
} {
  const check = checkIsCompleteInverse(f, g, elemsA, elemsB);
  
  return {
    law1_fIsHomomorphism: check.fIsHomomorphism,
    law2_gIsHomomorphism: check.gIsHomomorphism,
    law3_leftIdentity: check.leftIdentity,
    law4_rightIdentity: check.rightIdentity,
    allLawsSatisfied: check.isCompleteInverse
  };
}