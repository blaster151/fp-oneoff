import { Group, Homomorphism } from "./IsomorphismWitnesses";
import { checkIsCompleteInverse } from "./RoundTripInverse";

// Inverse construction workflow: supply f, derive g automatically
export function tryBuildInverse<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): Homomorphism<B, A> | null {
  const map = new Map<B, A>();
  
  // Build the inverse map by checking injectivity
  for (const a of elemsA) {
    const b = f.map(a);
    if (map.has(b)) {
      return null; // Not injective - can't build inverse
    }
    map.set(b, a);
  }
  
  // Check surjectivity - every element in target must be mapped to
  for (const b of elemsB) {
    if (!map.has(b)) {
      return null; // Not surjective - can't build complete inverse
    }
  }
  
  // Construct the inverse homomorphism
  return {
    source: f.target,
    target: f.source,
    map: (b: B) => {
      const result = map.get(b);
      if (result === undefined) {
        throw new Error(`No inverse found for ${b}`);
      }
      return result;
    }
  };
}

// Complete workflow: try building inverse and verify it's a homomorphism
export function buildAndVerifyInverse<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): {
  inverse: Homomorphism<B, A> | null;
  isIsomorphism: boolean;
  verification: ReturnType<typeof checkIsCompleteInverse> | null;
} {
  // Step 1: Try building the inverse
  const inverse = tryBuildInverse(f, elemsA, elemsB);
  
  if (inverse === null) {
    return {
      inverse: null,
      isIsomorphism: false,
      verification: null
    };
  }
  
  // Step 2: Verify the inverse is a homomorphism and satisfies round-trip laws
  const verification = checkIsCompleteInverse(f, inverse, elemsA, elemsB);
  
  return {
    inverse,
    isIsomorphism: verification.isCompleteInverse,
    verification
  };
}

// Automated isomorphism detection workflow
export function detectIsomorphism<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  elemsB: B[]
): {
  isIsomorphism: boolean;
  inverse: Homomorphism<B, A> | null;
  proof: {
    step1_buildable: boolean;
    step2_homomorphism: boolean;
    step3_roundTrip: boolean;
  };
} {
  // Step 1: Can we build an inverse function?
  const inverse = tryBuildInverse(f, elemsA, elemsB);
  const step1_buildable = inverse !== null;
  
  if (!step1_buildable) {
    return {
      isIsomorphism: false,
      inverse: null,
      proof: {
        step1_buildable: false,
        step2_homomorphism: false,
        step3_roundTrip: false
      }
    };
  }
  
  // Step 2: Is the inverse a homomorphism?
  const verification = checkIsCompleteInverse(f, inverse, elemsA, elemsB);
  const step2_homomorphism = verification.gIsHomomorphism;
  
  // Step 3: Do the round-trip laws hold?
  const step3_roundTrip = verification.leftIdentity && verification.rightIdentity;
  
  return {
    isIsomorphism: verification.isCompleteInverse,
    inverse,
    proof: {
      step1_buildable,
      step2_homomorphism,
      step3_roundTrip
    }
  };
}

// Brute-force isomorphism search for small groups
export function findIsomorphisms<A, B>(
  source: Group<A>,
  target: Group<B>,
  elemsA: A[],
  elemsB: B[]
): Array<{
  forward: Homomorphism<A, B>;
  backward: Homomorphism<B, A>;
  verification: ReturnType<typeof checkIsCompleteInverse>;
}> {
  const isomorphisms: Array<{
    forward: Homomorphism<A, B>;
    backward: Homomorphism<B, A>;
    verification: ReturnType<typeof checkIsCompleteInverse>;
  }> = [];
  
  // Generate all possible bijections from A to B
  const bijections = generateBijections(elemsA, elemsB);
  
  for (const bijection of bijections) {
    const forward: Homomorphism<A, B> = {
      source,
      target,
      map: bijection
    };
    
    const result = buildAndVerifyInverse(forward, elemsA, elemsB);
    
    if (result.isIsomorphism && result.inverse && result.verification) {
      isomorphisms.push({
        forward,
        backward: result.inverse,
        verification: result.verification
      });
    }
  }
  
  return isomorphisms;
}

// Helper function to generate all bijections between two sets
function generateBijections<A, B>(elemsA: A[], elemsB: B[]): Array<(a: A) => B> {
  if (elemsA.length !== elemsB.length) {
    return []; // No bijections possible
  }
  
  const bijections: Array<(a: A) => B> = [];
  const n = elemsA.length;
  
  // Generate all permutations of elemsB
  const permutations = generatePermutations(elemsB);
  
  for (const perm of permutations) {
    const bijection = (a: A) => {
      const index = elemsA.indexOf(a);
      return perm[index];
    };
    bijections.push(bijection);
  }
  
  return bijections;
}

// Helper function to generate all permutations of an array
function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) {
    return [arr];
  }
  
  const permutations: T[][] = [];
  
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const subPermutations = generatePermutations(remaining);
    
    for (const subPerm of subPermutations) {
      permutations.push([current, ...subPerm]);
    }
  }
  
  return permutations;
}

// Utility to check if two groups are isomorphic
export function areGroupsIsomorphic<A, B>(
  source: Group<A>,
  target: Group<B>,
  elemsA: A[],
  elemsB: B[]
): boolean {
  const isomorphisms = findIsomorphisms(source, target, elemsA, elemsB);
  return isomorphisms.length > 0;
}

// Utility to count isomorphisms between two groups
export function countIsomorphisms<A, B>(
  source: Group<A>,
  target: Group<B>,
  elemsA: A[],
  elemsB: B[]
): number {
  const isomorphisms = findIsomorphisms(source, target, elemsA, elemsB);
  return isomorphisms.length;
}