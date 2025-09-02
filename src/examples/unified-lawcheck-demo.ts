// unified-lawcheck-demo.ts  
// Comprehensive demonstration of the unified LawCheck witness system
// Shows concrete counterexamples for monad laws, EM laws, and relational laws

import { 
  StrongOption, StrongArray, checkStrongMonadLaws, checkEMMonoid,
  optionSumEMMonoid, arrayStringEMMonoid, enumOption, enumArray, Finite
} from "../types/strong-monad.js";
import { runAllTests, printTestSummary } from "../types/rel-lawcheck.js";
import { formatWitness, LawCheck } from "../types/witnesses.js";

console.log("=".repeat(80));
console.log("UNIFIED LAWCHECK WITNESS SYSTEM DEMONSTRATION");
console.log("=".repeat(80));

export function demonstrateUnifiedLawCheck(): void {
  console.log("\n1. STRONG MONAD LAW CHECKING WITH WITNESSES");
  
  const FA: Finite<number> = { elems: [0, 1, 2] };
  const FB: Finite<string> = { elems: ["a", "b"] };
  const FC: Finite<boolean> = { elems: [true, false] };
  
  console.log("\nChecking Option monad laws...");
  const strongLaws = checkStrongMonadLaws(StrongOption, FA, FB, FC, enumOption);
  
  console.log("Results with concrete witnesses:");
  console.log("  Left Unit:", formatWitness(strongLaws.monadLaws.leftUnit));
  console.log("  Right Unit:", formatWitness(strongLaws.monadLaws.rightUnit));
  console.log("  Associativity:", formatWitness(strongLaws.monadLaws.associativity));
  console.log("  Strength Unit:", formatWitness(strongLaws.strengthLaws.unit));
  
  // Show detailed witness if law fails
  if (!strongLaws.monadLaws.leftUnit.ok) {
    console.log("\n  ❌ Left Unit Counterexample:");
    const witness = strongLaws.monadLaws.leftUnit.witness;
    console.log(`    Input: ${JSON.stringify(witness?.input)}`);
    console.log(`    chain(of(${witness?.input}), k) = ${JSON.stringify(witness?.leftSide)}`);
    console.log(`    k(${witness?.input}) = ${JSON.stringify(witness?.rightSide)}`);
    if (witness?.shrunk) {
      console.log(`    Shrunk minimal case: ${JSON.stringify(witness.shrunk)}`);
    }
  }

  console.log("\n2. EILENBERG-MOORE MONOID LAW CHECKING WITH WITNESSES");
  
  console.log("\nChecking Option + Sum EM monoid...");
  const emResult = checkEMMonoid(StrongOption, FA, optionSumEMMonoid, enumOption);
  
  console.log("Results with concrete witnesses:");
  console.log("  Monoid Laws:", formatWitness(emResult.monoidLaws));
  console.log("  Algebra Unit:", formatWitness(emResult.algebraUnit));
  console.log("  Multiplicativity:", formatWitness(emResult.multiplicativity));
  console.log("  Unit Morphism:", formatWitness(emResult.unitMorphism));

  // Show detailed witness if law fails
  if (!emResult.algebraUnit.ok) {
    console.log("\n  ❌ Algebra Unit Counterexample:");
    const witness = emResult.algebraUnit.witness;
    console.log(`    Input: ${JSON.stringify(witness?.input)}`);
    console.log(`    alg(of(${witness?.input})) = ${JSON.stringify(witness?.leftSide)}`);
    console.log(`    Expected: ${JSON.stringify(witness?.rightSide)}`);
  }

  console.log("\n3. RELATIONAL LAW CHECKING WITH WITNESSES");
  
  console.log("\nRunning relational law tests (smaller sample)...");
  const relResults = runAllTests(10);
  
  console.log("Summary of witnessed law checking:");
  printTestSummary(relResults);
  
  // Show some concrete counterexamples
  const failedResidual = relResults.residualLaws.leftAdjunction.find(r => !r.ok);
  if (failedResidual) {
    console.log("\n  ❌ Residual Adjunction Counterexample:");
    const witness = failedResidual.witness;
    console.log(`    R: ${JSON.stringify(witness?.R?.slice(0, 3))}...`);
    console.log(`    X: ${JSON.stringify(witness?.X?.slice(0, 3))}...`);
    console.log(`    S: ${JSON.stringify(witness?.S?.slice(0, 3))}...`);
    console.log(`    Violating pair: ${JSON.stringify(witness?.violatingPair)}`);
  }

  console.log("\n4. WITNESS SYSTEM FEATURES");
  
  console.log("✓ Unified LawCheck<TWitness> return type across all law checkers");
  console.log("✓ Concrete counterexamples with exact failing inputs");
  console.log("✓ Shrunk minimal witnesses for better debugging");
  console.log("✓ Optional descriptive notes for each law");
  console.log("✓ Structured witness types for different law categories");
  console.log("✓ Pretty printing utilities for human-readable output");

  console.log("\n5. BENEFITS OF UNIFIED WITNESSES");
  
  console.log("• Debugging: See exactly which inputs cause law violations");
  console.log("• Testing: Concrete examples for regression tests");
  console.log("• Education: Understand why laws fail with real data");
  console.log("• Verification: Precise counterexamples for formal proofs");
  console.log("• Development: Quick identification of implementation bugs");

  console.log("\n6. WITNESS TYPES IMPLEMENTED");
  
  console.log("Monad Laws:");
  console.log("  • MonadLeftUnitWitness<T> - input, k, leftSide, rightSide, shrunk?");
  console.log("  • MonadRightUnitWitness<T> - input, leftSide, rightSide, shrunk?");
  console.log("  • MonadAssociativityWitness<T> - m, k, h, leftSide, rightSide, shrunk?");
  
  console.log("EM Monoid Laws:");
  console.log("  • EMAlgebraUnitWitness<T,A> - input, leftSide, rightSide, shrunk?");
  console.log("  • EMMultiplicativityWitness<T,A> - ta, tb, leftSide, rightSide, shrunk?");
  console.log("  • EMUnitMorphismWitness<T,A> - input, leftSide, rightSide, shrunk?");
  
  console.log("Relational Laws:");
  console.log("  • ResidualAdjunctionWitness<A,B,C> - R, X, S, violatingPair, shrunk?");
  console.log("  • TransformerAdjunctionWitness<State> - P, R, Q, violatingState, shrunk?");
  console.log("  • GaloisAdjunctionWitness<A,B> - f, P, Q, R, violatingElement, shrunk?");
  console.log("  • AllegoryLawWitness<A,B,C> - lawType, R, S, T, violatingPair, shrunk?");

  console.log("\n" + "=".repeat(80));
  console.log("🎯 MISSION ACCOMPLISHED:");
  console.log("All law checkers now return unified LawCheck<TWitness> with concrete");
  console.log("counterexamples, matching the Rel/Optics witness pattern!");
  console.log("=".repeat(80));
}

// Helper function to demonstrate witness extraction
function demonstrateWitnessExtraction(lawResult: LawCheck<any>, lawName: string): void {
  console.log(`\n${lawName}:`);
  if (lawResult.ok) {
    console.log("  ✅ Law satisfied");
    if (lawResult.note) {
      console.log(`  Note: ${lawResult.note}`);
    }
  } else {
    console.log("  ❌ Law violated");
    if (lawResult.note) {
      console.log(`  Note: ${lawResult.note}`);
    }
    if (lawResult.witness) {
      console.log(`  Witness: ${JSON.stringify(lawResult.witness, null, 2)}`);
    }
  }
}

// Run the demonstration
demonstrateUnifiedLawCheck();

console.log("\n" + "=".repeat(80));
console.log("WITNESS EXTRACTION EXAMPLES:");
console.log("=".repeat(80));

// Show how to extract and use witnesses programmatically
const quickTest = checkStrongMonadLaws(
  StrongOption, 
  { elems: [1] }, 
  { elems: ["x"] }, 
  { elems: [true] }, 
  enumOption
);

demonstrateWitnessExtraction(quickTest.monadLaws.leftUnit, "Left Unit Law");
demonstrateWitnessExtraction(quickTest.monadLaws.rightUnit, "Right Unit Law");
demonstrateWitnessExtraction(quickTest.strengthLaws.unit, "Strength Unit Law");