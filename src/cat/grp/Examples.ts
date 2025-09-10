import { FinGroup, FinGroupMor, makeFinGroup } from "./FinGrp";

// Klein four-group as Z2 × Z2
export function kleinAsZ2xZ2(): FinGroup<[number, number]> {
  return makeFinGroup({
    carrier: [[0,0], [0,1], [1,0], [1,1]],
    e: [0,0],
    op: ([a1,b1], [a2,b2]) => [(a1 + a2) % 2, (b1 + b2) % 2],
    inv: ([a,b]) => [a, b], // in Z2, every element is its own inverse
    eq: ([a1,b1], [a2,b2]) => a1 === a2 && b1 === b2
  });
}

// Klein four-group as rectangle symmetries
export function kleinAsRectOps(): FinGroup<string> {
  return makeFinGroup({
    carrier: ["id", "H", "V", "R"], // identity, horizontal flip, vertical flip, 180° rotation
    e: "id",
    op: (op1, op2) => {
      // Composition table for Klein four-group
      // H = horizontal flip, V = vertical flip, R = 180° rotation
      // R = H ∘ V (composition of flips)
      const table: Record<string, Record<string, string>> = {
        "id": { "id": "id", "H": "H", "V": "V", "R": "R" },
        "H": { "id": "H", "H": "id", "V": "R", "R": "V" },
        "V": { "id": "V", "H": "R", "V": "id", "R": "H" },
        "R": { "id": "R", "H": "V", "V": "H", "R": "id" }
      };
      return table[op1][op2];
    },
    inv: (op) => op, // all elements are their own inverse
    eq: (op1, op2) => op1 === op2
  });
}

// Check if two groups are isomorphic by brute force search
export function isIsomorphic<A, B>(G1: FinGroup<A>, G2: FinGroup<B>): boolean {
  // Groups must have the same size
  if (G1.carrier.length !== G2.carrier.length) return false;
  
  // For small groups, we can do a brute force search
  if (G1.carrier.length > 8) return false; // limit search space
  
  // Try all possible bijections
  const elements1 = G1.carrier;
  const elements2 = G2.carrier;
  
  // Generate all permutations of elements2
  function* permutations<T>(arr: T[]): Generator<T[]> {
    if (arr.length <= 1) {
      yield arr;
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of permutations(rest)) {
        yield [arr[i], ...perm];
      }
    }
  }
  
  // Check each permutation
  for (const perm of permutations(elements2)) {
    // Create a bijection
    const bijection = new Map<A, B>();
    for (let i = 0; i < elements1.length; i++) {
      bijection.set(elements1[i], perm[i]);
    }
    
    // Check if it's a group homomorphism
    let isHomomorphism = true;
    for (const a of elements1) {
      for (const b of elements1) {
        const ab = G1.op(a, b);
        const fa = bijection.get(a)!;
        const fb = bijection.get(b)!;
        const fab = G2.op(fa, fb);
        const fab_expected = bijection.get(ab)!;
        
        if (!G2.eq(fab, fab_expected)) {
          isHomomorphism = false;
          break;
        }
      }
      if (!isHomomorphism) break;
    }
    
    if (isHomomorphism) return true;
  }
  
  return false;
}
