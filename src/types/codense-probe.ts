/** @math THM-CODENSE-PROBE */

import { SetObj } from "./catkit-kan.js";
import { mkCodensityMonad } from "./codensity-monad.js";
import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor } from "./catkit-kan.js";

export function probeCodense<CatB>(
  B: SmallCategory<any, any> & { objects: ReadonlyArray<any>; morphisms: ReadonlyArray<any> },
  G: SetFunctor<any, any>,
  As: Array<SetObj<any>>
) {
  const { T, eta } = mkCodensityMonad(B as any, G as any);
  
  return As.map(A => {
    const TA = T.obj(A);
    const cardA = A.elems.length;
    const cardTA = TA.elems.length;
    const sameCard = cardTA === cardA;
    
    // Try a naive retraction r: T(A) -> A via η^-1 on singletons (when ultrafilter-like)
    const sample = A.elems[0];
    const t = eta(A)(sample);
    const roundTrip = true; // placeholder (domain-specific; we log card only)
    
    return { 
      A, 
      cardA,
      cardTA,
      sameCard, 
      roundTrip,
      ratio: cardTA / cardA,
      note: sameCard ? "Potential codense case" : `Expansion ratio: ${(cardTA / cardA).toFixed(1)}`
    };
  });
}

/**
 * Batch test multiple categories and functors for codense behavior
 */
export function batchProbeCodense(
  tests: Array<{
    name: string;
    B: SmallCategory<any, any> & { objects: ReadonlyArray<any>; morphisms: ReadonlyArray<any> };
    G: SetFunctor<any, any>;
    testSets: Array<SetObj<any>>;
  }>
) {
  console.log("🔍 BATCH CODENSE PROBE");
  console.log("=" .repeat(40));
  
  const results = tests.map(({ name, B, G, testSets }) => {
    console.log(`\\nTesting ${name}:`);
    const probeResults = probeCodense(B, G, testSets);
    
    probeResults.forEach((result, i) => {
      const setName = `A${i+1}`;
      console.log(`  ${setName}: |A|=${result.cardA}, |T^G(A)|=${result.cardTA}, ${result.note}`);
    });
    
    const codenseCases = probeResults.filter(r => r.sameCard).length;
    const totalCases = probeResults.length;
    
    console.log(`  Summary: ${codenseCases}/${totalCases} potentially codense`);
    
    return { name, probeResults, codenseCases, totalCases };
  });
  
  return results;
}

/**
 * Demonstrate codense probing with examples
 */
export function demonstrateCodenseProbingWithExamples() {
  console.log("🎯 CODENSE PROBE DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nPurpose:");
  console.log("  Heuristic detection of when T^G(A) ≅ A");
  console.log("  Not a mathematical proof, but useful for:");
  console.log("  • Identifying potential adjoint cases");
  console.log("  • Understanding codensity behavior patterns");
  console.log("  • Educational exploration of examples");
  
  console.log("\\nMethod:");
  console.log("  1. Compute |T^G(A)| and |A|");
  console.log("  2. Check if cardinalities match (sameCard)");
  console.log("  3. Calculate expansion ratio");
  console.log("  4. Look for patterns across multiple test sets");
  
  console.log("\\nExpected Patterns:");
  console.log("  • Identity functor: ratio ≈ 1 (adjoint case)");
  console.log("  • FinSet ↪ Set: ratio >> 1 (non-adjoint, ultrafilter case)");
  console.log("  • Complex functors: Various ratios depending on structure");
  
  console.log("\\nLimitations:");
  console.log("  • Heuristic only - not a mathematical proof");
  console.log("  • Cardinality-based detection (may miss structural isomorphisms)");
  console.log("  • Best for small finite examples");
  
  console.log("\\n🎉 Codense probe: Ready for mathematical exploration!");
}