import { lawfulMonoid } from "./Monoid";
import { posetLaws, completeLatticeLaws } from "./Order";
import { isoLaws } from "./Witness";
import { runLaws } from "./Witness";
import { powersetLattice } from "../order/Lattice";
import { ZnRing } from "../structures/ring/Ring";

/**
 * Examples showing how to use the laws framework with existing mathematical structures.
 */

// Example 1: Testing ring laws using monoid laws for the multiplicative structure
export function testRingMultiplicativeLaws() {
  console.log("=== Ring Multiplicative Laws ===");
  
  const Z6 = ZnRing(6);
  
  // Test multiplicative monoid laws
  const multMonoid = {
    empty: Z6.one,
    concat: Z6.mul
  };
  
  const pack = lawfulMonoid("Ring/Z6/mult", Z6.eq, multMonoid, Z6.elems);
  const result = runLaws(pack.laws, { M: pack.struct, xs: Z6.elems });
  
  console.log("Multiplicative monoid laws:", result.ok ? "✅ PASS" : "❌ FAIL");
  if (!result.ok) {
    console.log("Failures:", result.failures.map(f => f.name));
  }
  
  return result;
}

// Example 2: Testing poset laws for divisibility ordering
export function testDivisibilityPoset() {
  console.log("\n=== Divisibility Poset Laws ===");
  
  const divisors = [1, 2, 3, 4, 6, 12];
  const divPoset = {
    elems: divisors,
    leq: (a: number, b: number) => b % a === 0, // a divides b
    eq: (a: number, b: number) => a === b
  };
  
  const laws = posetLaws(divPoset);
  const result = runLaws(laws, { P: divPoset });
  
  console.log("Divisibility poset laws:", result.ok ? "✅ PASS" : "❌ FAIL");
  if (!result.ok) {
    console.log("Failures:", result.failures.map(f => f.name));
  }
  
  return result;
}

// Example 3: Testing isomorphism between Z/6 and Z/2 × Z/3
export function testCRTIsomorphism() {
  console.log("\n=== CRT Isomorphism Laws ===");
  
  const eqZ6 = (a: number, b: number) => a === b;
  const eqZ2xZ3 = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
  
  const crtIso = {
    to: (x: number) => [x % 2, x % 3] as [number, number],
    from: (pair: [number, number]) => {
      // Chinese Remainder Theorem: find x such that x ≡ pair[0] (mod 2) and x ≡ pair[1] (mod 3)
      for (let x = 0; x < 6; x++) {
        if (x % 2 === pair[0] && x % 3 === pair[1]) {
          return x;
        }
      }
      return 0; // fallback
    }
  };
  
  const laws = isoLaws(eqZ6, eqZ2xZ3, crtIso);
  const result = runLaws(laws, {
    samplesA: [0, 1, 2, 3, 4, 5],
    samplesB: [[0, 0], [1, 1], [0, 2], [1, 0], [0, 1], [1, 2]]
  });
  
  console.log("CRT isomorphism laws:", result.ok ? "✅ PASS" : "❌ FAIL");
  if (!result.ok) {
    console.log("Failures:", result.failures.map(f => f.name));
  }
  
  return result;
}

// Example 4: Testing complete lattice laws for powerset of a small set
export function testPowersetLattice() {
  console.log("\n=== Powerset Lattice Laws ===");
  
  const U = [1, 2, 3, 4];
  const L = powersetLattice(U, (a, b) => a === b);
  
  const laws = completeLatticeLaws(L);
  const result = runLaws(laws, { L });
  
  console.log("Powerset lattice laws:", result.ok ? "✅ PASS" : "❌ FAIL");
  if (!result.ok) {
    console.log("Failures:", result.failures.map(f => f.name));
  }
  
  return result;
}

// Run all examples
export function runAllExamples() {
  console.log("🔬 Laws Framework Examples\n");
  
  const results = [
    testRingMultiplicativeLaws(),
    testDivisibilityPoset(),
    testCRTIsomorphism(),
    testPowersetLattice()
  ];
  
  const allPassed = results.every(r => r.ok);
  console.log(`\n📊 Overall: ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);
  
  return results;
}

// Export for use in tests or other modules
export const LawsExamples = {
  testRingMultiplicativeLaws,
  testDivisibilityPoset,
  testCRTIsomorphism,
  testPowersetLattice,
  runAllExamples
};