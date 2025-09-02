// comprehensive-witness-demo.ts
// Comprehensive demonstration of the unified witness system across all categorical structures

import { Finite, Rel } from "../types/rel-equipment.js";
import { 
  InclusionWitness, RelEqWitness, LawCheck, SurjectionWitness,
  inclusionWitness, relEqWitness, formatWitness, formatWitnesses
} from "../types/witnesses.js";
import { mkSurjection, verifySurjection } from "../types/surjection-types.js";
import { SpecImplFunctor, createSpecImplFunctor } from "../types/spec-impl-refactored.js";
import { runComprehensiveLawChecks, printLawCheckReport } from "../types/rel-lawcheck-witnessed.js";
import { 
  StrongOption, checkEMMonoid, optionSumEMMonoid, enumOption
} from "../types/strong-monad.js";

console.log("=".repeat(80));
console.log("🔍 COMPREHENSIVE WITNESS SYSTEM DEMONSTRATION 🔍");
console.log("=".repeat(80));

export function witnessDemo() {
  console.log("\n1. 🔗 INCLUSION WITNESSES");
  
  // Create test relations
  const A = new Finite([1, 2, 3]);
  const B = new Finite(['a', 'b', 'c']);
  
  const R1 = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b']]);
  const R2 = Rel.fromPairs(A, B, [[1, 'a'], [2, 'b'], [3, 'c']]);
  const R3 = Rel.fromPairs(A, B, [[1, 'a'], [3, 'c']]);
  
  console.log("Testing inclusion witnesses:");
  
  // R1 ⊆ R2 (should hold)
  const witness1 = inclusionWitness(R2, R1);
  console.log(`  R1 ⊆ R2: ${formatWitness(witness1)}`);
  
  // R2 ⊆ R1 (should fail) 
  const witness2 = inclusionWitness(R1, R2);
  console.log(`  R2 ⊆ R1: ${formatWitness(witness2)}`);
  
  // R1 ⊆ R3 (should fail with specific counterexamples)
  const witness3 = inclusionWitness(R3, R1);
  console.log(`  R1 ⊆ R3: ${formatWitness(witness3)}`);
  
  console.log("\n2. ⚖️ RELATION EQUALITY WITNESSES");
  
  const eqWitness1 = relEqWitness(R1, R1);
  console.log(`  R1 = R1: ${formatWitness(eqWitness1)}`);
  
  const eqWitness2 = relEqWitness(R1, R3);
  console.log(`  R1 = R3: ${formatWitness(eqWitness2)}`);
  
  console.log("\n3. 📐 SURJECTION WITNESSES");
  
  // Create a valid surjection
  const domain = new Finite([0, 1, 2, 3, 4, 5]);
  const codomain = new Finite(['even', 'odd']);
  
  const p = (n: number) => n % 2 === 0 ? 'even' : 'odd';
  const s = (parity: string) => parity === 'even' ? 0 : 1;
  
  try {
    const surjection = mkSurjection(domain, codomain, p, s);
    const verification = verifySurjection(domain, codomain, surjection);
    
    console.log("Valid surjection created:");
    console.log(`  Verification: ${verification.isValid ? '✅' : '❌'}`);
    console.log(`  Domain size: ${domain.elems.length}`);
    console.log(`  Codomain size: ${codomain.elems.length}`);
    console.log(`  Example: 4 → ${p(4)}, ${s('even')} ← even`);
  } catch (error) {
    console.log(`  Surjection creation failed: ${error}`);
  }
  
  // Try an invalid surjection
  const invalidCodomain = new Finite(['even', 'odd', 'zero']);
  try {
    const invalidSurj = mkSurjection(domain, invalidCodomain, p, s);
    console.log("Invalid surjection somehow created - this shouldn't happen!");
  } catch (error) {
    console.log("Invalid surjection correctly rejected:");
    console.log(`  Error: ${(error as Error).message.slice(0, 80)}...`);
  }
  
  console.log("\n4. 🎯 LAX DOUBLE FUNCTOR WITNESSES");
  
  // Create a SpecImpl functor and test square preservation
  const functor = createSpecImplFunctor();
  
  // Add a simple abstraction
  const specStates = new Finite(['idle', 'working', 'complete']);
  const implStates = new Finite(['inactive', 'active']);
  
  const stateP = (s: string) => s === 'idle' ? 'inactive' : 'active';
  const stateS = (s: string) => s === 'inactive' ? 'idle' : 'working';
  
  try {
    const stateSurj = mkSurjection(specStates, implStates, stateP, stateS);
    functor.addObject({ spec: specStates, impl: implStates, surj: stateSurj });
    
    // Test square preservation
    const specRel = Rel.fromPairs(specStates, specStates, [
      ['idle', 'working'],
      ['working', 'complete']
    ]);
    
    const identityFun = (s: string) => s;
    const testSquare = {
      A: specStates,
      B: specStates,
      A1: specStates,
      B1: specStates,
      f: identityFun,
      g: identityFun,
      R: specRel,
      R1: specRel
    };
    
    const squareResult = functor.squareLax(testSquare);
    
    console.log("Lax square preservation test:");
    console.log(`  Square inclusion holds: ${squareResult.witness.holds ? '✅' : '❌'}`);
    console.log(`  Left side pairs: ${squareResult.left.toPairs().length}`);
    console.log(`  Right side pairs: ${squareResult.right.toPairs().length}`);
    
    if (!squareResult.witness.holds) {
      console.log(`  Missing pairs: ${squareResult.witness.missing.length}`);
      console.log(`  Examples: ${JSON.stringify(squareResult.witness.missing.slice(0, 2))}`);
    }
    
  } catch (error) {
    console.log(`  Functor test failed: ${error}`);
  }
  
  console.log("\n5. 🌟 STRONG MONAD WITNESSES");
  
  // Test EM monoid laws with witnesses
  const testCarrier = { elems: [0, 1] };
  const emResult = checkEMMonoid(StrongOption, testCarrier, optionSumEMMonoid, enumOption);
  
  console.log("EM monoid law checking:");
  console.log(`  Monoid laws: ${emResult.monoid ? '✅' : '❌'}`);
  console.log(`  Algebra unit: ${emResult.algebraUnit ? '✅' : '❌'}`);
  console.log(`  Multiplicativity: ${emResult.mulHom ? '✅' : '❌'}`);
  console.log(`  Unit morphism: ${emResult.unitHom ? '✅' : '❌'}`);
  
  if (emResult.errors.length > 0) {
    console.log("  Errors detected:");
    for (const error of emResult.errors.slice(0, 3)) {
      console.log(`    • ${error}`);
    }
  }
  
  console.log("\n6. 🔬 COMPREHENSIVE RELATIONAL LAW WITNESSES");
  
  console.log("Running comprehensive relational law checks with witness reporting...");
  const lawReport = runComprehensiveLawChecks(20, 123);
  
  console.log("\nLaw check summary:");
  console.log(`  Total checks: ${lawReport.summary.totalChecks}`);
  console.log(`  Success rate: ${(lawReport.summary.successRate * 100).toFixed(1)}%`);
  console.log(`  Failed laws: ${lawReport.summary.failed}`);
  
  // Show a few specific results
  console.log("\nSpecific law results:");
  console.log(`  Residual adjunctions: ${formatWitness(lawReport.residualAdjunctions.leftResidualLaw)}`);
  console.log(`  WP/SP adjunctions: ${formatWitness(lawReport.transformerAdjunctions.wpSpAdjunction)}`);
  console.log(`  Galois connections: ${formatWitness(lawReport.galoisConnections.existsPreimageAdjunction)}`);
  console.log(`  Allegory laws: ${formatWitness(lawReport.allegoryLaws.daggerInvolution)}`);
  
  console.log("\n7. 📊 WITNESS SYSTEM BENEFITS");
  
  console.log("Unified witness system provides:");
  console.log("  ✓ Consistent counterexample reporting across all structures");
  console.log("  ✓ Detailed failure analysis for mathematical debugging");
  console.log("  ✓ Structured witness types for programmatic analysis");
  console.log("  ✓ Human-readable formatting for educational purposes");
  console.log("  ✓ Integration with property-based testing frameworks");
  console.log("  ✓ Compositional witness combination for complex properties");
  
  console.log("\n8. 🎯 PRACTICAL APPLICATIONS");
  
  console.log("Witness-driven development enables:");
  console.log("  🔬 Mathematical debugging: Find exact counterexamples to failed laws");
  console.log("  📚 Educational tools: Show students why properties fail");
  console.log("  🔧 Automated testing: Property-based tests with detailed reports");
  console.log("  ⚡ Performance analysis: Identify bottlenecks in law checking");
  console.log("  🌟 Research tools: Investigate boundary cases in categorical structures");
  console.log("  🏗️ Software verification: Formal proofs with constructive witnesses");
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 WITNESS SYSTEM FEATURES DEMONSTRATED:");
  console.log("✓ Unified witness types across all categorical structures");
  console.log("✓ Detailed counterexample reporting for failures");
  console.log("✓ Structured witness composition and aggregation");
  console.log("✓ Human-readable formatting and pretty printing");
  console.log("✓ Integration with existing mathematical frameworks");
  console.log("✓ Comprehensive law checking with reproducible results");
  console.log("✓ Educational and research applications enabled");
  console.log("=".repeat(80));
  
  console.log("\n🌟 The witness system transforms abstract failures into concrete understanding!");
}

witnessDemo();