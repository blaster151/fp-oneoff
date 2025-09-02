// witness-core-demo.ts
// Core witness system demonstration focusing on the fundamental witness types

import { Finite, Rel } from "../types/rel-equipment.js";
import { 
  InclusionWitness, RelEqWitness, LawCheck,
  inclusionWitness, relEqWitness, formatWitness, lawCheck
} from "../types/witnesses.js";
import { mkSurjection, verifySurjection } from "../types/surjection-types.js";

console.log("=".repeat(80));
console.log("🔍 CORE WITNESS SYSTEM DEMONSTRATION 🔍");
console.log("=".repeat(80));

export function coreWitnessDemo() {
  console.log("\n1. 🔗 INCLUSION WITNESSES WITH COUNTEREXAMPLES");
  
  // Create test relations with clear inclusion relationships
  const A = new Finite([1, 2, 3, 4]);
  const B = new Finite(['a', 'b', 'c', 'd']);
  
  console.log(`Test domain A: [${A.elems.join(', ')}]`);
  console.log(`Test domain B: [${B.elems.join(', ')}]`);
  
  // Create relations with specific inclusion properties
  const R_small = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b']]);
  const R_large = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd']]);
  const R_different = Rel.fromPairs(A, B, [[1, 'a'], [3, 'c'], [4, 'd']]);
  
  console.log("\nRelations created:");
  console.log(`  R_small: ${R_small.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}`);
  console.log(`  R_large: ${R_large.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}`);
  console.log(`  R_different: ${R_different.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}`);
  
  // Test inclusion witnesses
  console.log("\nInclusion witness tests:");
  
  // Should hold: R_small ⊆ R_large
  const witness1 = inclusionWitness(R_large, R_small);
  console.log(`  R_small ⊆ R_large: ${formatWitness(witness1)}`);
  
  // Should fail: R_large ⊆ R_small  
  const witness2 = inclusionWitness(R_small, R_large);
  console.log(`  R_large ⊆ R_small: ${formatWitness(witness2)}`);
  
  // Should fail with specific counterexamples: R_small ⊆ R_different
  const witness3 = inclusionWitness(R_different, R_small);
  console.log(`  R_small ⊆ R_different: ${formatWitness(witness3)}`);
  
  console.log("\n2. ⚖️ RELATION EQUALITY WITNESSES");
  
  // Test relation equality with detailed witnesses
  console.log("\nEquality witness tests:");
  
  // Equal relations
  const R_copy = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b']]);
  const eqWitness1 = relEqWitness(R_small, R_copy);
  console.log(`  R_small = R_copy: ${formatWitness(eqWitness1)}`);
  
  // Unequal relations with detailed differences
  const eqWitness2 = relEqWitness(R_small, R_different);
  console.log(`  R_small = R_different: ${formatWitness(eqWitness2)}`);
  
  console.log("\n3. 📐 SURJECTION WITNESS VALIDATION");
  
  // Create and verify surjections with witness reporting
  console.log("\nSurjection witness tests:");
  
  const numbers = new Finite([0, 1, 2, 3, 4, 5, 6, 7]);
  const parities = new Finite(['even', 'odd']);
  
  const parityMap = (n: number) => n % 2 === 0 ? 'even' : 'odd';
  const paritySection = (p: string) => p === 'even' ? 0 : 1;
  
  try {
    const validSurj = mkSurjection(numbers, parities, parityMap, paritySection);
    const verification = verifySurjection(numbers, parities, validSurj);
    
    console.log("Valid surjection test:");
    console.log(`  ✅ Surjection created successfully`);
    console.log(`  ✅ Verification: ${verification.isValid}`);
    console.log(`  Examples: 6 → ${parityMap(6)}, ${paritySection('odd')} ← odd`);
    
  } catch (error) {
    console.log(`  ❌ Unexpected error: ${error}`);
  }
  
  // Test invalid surjection
  const incompleteCodomain = new Finite(['even', 'odd', 'prime']);
  try {
    const invalidSurj = mkSurjection(numbers, incompleteCodomain, parityMap, paritySection);
    console.log("❌ Invalid surjection was incorrectly accepted!");
  } catch (error) {
    console.log("Invalid surjection correctly rejected:");
    console.log(`  ✅ Error caught: ${(error as Error).message.slice(0, 60)}...`);
  }
  
  console.log("\n4. 🎯 LAW CHECK WITNESSES");
  
  // Demonstrate law check witness pattern
  console.log("\nLaw check witness pattern:");
  
  // Simple associativity test with witness
  const testAssociativity = (a: number, b: number, c: number): LawCheck<{a: number, b: number, c: number}> => {
    const left = (a + b) + c;
    const right = a + (b + c);
    
    return left === right
      ? { ok: true }
      : { ok: false, witness: { a, b, c } };
  };
  
  const assocTest1 = testAssociativity(1, 2, 3);
  const assocTest2 = testAssociativity(1, 2, Number.POSITIVE_INFINITY); // This will work
  
  console.log(`  Associativity(1,2,3): ${formatWitness(assocTest1)}`);
  console.log(`  Associativity(1,2,∞): ${formatWitness(assocTest2)}`);
  
  // Commutativity test
  const testCommutativity = (a: number, b: number): LawCheck<{a: number, b: number, left: number, right: number}> => {
    const left = a * b;
    const right = b * a;
    
    return left === right
      ? { ok: true }
      : { ok: false, witness: { a, b, left, right } };
  };
  
  const commTest = testCommutativity(2, 3);
  console.log(`  Commutativity(2,3): ${formatWitness(commTest)}`);
  
  console.log("\n5. 📊 WITNESS AGGREGATION");
  
  // Demonstrate combining multiple witnesses
  const allLawChecks = [assocTest1, assocTest2, commTest];
  const passedLaws = allLawChecks.filter(check => check.ok).length;
  const failedLaws = allLawChecks.length - passedLaws;
  
  console.log("Law check summary:");
  console.log(`  Total laws checked: ${allLawChecks.length}`);
  console.log(`  Passed: ${passedLaws} ✅`);
  console.log(`  Failed: ${failedLaws} ❌`);
  console.log(`  Success rate: ${(passedLaws / allLawChecks.length * 100).toFixed(1)}%`);
  
  console.log("\n6. 🌟 WITNESS SYSTEM BENEFITS");
  
  console.log("The unified witness system provides:");
  console.log("  ✓ Consistent structure: All failures report via witness types");
  console.log("  ✓ Detailed counterexamples: Exact pairs/elements that violate properties");
  console.log("  ✓ Composable verification: Witnesses can be combined and analyzed");
  console.log("  ✓ Human-readable output: Automatic formatting for debugging");
  console.log("  ✓ Programmatic analysis: Structured data for automated processing");
  console.log("  ✓ Educational value: Students can see exactly why properties fail");
  
  console.log("\n7. 🎯 MATHEMATICAL APPLICATIONS");
  
  console.log("Witness-driven mathematics enables:");
  console.log("  🔬 Debugging: Find exact counterexamples to failed theorems");
  console.log("  📚 Teaching: Show concrete violations of abstract properties");
  console.log("  🔧 Testing: Property-based tests with detailed failure reports");
  console.log("  ⚡ Performance: Identify bottlenecks in verification algorithms");
  console.log("  🌟 Research: Explore boundary conditions in mathematical structures");
  console.log("  🏗️ Verification: Formal proofs with constructive evidence");
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 CORE WITNESS SYSTEM DEMONSTRATED:");
  console.log("✓ Inclusion witnesses with missing pair enumeration");
  console.log("✓ Relation equality witnesses with difference reporting");
  console.log("✓ Surjection witnesses with constructive verification");
  console.log("✓ Law check witnesses with structured counterexamples");
  console.log("✓ Witness aggregation for comprehensive reporting");
  console.log("✓ Human-readable formatting for all witness types");
  console.log("✓ Mathematical debugging and educational applications");
  console.log("=".repeat(80));
  
  console.log("\n🌟 Witnesses transform abstract mathematical failures into concrete understanding! 🌟");
}

coreWitnessDemo();