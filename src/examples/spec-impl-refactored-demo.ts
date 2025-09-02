// spec-impl-refactored-demo.ts
// Comprehensive demo of the refactored SpecImpl as explicit DoubleLaxFunctor

import { Finite, Rel, Subset } from "../types/rel-equipment.js";
import { 
  SpecImplFunctor, createSpecImplFunctor, createObjPair, 
  numericRangeAbstraction, stringCategoryAbstraction,
  verifySpecImplFunctor
} from "../types/spec-impl-refactored.js";
import { mkSurjection } from "../types/surjection-types.js";
import { Square } from "../types/double-lax-functor-interface.js";

console.log("=".repeat(80));
console.log("REFACTORED SPEC→IMPL DOUBLE LAX FUNCTOR DEMONSTRATION");
console.log("=".repeat(80));

export function demo() {
  console.log("\n1. EXPLICIT SURJECTION CONSTRUCTION");
  
  // Create explicit surjections with verification
  const specStates = new Finite(["idle", "loading", "processing", "validating", "complete", "failed", "retry"]);
  const implStates = new Finite(["inactive", "active", "finished"]);
  
  const stateClassifier = (state: string): string => {
    if (state === "idle") return "inactive";
    if (["loading", "processing", "validating", "retry"].includes(state)) return "active";
    return "finished"; // complete, failed
  };
  
  const stateSection = (category: string): string => {
    switch (category) {
      case "inactive": return "idle";
      case "active": return "processing";
      case "finished": return "complete";
      default: throw new Error(`Unknown category: ${category}`);
    }
  };
  
  console.log("State space abstraction:");
  console.log("  Spec states:", specStates.elems);
  console.log("  Impl states:", implStates.elems);
  console.log("  Compression ratio:", specStates.elems.length / implStates.elems.length);
  
  // Create verified surjection
  const stateSurjection = mkSurjection(specStates, implStates, stateClassifier, stateSection);
  console.log("  Surjection verified: ✅");
  
  console.log("\n2. SPEC→IMPL DOUBLE LAX FUNCTOR CONSTRUCTION");
  
  const functor = createSpecImplFunctor();
  
  // Add the state abstraction
  functor.addObject({
    spec: specStates,
    impl: implStates,
    surj: stateSurjection
  });
  
  // Add a numeric abstraction
  const numericPair = numericRangeAbstraction(
    [0, 1, 5, 10, 15, 25, 50, 100],
    [
      { min: 0, max: 5, label: "low" },
      { min: 6, max: 25, label: "medium" },
      { min: 26, max: 100, label: "high" }
    ]
  );
  functor.addObject(numericPair);
  
  console.log("Added abstractions:");
  console.log("  State abstraction: 7 → 3 states");
  console.log("  Numeric abstraction: 8 → 3 ranges");
  
  console.log("\n3. DOUBLE LAX FUNCTOR INTERFACE VERIFICATION");
  
  // Test object mapping
  const mappedStates = functor.onObj(specStates);
  const mappedNumbers = functor.onObj(numericPair.spec);
  
  console.log("Object mappings:");
  console.log("  F(specStates):", mappedStates.elems);
  console.log("  F(numbers):", mappedNumbers.elems);
  
  // Test relation mapping
  const specTransition = Rel.fromPairs(specStates, specStates, [
    ["idle", "loading"],
    ["loading", "processing"],
    ["processing", "validating"],
    ["validating", "complete"],
    ["validating", "failed"],
    ["failed", "retry"],
    ["retry", "processing"]
  ]);
  
  const implTransition = functor.onH(specTransition);
  console.log("\nRelation mappings:");
  console.log("  Spec transitions:", specTransition.toPairs().length, "pairs");
  console.log("  Impl transitions:", implTransition.toPairs().length, "pairs");
  console.log("  Abstract transitions:", implTransition.toPairs().map(([a,b]) => `${a}→${b}`).join(', '));
  
  console.log("\n4. LAX SQUARE PRESERVATION");
  
  // Create a square to test
  const identityFun = (s: string) => s;
  const testSquare: Square<string, string, string, string> = {
    A: specStates,
    B: specStates,
    A1: specStates,
    B1: specStates,
    f: identityFun,
    g: identityFun,
    R: specTransition,
    R1: specTransition
  };
  
  const squareResult = functor.squareLax(testSquare);
  console.log("Square preservation test:");
  console.log("  Inclusion holds:", squareResult.witness.holds ? "✅" : "❌");
  console.log("  Coverage:", (squareResult.witness.coverage! * 100).toFixed(1) + "%");
  
  if (squareResult.witness.counterexamples) {
    console.log("  Counterexamples:", squareResult.witness.counterexamples.length);
  }
  
  console.log("\n5. WEAKEST PRECONDITION TRANSPORT");
  
  // Create a simple program relation
  const program = Rel.fromPairs(specStates, specStates, [
    ["idle", "idle"],
    ["idle", "loading"],
    ["loading", "processing"],
    ["processing", "complete"],
    ["failed", "retry"]
  ]);
  
  // Abstract postcondition: "finished" states
  const abstractPost = Subset.by(implStates, (s: string) => s === "finished");
  
  const wpResult = functor.checkWpTransport(specStates, implStates, program, abstractPost);
  
  console.log("WP transport verification:");
  console.log("  Transport equation holds:", wpResult.holds ? "✅" : "❌");
  console.log("  LHS (γ∘wp∘F):", wpResult.lhs.toArray());
  console.log("  RHS (wp∘γ):", wpResult.rhs.toArray());
  
  console.log("\n6. PROPERTY PRESERVATION ANALYSIS");
  
  // Test functional property preservation
  const functionalTest = functor.checkPropertyPreservation(
    (R: Rel<any, any>) => R.isFunctional(),
    program
  );
  
  console.log("Property preservation (functional):");
  console.log("  Spec satisfies:", functionalTest.specSatisfies ? "✅" : "❌");
  console.log("  Impl satisfies:", functionalTest.implSatisfies ? "✅" : "❌");
  console.log("  Preserved:", functionalTest.preserves ? "✅" : "❌");
  
  // Test total property preservation
  const totalTest = functor.checkPropertyPreservation(
    (R: Rel<any, any>) => R.isTotal(),
    specTransition
  );
  
  console.log("Property preservation (total):");
  console.log("  Spec satisfies:", totalTest.specSatisfies ? "✅" : "❌");
  console.log("  Impl satisfies:", totalTest.implSatisfies ? "✅" : "❌");
  console.log("  Preserved:", totalTest.preserves ? "✅" : "❌");
  
  console.log("\n7. ABSTRACTION QUALITY ANALYSIS");
  
  const stateAnalysis = functor.analyzeAbstraction(specStates);
  console.log("State abstraction analysis:");
  console.log("  Compression ratio:", stateAnalysis.compressionRatio.toFixed(2) + ":1");
  console.log("  Is injective:", stateAnalysis.isInjective ? "✅" : "❌");
  console.log("  Kernel size:", stateAnalysis.surjectionKernel.length, "pairs");
  
  console.log("  Fiber sizes:");
  for (const [impl, size] of stateAnalysis.fiberSizes.entries()) {
    console.log(`    ${impl}: ${size} elements`);
  }
  
  const numericAnalysis = functor.analyzeAbstraction(numericPair.spec);
  console.log("\nNumeric abstraction analysis:");
  console.log("  Compression ratio:", numericAnalysis.compressionRatio.toFixed(2) + ":1");
  console.log("  Is injective:", numericAnalysis.isInjective ? "✅" : "❌");
  
  console.log("\n8. COMPREHENSIVE VERIFICATION");
  
  // Create multiple test squares
  const testSquares: Array<Square<any, any, any, any>> = [
    testSquare,
    {
      A: numericPair.spec,
      B: numericPair.spec,
      A1: numericPair.spec,
      B1: numericPair.spec,
      f: (n: number) => n,
      g: (n: number) => n,
      R: Rel.fromPairs(numericPair.spec, numericPair.spec, [[0, 1], [5, 10], [25, 50]]),
      R1: Rel.fromPairs(numericPair.spec, numericPair.spec, [[0, 1], [5, 10], [25, 50]])
    }
  ];
  
  const verification = verifySpecImplFunctor(functor, testSquares);
  
  console.log("Comprehensive verification:");
  console.log("  All squares lax:", verification.allSquaresLax ? "✅" : "❌");
  console.log("  Average coverage:", (verification.avgCoverage * 100).toFixed(1) + "%");
  console.log("  Individual results:");
  
  for (let i = 0; i < verification.squareResults.length; i++) {
    const result = verification.squareResults[i]!;
    console.log(`    Square ${i + 1}: ${result.holds ? "✅" : "❌"} (${(result.witness.coverage! * 100).toFixed(1)}%)`);
  }
  
  console.log("\n9. MATHEMATICAL FOUNDATIONS");
  
  console.log("Theoretical guarantees demonstrated:");
  console.log("  • Surjections with constructive sections (p∘s = id)");
  console.log("  • Lax square preservation with inclusion witnesses");
  console.log("  • WP transport for multi-level verification");
  console.log("  • Property preservation analysis for abstraction soundness");
  console.log("  • Systematic abstraction via categorical coarsening");
  
  console.log("\n10. PRACTICAL APPLICATIONS");
  
  console.log("Real-world applications enabled:");
  console.log("  • Model checking at multiple abstraction levels");
  console.log("  • Verification that scales from concrete to abstract");
  console.log("  • Automatic coarsening with mathematical guarantees");
  console.log("  • Compositional reasoning about system refinements");
  console.log("  • Property-preserving transformations with witnesses");

  console.log("\n" + "=".repeat(80));
  console.log("REFACTORED SPEC→IMPL FEATURES:");
  console.log("✓ Explicit DoubleLaxFunctor interface implementation");
  console.log("✓ Proper surjection types with witness verification");
  console.log("✓ Inclusion witnesses for lax square preservation");
  console.log("✓ Comprehensive property preservation analysis");
  console.log("✓ Abstraction quality metrics and analysis");
  console.log("✓ Mathematical rigor with categorical foundations");
  console.log("✓ Practical utilities for real-world abstractions");
  console.log("=".repeat(80));
}

demo();