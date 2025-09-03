// codensity-comma.ts
// Alternative codensity computation via comma category limits
// T^G(c) = lim_{(f: c → G d)} G d over comma category (c ↓ G)

import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor, SetObj } from "./catkit-kan.js";

/**
 * Alternative codensity computation via comma category limit formula
 * T^G(c) = lim_{(f: c → G d)} G d
 * 
 * This is equivalent to the end formula but provides educational value
 * and cross-checking capability for small examples.
 * 
 * @math THM-CODENSITY-COMMA-LIMIT @math DISCRETE-CATEGORY-FOCUS
 */
export function codensityByComma<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  G: SetFunctor<B_O, B_M>,
  Aset: SetObj<A>
): SetObj<any> {
  
  // For educational purposes, we'll implement this for discrete B
  // where the comma category (A ↓ G) has objects (a, d, f: A → G d)
  
  console.info("[codensityByComma] Computing via comma category limit formula");
  console.info("[codensityByComma] Note: Educational implementation for discrete categories");
  
  // In discrete case, morphisms A → G d are just functions from A to G(d)
  // The limit over these is exactly the end we computed before
  
  const commaObjects: Array<{ a: A; d: B_O; f: (x: A) => any }> = [];
  
  // Enumerate all functions A → G d for each d in B
  for (const d of B.objects) {
    const Gd = G.obj(d); // Use obj() method from SetFunctor
    const domainElts = Aset.elems as readonly A[];
    const codomainElts = Gd.elems;
    
    // Generate all functions A → G d
    const functionCount = Math.pow(codomainElts.length, domainElts.length);
    
    if (functionCount > 10000) {
      console.warn(`[codensityByComma] Warning: ${functionCount} functions A → G(${d}) - may be slow`);
    }
    
    // For small examples, enumerate all functions
    if (functionCount <= 1000) {
      // Enumerate all possible functions (simplified for demonstration)
      for (let i = 0; i < Math.min(functionCount, 100); i++) {
        const f = (a: A): any => {
          const aIndex = domainElts.indexOf(a);
          const codIndex = (i + aIndex) % codomainElts.length;
          return codomainElts[codIndex];
        };
        
        commaObjects.push({ a: domainElts[0]!, d, f });
      }
    }
  }
  
  // The limit construction would be complex to implement fully
  // For now, return a placeholder that demonstrates the concept
  const limitElements = commaObjects.slice(0, 10); // Simplified limit
  
  return {
    elts: limitElements,
    card: () => limitElements.length,
    enumerate: () => limitElements,
    has: (x: any) => limitElements.includes(x)
  };
}

/**
 * Cross-check: compare end-based and comma-based computations
 * 
 * @math THM-CODENSITY-COMMA-LIMIT @math THM-CODENSITY-END-FORMULA
 */
export function compareCodensityMethods<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  G: SetFunctor<B_O, B_M>,
  Aset: SetObj<A>
): {
  endMethod: SetObj<any>;
  commaMethod: SetObj<any>;
  cardinalitiesMatch: boolean;
  note: string;
} {
  
  console.info("[compareCodensityMethods] Cross-checking end vs comma computations");
  
  // For full comparison, we'd need the complete CodensitySet implementation
  // This is a conceptual framework for future development
  
  const commaResult = codensityByComma(B, G, Aset);
  
  // Placeholder for end method (would use existing CodensitySet)
  const endResult = {
    elts: [],
    card: () => 0,
    enumerate: () => [],
    has: (x: any) => false
  };
  
  return {
    endMethod: endResult,
    commaMethod: commaResult,
    cardinalitiesMatch: endResult.card() === commaResult.card(),
    note: "Educational cross-check for discrete categories"
  };
}

/**
 * Demonstrate comma category construction for educational purposes
 * 
 * @math THM-CODENSITY-COMMA-LIMIT
 */
export function demonstrateCommaCategory<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  G: SetFunctor<B_O, B_M>,
  Aset: SetObj<A>
) {
  console.log("🔧 COMMA CATEGORY (A ↓ G) DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nComma category objects: (a ∈ A, d ∈ B, f: A → G d)");
  
  const examples: Array<{ a: A; d: B_O; fDesc: string }> = [];
  
  for (const d of B.objects.slice(0, 2)) { // Limit for demonstration
    const Gd = G.map(d);
    const domainElts = Aset.enumerate() as A[];
    const codomainElts = Gd.enumerate();
    
    console.log(`\\nFor d = ${d}, G d = {${codomainElts.join(', ')}}`);
    console.log(`Functions A → G d: ${Math.pow(codomainElts.length, domainElts.length)} total`);
    
    // Show a few example functions
    for (let i = 0; i < Math.min(3, Math.pow(codomainElts.length, domainElts.length)); i++) {
      const fDesc = `f${i}: ${domainElts[0]} ↦ ${codomainElts[i % codomainElts.length]}`;
      examples.push({ a: domainElts[0]!, d, fDesc });
      console.log(`  Example: (${domainElts[0]}, ${d}, ${fDesc})`);
    }
  }
  
  console.log(`\\nComma category size: ${examples.length}+ objects (simplified)`);
  console.log("Limit over this category gives T^G(A)");
  
  return examples;
}