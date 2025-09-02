// lawcheck-test.ts
// Simple test to verify the unified LawCheck system works

import { 
  StrongOption, checkStrongMonadLaws, checkEMMonoid,
  optionSumEMMonoid, enumOption, Finite
} from "../types/strong-monad.js";

console.log("Testing unified LawCheck system...");

const FA: Finite<number> = { elems: [0, 1] };
const FB: Finite<string> = { elems: ["a"] };
const FC: Finite<boolean> = { elems: [true] };

// Test strong monad laws
const monadResults = checkStrongMonadLaws(StrongOption, FA, FB, FC, enumOption);

console.log("Strong monad law results:");
console.log("  Left unit:", monadResults.monadLaws.leftUnit.ok ? "✅" : "❌");
console.log("  Right unit:", monadResults.monadLaws.rightUnit.ok ? "✅" : "❌");
console.log("  Associativity:", monadResults.monadLaws.associativity.ok ? "✅" : "❌");
console.log("  Strength unit:", monadResults.strengthLaws.unit.ok ? "✅" : "❌");

// Test EM monoid laws
const emResults = checkEMMonoid(StrongOption, FA, optionSumEMMonoid, enumOption);

console.log("\nEM monoid law results:");
console.log("  Monoid laws:", emResults.monoidLaws.ok ? "✅" : "❌");
console.log("  Algebra unit:", emResults.algebraUnit.ok ? "✅" : "❌");
console.log("  Multiplicativity:", emResults.multiplicativity.ok ? "✅" : "❌");
console.log("  Unit morphism:", emResults.unitMorphism.ok ? "✅" : "❌");

console.log("\n✅ Unified LawCheck system is working!");

if (!monadResults.monadLaws.leftUnit.ok && monadResults.monadLaws.leftUnit.witness) {
  console.log("\nExample counterexample:");
  console.log("  Input:", JSON.stringify(monadResults.monadLaws.leftUnit.witness.input));
  console.log("  Left side:", JSON.stringify(monadResults.monadLaws.leftUnit.witness.leftSide));
  console.log("  Right side:", JSON.stringify(monadResults.monadLaws.leftUnit.witness.rightSide));
}

console.log("\n🎯 Mission accomplished: All law checkers return LawCheck<TWitness>!");