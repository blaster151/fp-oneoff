// ultrafilter-nat-bridge.ts
// Specialize Nat → Ultrafilter for our MiniFinSet (bool object = "2")
// Provides direct bridge from natural transformations to ultrafilter operations

import { SetObj } from "./catkit-kan.js";
import { NatTrans } from "./codensity-nat-bridge.js";
import type { Obj } from "./mini-finset.js";

/************ Ultrafilter Interface ************/

export interface Ultrafilter<A> {
  contains: (S: Set<A>) => boolean;
}

/************ Nat to Ultrafilter Conversion ************/

/**
 * Convert natural transformation to ultrafilter
 * Uses the Boolean component (object "2") to determine subset membership
 */
export function natToUltrafilter<A>(
  Aset: SetObj<A>,
  nat: NatTrans<Obj>
): Ultrafilter<A> {
  const contains = (S: Set<A>): boolean => {
    // Create characteristic function χ_S : A → 2
    const chi = (a: A) => S.has(a);
    
    // Apply natural transformation component at object "2" (Boolean)
    // Object "2" is the boolean object in our MiniFinSet
    const result = nat.at("2" as Obj)(chi as any);
    return result === true;
  };
  
  return { contains };
}

/**
 * Convert ultrafilter back to natural transformation component
 * This is the reverse direction for testing roundtrip properties
 */
export function ultrafilterToNatComponent<A>(
  Aset: SetObj<A>,
  U: Ultrafilter<A>
): (k: (a: A) => boolean) => boolean {
  return (k: (a: A) => boolean) => {
    // Interpret k as characteristic function of some subset
    // Find the subset S = {a ∈ A : k(a) = true}
    const S = new Set<A>();
    for (const a of Aset.elems) {
      if (k(a) === true) {
        S.add(a);
      }
    }
    
    // Return U(S)
    return U.contains(S);
  };
}

/************ Advanced Nat-Based Operations ************/

/**
 * Derive intersection law U(S ∩ T) = U(S) ∧ U(T) from naturality
 * Uses pairing and AND morphism in the rich MiniFinSet category
 * 
 * @law LAW-ULTRA-AND
 */
export function deriveIntersectionLaw<A>(
  Aset: SetObj<A>,
  nat: NatTrans<Obj>,
  S: Set<A>,
  T: Set<A>
): {
  intersection: boolean;
  conjunctionOfParts: boolean;
  lawHolds: boolean;
} {
  // Left side: U(S ∩ T) via direct intersection
  const intersection = new Set<A>([...S].filter(a => T.has(a)));
  const chiIntersection = (a: A) => intersection.has(a);
  const leftSide = nat.at("2")(chiIntersection);
  
  // Right side: U(S) ∧ U(T) via pairing and AND
  const chiS = (a: A) => S.has(a);
  const chiT = (a: A) => T.has(a);
  
  // Create pairing function A → 2×2
  const pairing = (a: A): [boolean, boolean] => [chiS(a), chiT(a)];
  
  // Apply nat at "2×2" to get [U(S), U(T)]
  const pairResult = nat.at("2x2")(pairing as any) as [boolean, boolean];
  
  // Apply AND to the pair
  const rightSide = pairResult[0] && pairResult[1];
  
  return {
    intersection: leftSide === true,
    conjunctionOfParts: rightSide === true,
    lawHolds: leftSide === rightSide
  };
}

/**
 * Derive union law U(S ∪ T) = U(S) ∨ U(T) from naturality
 */
export function deriveUnionLaw<A>(
  Aset: SetObj<A>,
  nat: NatTrans<Obj>,
  S: Set<A>,
  T: Set<A>
): {
  union: boolean;
  disjunctionOfParts: boolean;
  lawHolds: boolean;
} {
  // Left side: U(S ∪ T) via direct union
  const union = new Set<A>([...S, ...T]);
  const chiUnion = (a: A) => union.has(a);
  const leftSide = nat.at("2")(chiUnion);
  
  // Right side: U(S) ∨ U(T) via pairing and OR
  const chiS = (a: A) => S.has(a);
  const chiT = (a: A) => T.has(a);
  
  const pairing = (a: A): [boolean, boolean] => [chiS(a), chiT(a)];
  const pairResult = nat.at("2x2")(pairing as any) as [boolean, boolean];
  const rightSide = pairResult[0] || pairResult[1];
  
  return {
    union: leftSide === true,
    disjunctionOfParts: rightSide === true,
    lawHolds: leftSide === rightSide
  };
}

/**
 * Test projection laws via π₁, π₂
 */
export function deriveProjectionLaws<A>(
  Aset: SetObj<A>,
  nat: NatTrans<Obj>,
  S: Set<A>,
  T: Set<A>
): {
  proj1Agrees: boolean;
  proj2Agrees: boolean;
} {
  const chiS = (a: A) => S.has(a);
  const chiT = (a: A) => T.has(a);
  const pairing = (a: A): [boolean, boolean] => [chiS(a), chiT(a)];
  
  // Get U(S) and U(T) directly
  const US = nat.at("2")(chiS);
  const UT = nat.at("2")(chiT);
  
  // Get them via projections from pairing
  const pairResult = nat.at("2x2")(pairing as any) as [boolean, boolean];
  const proj1Result = pairResult[0]; // π₁(⟨U(S), U(T)⟩)
  const proj2Result = pairResult[1]; // π₂(⟨U(S), U(T)⟩)
  
  return {
    proj1Agrees: US === proj1Result,
    proj2Agrees: UT === proj2Result
  };
}

/************ Demonstration Function ************/

export function demonstrateUltrafilterNatBridge(): void {
  console.log('='.repeat(70));
  console.log('🌉 ULTRAFILTER NAT BRIDGE DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📐 BRIDGE OPERATIONS:');
  console.log('   natToUltrafilter: Nat → Ultrafilter via Boolean component');
  console.log('   ultrafilterToNatComponent: Ultrafilter → Nat component');
  console.log('   deriveIntersectionLaw: U(S ∩ T) = U(S) ∧ U(T) from naturality');
  console.log('   deriveUnionLaw: U(S ∪ T) = U(S) ∨ U(T) from naturality');

  console.log('\n🎯 NATURALITY-BASED DERIVATIONS:');
  console.log('   ✓ Boolean algebra laws from categorical structure');
  console.log('   ✓ No principal-witness reasoning required');
  console.log('   ✓ Pure naturality and Boolean morphisms');
  console.log('   ✓ Categorical foundation for ultrafilter theory');

  console.log('='.repeat(70));
}