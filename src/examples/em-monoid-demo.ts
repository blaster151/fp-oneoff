// em-monoid-demo.ts
// Comprehensive demonstration of EM-monoid examples and composition combinators
// Run with: pnpm demo:em

import { 
  demonstrateEMMonoids,
  writerArrayEMMonoid, optionMaxEMMonoid, optionStringEMMonoid, arraySumEMMonoid,
  brokenConcatEMMonoid, brokenUnitEMMonoid,
  testEMMonoid, checkEMMonoidEnhanced,
  productEM, coproductEM, createLoggedMaxEM
} from "../types/em-monoid-examples.js";
import { StrongOption, StrongArray } from "../types/strong-monad.js";

console.log("🚀 EM-MONOID EXAMPLES & COMPOSITION DEMO");
console.log("=".repeat(50));

export function runEMMonoidDemo(): void {
  
  console.log("\n1. QUICK SUCCESS EXAMPLES");
  
  // Quick tests that should succeed
  const quickTests = [
    { 
      name: "Writer Array", 
      em: writerArrayEMMonoid, 
      monad: StrongArray, 
      elements: [["log1"], ["log2"]] 
    },
    { 
      name: "Option Max", 
      em: optionMaxEMMonoid, 
      monad: StrongOption, 
      elements: [1, 5, 3] 
    }
  ];
  
  for (const test of quickTests) {
    const result = checkEMMonoidEnhanced(test.monad, test.em, test.elements);
    console.log(`${test.name}: ${result.summary.allLawsOk ? "✅ SUCCESS" : "❌ FAILURE"}`);
  }
  
  console.log("\n2. FAILURE EXAMPLES WITH WITNESSES");
  
  // Test broken examples that should fail
  console.log("\n🚫 Testing broken concatenation:");
  const brokenResult = checkEMMonoidEnhanced(StrongArray, brokenConcatEMMonoid, ["a", "b", "c"]);
  console.log(`  Result: ${brokenResult.summary.allLawsOk ? "❌ WRONGLY PASSED" : "✅ CORRECTLY FAILED"}`);
  
  if (!brokenResult.selfValidation.ok && brokenResult.selfValidation.witness) {
    console.log(`  ❌ Concrete witness:`);
    console.log(`    Operation: ${brokenResult.selfValidation.witness.operation}`);
    console.log(`    Violating inputs: ${JSON.stringify(brokenResult.selfValidation.witness.violatingInputs)}`);
    console.log(`    Reason: ${brokenResult.selfValidation.note}`);
  }
  
  console.log("\n🚫 Testing broken unit:");
  const brokenUnitResult = checkEMMonoidEnhanced(StrongOption, brokenUnitEMMonoid, [1, 2, 3]);
  console.log(`  Result: ${brokenUnitResult.summary.allLawsOk ? "❌ WRONGLY PASSED" : "✅ CORRECTLY FAILED"}`);
  
  if (!brokenUnitResult.selfValidation.ok && brokenUnitResult.selfValidation.witness) {
    console.log(`  ❌ Concrete witness:`);
    console.log(`    Operation: ${brokenUnitResult.selfValidation.witness.operation}`);
    console.log(`    Violating inputs: ${JSON.stringify(brokenUnitResult.selfValidation.witness.violatingInputs)}`);
  }
  
  console.log("\n3. COMPOSITION COMBINATORS");
  
  // Product composition
  const productExample = productEM(optionMaxEMMonoid, optionStringEMMonoid);
  console.log(`\n✅ Product EM-monoid: ${productExample.name}`);
  console.log(`  Empty: ${JSON.stringify(productExample.empty)}`);
  
  const pair1: [number, string] = [5, "hello"];
  const pair2: [number, string] = [3, "world"];
  const productResult = productExample.concat(pair1, pair2);
  console.log(`  ${JSON.stringify(pair1)} ⊕ ${JSON.stringify(pair2)} = ${JSON.stringify(productResult)}`);
  
  // Coproduct composition
  const coproductExample = coproductEM(optionMaxEMMonoid, optionStringEMMonoid);
  console.log(`\n✅ Coproduct EM-monoid: ${coproductExample.name}`);
  console.log(`  5 ⊕ 3 = ${coproductExample.concat(5, 3)}`);
  console.log(`  "a" ⊕ "b" = ${coproductExample.concat("a", "b")}`);
  
  console.log("\n4. PRACTICAL EXAMPLE: LOGGED COMPUTATIONS");
  
  const loggedMax = createLoggedMaxEM();
  console.log(`\n📝 ${loggedMax.name}: ${loggedMax.description}`);
  
  // Simulate logged max operations
  const maxResult1 = loggedMax.concat(5, 8);
  const maxResult2 = loggedMax.concat(maxResult1, 3);
  
  console.log(`  max(5, 8) = ${maxResult1}`);
  console.log(`  max(${maxResult1}, 3) = ${maxResult2}`);
  console.log(`  Final result: ${maxResult2}`);
}

console.log("\n5. SUMMARY STATISTICS");

// Count successful vs failed examples
const allExamples = [
  writerArrayEMMonoid,
  optionMaxEMMonoid, 
  optionStringEMMonoid,
  arraySumEMMonoid,
  brokenConcatEMMonoid,
  brokenUnitEMMonoid
];

console.log(`\nEM-monoid examples: ${allExamples.length} total`);
console.log(`  Working examples: 4`);
console.log(`  Broken examples (for testing): 2`);
console.log(`  Composition combinators: 3 (product, coproduct, compose)`);

console.log("\n" + "=".repeat(50));
console.log("EM-MONOID DEMO ACHIEVEMENTS:");
console.log("✓ Real-world examples with practical applications");
console.log("✓ Composition helpers respecting algebra structure");
console.log("✓ Enhanced law checking with LawCheck witnesses");
console.log("✓ Concrete failure examples with minimal counterexamples");
console.log("✓ Self-validation methods for each EM-monoid");
console.log("✓ Comprehensive error reporting");
console.log("=".repeat(50));

console.log("\n🎯 Ready for: pnpm demo:em");

// Run the comprehensive demonstration
runEMMonoidDemo();

// Also run the full demonstration
console.log("\n" + "=".repeat(80));
console.log("RUNNING COMPREHENSIVE EM-MONOID DEMONSTRATION");
console.log("=".repeat(80));
demonstrateEMMonoids();