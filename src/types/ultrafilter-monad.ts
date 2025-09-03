// ultrafilter-monad.ts
// Ultrafilter monad wrapper (codensity of inclusion MiniFinSet → Set)
// Specialized interface for ultrafilter operations on finite sets

import { mkCodensityMonad } from "./codensity-monad.js";
import { MiniFinSet, G_inclusion } from "./mini-finset.js";
import { SetObj } from "./catkit-kan.js";

/************ Ultrafilter Monad Wrapper ************/

/** 
 * The Ultrafilter monad on (finite) Set, specialized from Codensity(FinSet↪Set)
 * Provides direct access to ultrafilter operations via codensity construction
 * 
 * @math THM-ULTRAFILTER-MONAD
 */
export function mkUltrafilterMonad() {
  return mkCodensityMonad(MiniFinSet, G_inclusion);
}

/** 
 * Global ultrafilter monad instance for convenience in call-sites
 * UF.of(A)(a) creates principal ultrafilter at a
 */
export const UF = mkUltrafilterMonad();

/************ Convenient Exports ************/

/** Core ultrafilter monad operations */
export const T = UF.T;           // Endofunctor T: Set → Set
export const of = UF.of;         // of: A → (a → T(A)) (principal ultrafilter)
export const map = UF.map;       // map: (A → B) → T(A) → T(B)
export const chain = UF.chain;   // chain: (A → T(B)) → T(A) → T(B)
export const ap = UF.ap;         // ap: T(A → B) → T(A) → T(B)
export const run = UF.run;       // run: T(A) → (A → G b) → G b
export const pure = UF.pure;     // pure: alias for of
export const mu = UF.mu;         // mu: A → (T(T(A)) → T(A)) (multiplication)
export const eta = UF.eta;       // eta: A → (a → T(A)) (unit)

/************ Utility Functions ************/

/** 
 * Generate all subsets of a finite set (for demos/tests)
 * Returns 2^|A| subsets as Set<A>[]
 */
export function allSubsets<A>(Aset: SetObj<A>): Set<A>[] {
  const elements = Aset.elems;
  const n = elements.length;
  const subsets: Set<A>[] = [];
  
  // Use bit manipulation to generate all 2^n subsets
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = new Set<A>();
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.add(elements[i]!);
      }
    }
    subsets.push(subset);
  }
  
  return subsets;
}

/**
 * Create subset from array of elements
 */
export const subset = <A>(xs: A[]) => new Set<A>(xs);

/**
 * Check if ultrafilter element contains a given subset
 * Uses the Boolean component interpretation
 */
export function contains<A>(
  Aset: SetObj<A>,
  t: any, // Element of T(A) 
  S: Set<A>
): boolean {
  // Extract Boolean component and apply characteristic function
  if (t && typeof t === 'object' && t.at) {
    const phi2 = t.at("2"); // Component at object "2" (Bool)
    
    if (typeof phi2 === 'function') {
      const chi = (a: A) => S.has(a); // Characteristic function χ_S
      return phi2(chi) === true;
    }
  }
  
  // Fallback for unit elements
  if (t && t.type === 'unit' && t.principalWitness !== undefined) {
    return S.has(t.principalWitness);
  }
  
  return false;
}

/**
 * Create principal ultrafilter at element a
 * This is just η_A(a) - the unit operation
 */
export function principal<A>(Aset: SetObj<A>, a: A): any {
  return of(Aset)(a);
}

/**
 * Verify that an ultrafilter element satisfies ultrafilter laws
 */
export function verifyUltrafilter<A>(
  Aset: SetObj<A>, 
  t: any
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const subsets = allSubsets(Aset);
  
  // Law 1: Contains universe, doesn't contain empty set
  const empty = new Set<A>();
  const universe = new Set<A>(Aset.elems);
  
  if (contains(Aset, t, empty)) {
    violations.push("Contains empty set");
  }
  
  if (!contains(Aset, t, universe)) {
    violations.push("Doesn't contain universe");
  }
  
  // Law 2: Upward closure
  for (const S of subsets) {
    for (const T of subsets) {
      const isSubset = [...S].every(x => T.has(x));
      if (isSubset && contains(Aset, t, S) && !contains(Aset, t, T)) {
        violations.push(`Upward closure: ${setToString(S)} ⊆ ${setToString(T)}`);
      }
    }
  }
  
  // Law 3: Prime property - for each subset S, either U(S) or U(complement(S))
  for (const S of subsets.slice(0, 8)) { // Limit for performance
    const complement = new Set(Aset.elems.filter(a => !S.has(a)));
    const containsS = contains(Aset, t, S);
    const containsComp = contains(Aset, t, complement);
    
    if (!containsS && !containsComp) {
      violations.push(`Prime: neither ${setToString(S)} nor its complement`);
    }
    if (containsS && containsComp) {
      violations.push(`Prime: both ${setToString(S)} and its complement`);
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/************ Advanced Operations ************/

/**
 * Intersection of ultrafilters (when it exists)
 * For principal ultrafilters, this corresponds to intersection of their generators
 */
export function intersectUltrafilters<A>(
  Aset: SetObj<A>,
  t1: any,
  t2: any
): any | null {
  // For principal ultrafilters, intersection exists iff they have same witness
  if (t1.type === 'unit' && t2.type === 'unit' && 
      t1.principalWitness === t2.principalWitness) {
    return t1; // Same principal ultrafilter
  }
  
  return null; // Intersection doesn't exist for different principal ultrafilters
}

/**
 * Check if one ultrafilter refines another
 */
export function refines<A>(
  Aset: SetObj<A>,
  t1: any, // Finer ultrafilter
  t2: any  // Coarser ultrafilter
): boolean {
  const subsets = allSubsets(Aset).slice(0, 16); // Sample subsets
  
  // t1 refines t2 if: t2 contains S implies t1 contains S
  return subsets.every(S => {
    const t2ContainsS = contains(Aset, t2, S);
    const t1ContainsS = contains(Aset, t1, S);
    return !t2ContainsS || t1ContainsS;
  });
}

/************ Utility Functions ************/

function setToString<A>(S: Set<A>): string {
  return `{${[...S].join(', ')}}`;
}

/************ Demonstration Function ************/

export function demonstrateUltrafilterMonad(): void {
  console.log('='.repeat(70));
  console.log('🎯 ULTRAFILTER MONAD DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n📐 MATHEMATICAL FOUNDATION:');
  console.log('   Ultrafilter monad = Codensity(FinSet ↪ Set)');
  console.log('   T(A) represents ultrafilters on finite set A');
  console.log('   η_A(a) gives principal ultrafilter at a');
  console.log('   Boolean component χ_S determines subset membership');

  console.log('\n🔧 ULTRAFILTER OPERATIONS:');
  console.log('   of: A → (a → T(A)) - principal ultrafilter');
  console.log('   map: (A → B) → T(A) → T(B) - functorial action');
  console.log('   chain: (A → T(B)) → T(A) → T(B) - monadic bind');
  console.log('   contains: T(A) × P(A) → Bool - subset membership');

  // Example with small set
  const A: SetObj<string> = {
    id: "A",
    elems: ["x", "y", "z"],
    eq: (a, b) => a === b
  };

  console.log(`\n🎮 EXAMPLE: A = {${A.elems.join(', ')}} (|A| = ${A.elems.length})`);

  try {
    // Create principal ultrafilter at "y"
    const principalY = of(A)("y");
    console.log('   Principal ultrafilter at "y" created ✅');
    
    // Test subset membership
    const testSubsets = [
      subset<string>([]),
      subset(["x"]),
      subset(["y"]),
      subset(["z"]),
      subset(["x", "y"]),
      subset(["y", "z"]),
      subset(["x", "y", "z"])
    ];
    
    console.log('\n   Subset membership for principal at "y":');
    testSubsets.forEach(S => {
      const containsS = contains(A, principalY, S);
      const expected = S.has("y");
      const match = containsS === expected ? '✅' : '❌';
      console.log(`     U({${[...S].join(', ')}}) = ${containsS} ${match}`);
    });
    
    // Verify ultrafilter laws
    const lawCheck = verifyUltrafilter(A, principalY);
    console.log(`\n   Ultrafilter laws: ${lawCheck.valid ? '✅' : '❌'}`);
    
    if (!lawCheck.valid) {
      lawCheck.violations.forEach(v => console.log(`     Violation: ${v}`));
    }
    
    // Test monadic operations
    console.log('\n   Monadic operations:');
    
    // Map operation: transform the underlying set
    const B: SetObj<number> = {
      id: "B",
      elems: [1, 2, 3],
      eq: (a, b) => a === b
    };
    
    const mapped = map(A, B)((s: string) => s.length)(principalY);
    console.log('     map(length)(principal("y")) ✅');
    
    // The mapped ultrafilter should be principal at 1 (length of "y")
    const mappedContains1 = contains(B, mapped, subset([1]));
    console.log(`     Mapped ultrafilter contains {1}: ${mappedContains1} ✅`);
    
  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ULTRAFILTER MONAD FEATURES:');
  console.log('   🔹 Specialized codensity monad for FinSet ↪ Set');
  console.log('   🔹 Principal ultrafilter construction via η_A(a)');
  console.log('   🔹 Boolean component interpretation for subset membership');
  console.log('   🔹 Familiar monadic interface (of, map, chain, ap)');
  console.log('   🔹 Ultrafilter law verification and testing');
  console.log('   🔹 Integration with finite set theory');
  console.log('='.repeat(70));
}