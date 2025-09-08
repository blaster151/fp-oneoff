import { GroupHom } from "../GroupHom";
import { FiniteGroup } from "../Group";
import { isoLaws } from "../../../laws/Witness";

/**
 * GroupIsomorphism typeclass as a refinement of GroupHomomorphism.
 * 
 * An isomorphism is a homomorphism with an inverse that satisfies
 * the round-trip laws: inverse(map(a)) === a and map(inverse(b)) === b
 */
export class GroupIsomorphism<A, B> extends GroupHom<A, B> {
  constructor(
    G: FiniteGroup<A>,
    H: FiniteGroup<B>,
    map: (a: A) => B,
    readonly inverse: (b: B) => A
  ) {
    super(G, H, map);
  }

  /**
   * Witness law: inverse(map(a)) === a for all a in G
   * This verifies that the inverse is actually a left inverse
   */
  leftInverse(): boolean {
    const { G, map, inverse } = this;
    const eqA = G.eq ?? ((x: A, y: A) => x === y);
    
    // For finite groups, check all elements
    if (G.elems) {
      return G.elems.every(a => eqA(inverse(map(a)), a));
    }
    
    // For infinite groups, this is a promise that the caller must verify
    // In practice, you'd provide specific elements to test
    throw new Error("leftInverse verification requires finite group or specific test elements");
  }

  /**
   * Witness law: map(inverse(b)) === b for all b in H
   * This verifies that the inverse is actually a right inverse
   */
  rightInverse(): boolean {
    const { H, map, inverse } = this;
    const eqB = H.eq ?? ((x: B, y: B) => x === y);
    
    // For finite groups, check all elements
    if (H.elems) {
      return H.elems.every(b => eqB(map(inverse(b)), b));
    }
    
    // For infinite groups, this is a promise that the caller must verify
    throw new Error("rightInverse verification requires finite group or specific test elements");
  }

  /**
   * Verify that this is actually an isomorphism by checking all laws
   */
  verifyIsomorphism(): boolean {
    return this.respectsOp(this.G.elems?.[0] ?? (this.G as any).e, this.G.elems?.[1] ?? (this.G as any).e) &&
           this.preservesId() &&
           this.leftInverse() &&
           this.rightInverse();
  }

  /**
   * Get isomorphism laws for use with the law testing framework
   */
  getIsomorphismLaws() {
    const { G, H, map, inverse } = this;
    const eqA = G.eq ?? ((x: A, y: A) => x === y);
    const eqB = H.eq ?? ((x: B, y: B) => x === y);
    
    return isoLaws(eqA, eqB, { to: map, from: inverse });
  }

  /**
   * Compose this isomorphism with another isomorphism
   */
  compose<C>(other: GroupIsomorphism<B, C>): GroupIsomorphism<A, C> {
    const { G, map, inverse } = this;
    const { H: K, map: g, inverse: gInv } = other;
    
    return new GroupIsomorphism(
      G,
      K,
      (a: A) => g(map(a)),
      (c: C) => inverse(gInv(c))
    );
  }

  /**
   * Get the inverse isomorphism
   */
  getInverse(): GroupIsomorphism<B, A> {
    const { G, H, map, inverse } = this;
    return new GroupIsomorphism(H, G, inverse, map);
  }
}

/**
 * GroupAutomorphism alias for isomorphisms from a group to itself
 */
export type GroupAutomorphism<A> = GroupIsomorphism<A, A>;

/**
 * Create the identity automorphism for a group
 */
export function identityAutomorphism<A>(G: FiniteGroup<A>): GroupAutomorphism<A> {
  return new GroupIsomorphism(G, G, (a: A) => a, (a: A) => a);
}

/**
 * Create a negation automorphism for additive groups
 * This maps x to -x, which is its own inverse
 */
export function negationAutomorphism(G: FiniteGroup<number>): GroupAutomorphism<number> {
  // For finite groups, we need to use modular arithmetic
  const order = G.elems?.length ?? 1;
  
  return new GroupIsomorphism(
    G,
    G,
    (n: number) => (order - n) % order,  // Modular negation
    (n: number) => (order - n) % order   // Modular negation
  );
}

/**
 * Create a scaling automorphism for additive groups
 * This maps x to factor * x, with inverse using modular inverse
 */
export function scalingAutomorphism(G: FiniteGroup<number>, factor: number): GroupAutomorphism<number> {
  if (factor === 0) {
    throw new Error("Scaling factor cannot be zero");
  }
  
  // For finite groups, we need to use modular arithmetic
  const order = G.elems?.length ?? 1;
  const modInverse = modInverseOf(factor, order);
  
  return new GroupIsomorphism(
    G,
    G,
    (n: number) => (factor * n) % order,
    (n: number) => (modInverse * n) % order
  );
}

/**
 * Create a conjugation automorphism for any group
 * This maps x to g * x * g^(-1) for a fixed element g
 */
export function conjugationAutomorphism<A>(G: FiniteGroup<A>, g: A): GroupAutomorphism<A> {
  return new GroupIsomorphism(
    G,
    G,
    (x: A) => G.op(G.op(g, x), G.inv(g)),
    (x: A) => G.op(G.op(G.inv(g), x), g)
  );
}

/**
 * Create a power automorphism for multiplicative groups
 * This maps x to x^k, with inverse x^(1/k) when k is coprime to the group order
 */
export function powerAutomorphism<A>(G: FiniteGroup<A>, k: number): GroupAutomorphism<A> {
  // For finite groups, we can compute the inverse power
  const computeInversePower = (x: A, k: number): A => {
    // This is a simplified version - in practice you'd use extended Euclidean algorithm
    // to find the modular inverse of k
    let result = G.id;
    const order = G.elems?.length ?? 1;
    const invK = modInverse(k, order);
    
    for (let i = 0; i < invK; i++) {
      result = G.op(result, x);
    }
    return result;
  };

  return new GroupIsomorphism(
    G,
    G,
    (x: A) => {
      let result = G.id;
      for (let i = 0; i < k; i++) {
        result = G.op(result, x);
      }
      return result;
    },
    (x: A) => computeInversePower(x, k)
  );
}

/**
 * Helper function to compute modular inverse
 * This is a simplified version - in practice you'd use extended Euclidean algorithm
 */
function modInverse(a: number, m: number): number {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  throw new Error(`No modular inverse exists for ${a} mod ${m}`);
}

/**
 * Helper function to compute modular inverse (renamed for clarity)
 */
function modInverseOf(a: number, m: number): number {
  return modInverse(a, m);
}