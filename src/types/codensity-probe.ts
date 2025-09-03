// codensity-probe.ts
// Tiny predicate/test helper for detecting when codensity behaves like identity
// Not a proof, but catches examples where T^G(A) ≅ A on finite playground

import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor, SetObj } from "./catkit-kan.js";
import { CodensitySet } from "./codensity-set.js";

/**
 * Test if codensity monad behaves like identity on a given set
 * 
 * This is not a mathematical proof of codensity, but a useful probe
 * for small finite examples to detect trivial cases.
 * 
 * @math THM-CODENSITY-ADJOINT-COLLAPSE @math STATUS-EXPLORATORY
 */
export function probeCodensity<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  G: SetFunctor<B_O, B_M>,
  Aset: SetObj<A>,
  keyB: (b: B_O) => string = (b) => String(b),
  keyBMor: (m: B_M) => string = (m) => String(m)
): {
  isCodenseLike: boolean;
  cardinalityRatio: number;
  note: string;
} {
  
  try {
    const { T } = CodensitySet(B as any, G, keyB, keyBMor);
    const TA = T.map(Aset);
    
    const cardA = Aset.card();
    const cardTA = TA.card();
    const ratio = cardTA / cardA;
    
    // Heuristic: if |T^G(A)| is close to |A|, might be "codense"
    const isCodenseLike = ratio < 2.0; // Very generous threshold
    
    let note = `|A| = ${cardA}, |T^G(A)| = ${cardTA}, ratio = ${ratio.toFixed(2)}`;
    
    if (isCodenseLike) {
      note += " (surprisingly small - possible adjoint case?)";
    } else if (ratio > 1000) {
      note += " (large expansion - typical codensity behavior)";
    } else {
      note += " (moderate expansion)";
    }
    
    return {
      isCodenseLike,
      cardinalityRatio: ratio,
      note
    };
    
  } catch (error) {
    return {
      isCodenseLike: false,
      cardinalityRatio: -1,
      note: `Computation failed: ${(error as Error).message}`
    };
  }
}

/**
 * Batch probe multiple sets to understand codensity behavior
 * 
 * @math THM-CODENSITY-ADJOINT-COLLAPSE
 */
export function batchProbeCodensity<B_O, B_M>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  G: SetFunctor<B_O, B_M>,
  testSets: Array<{ name: string; set: SetObj<any> }>,
  keyB: (b: B_O) => string = (b) => String(b),
  keyBMor: (m: B_M) => string = (m) => String(m)
): Array<{
  name: string;
  result: ReturnType<typeof probeCodensity>;
}> {
  
  console.log("🔍 BATCH CODENSITY PROBE");
  console.log("=" .repeat(40));
  
  const results = testSets.map(({ name, set }) => {
    console.log(`\\nProbing ${name}:`);
    const result = probeCodensity(B, G, set, keyB, keyBMor);
    console.log(`  ${result.note}`);
    
    return { name, result };
  });
  
  // Summary
  const codenseLike = results.filter(r => r.result.isCodenseLike);
  const expansive = results.filter(r => r.result.cardinalityRatio > 10);
  
  console.log(`\\n📊 Summary:`);
  console.log(`  Codense-like: ${codenseLike.length}/${results.length}`);
  console.log(`  Highly expansive: ${expansive.length}/${results.length}`);
  
  if (codenseLike.length > 0) {
    console.log(`  Possible adjoint cases: ${codenseLike.map(r => r.name).join(', ')}`);
  }
  
  return results;
}

/**
 * Quick demonstration of codensity probing
 * 
 * @math STATUS-EXPLORATORY
 */
export function demonstrateCodensityProbe() {
  console.log("🎯 CODENSITY PROBE DEMONSTRATION");
  console.log("=" .repeat(40));
  
  console.log("\\nPurpose:");
  console.log("  Detect when T^G(A) ≅ A (codense/trivial cases)");
  console.log("  Not a proof, but useful for small finite examples");
  console.log("  Helps identify potential adjoint cases");
  
  console.log("\\nMethod:");
  console.log("  Compare |T^G(A)| vs |A|");
  console.log("  Low ratio → possible adjoint collapse");
  console.log("  High ratio → typical codensity expansion");
  
  console.log("\\nExample ratios:");
  console.log("  Identity functor: ratio ≈ 1 (adjoint case)");
  console.log("  FinSet ↪ Set: ratio >> 1 (non-adjoint)");
  console.log("  Our discrete example: ratio = 157,464 (highly expansive)");
  
  console.log("\\n🎉 Probe system ready for experimentation!");
}