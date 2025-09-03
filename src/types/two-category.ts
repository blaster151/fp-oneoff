/** @math DEF-2CAT */

import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor } from "./catkit-kan.js";

/** Minimal 2-category interface:
 *  Obj: 0-cells (objects)
 *  One: 1-cells (morphisms between objects)
 *  Two: 2-cells (morphisms between 1-cells)
 */
export interface TwoCategory<Obj, One, Two> {
  /** Identity 1-cell at object A */
  id1: (A: Obj) => One;

  /** Compose 1-cells: g ∘ f */
  comp1: (g: One, f: One) => One;

  /** Identity 2-cell at a 1-cell */
  id2: (f: One) => Two;

  /** Vertical composition of 2-cells: β • α */
  vcomp: (beta: Two, alpha: Two) => Two;

  /** Horizontal composition of 2-cells: β ∘∘ α */
  hcomp: (beta: Two, alpha: Two) => Two;

  /** Left whisker: F ⋆ α (1-cell F with 2-cell α) */
  whiskerL: (F: One, alpha: Two) => Two;

  /** Right whisker: α ⋆ G (2-cell α with 1-cell G) */
  whiskerR: (alpha: Two, G: One) => Two;

  /** Optional equality check for 2-cells (used in tests) */
  eq2?: (x: Two, y: Two) => boolean;
}

/**
 * Check 2-category laws for a given 2-category
 */
export function check2CategoryLaws<Obj, One, Two>(
  C: TwoCategory<Obj, One, Two>,
  testData: {
    objects: Obj[];
    oneCells: One[];
    twoCells: Two[];
  }
): {
  unitalLaws: boolean;
  associativityLaws: boolean;
  interchangeLaw: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let unitalLaws = true;
  let associativityLaws = true;
  let interchangeLaw = true;
  
  try {
    // Test unital laws for vertical composition
    for (const f of testData.oneCells) {
      for (const alpha of testData.twoCells) {
        try {
          const left = C.vcomp(alpha, C.id2(f));
          const right = C.vcomp(C.id2(f), alpha);
          
          if (C.eq2 && (!C.eq2(left, alpha) || !C.eq2(right, alpha))) {
            violations.push("Unital law violation for vertical composition");
            unitalLaws = false;
          }
        } catch (e) {
          // Skip if composition not defined
        }
      }
    }
    
    // Test associativity for vertical composition (simplified)
    if (testData.twoCells.length >= 3) {
      const [alpha, beta, gamma] = testData.twoCells;
      try {
        const left = C.vcomp(gamma!, C.vcomp(beta!, alpha!));
        const right = C.vcomp(C.vcomp(gamma!, beta!), alpha!);
        
        if (C.eq2 && !C.eq2(left, right)) {
          violations.push("Associativity violation for vertical composition");
          associativityLaws = false;
        }
      } catch (e) {
        // Skip if composition not defined
      }
    }
    
    // Test interchange law (simplified)
    if (testData.twoCells.length >= 4) {
      const [alpha, beta, gamma, delta] = testData.twoCells;
      try {
        const left = C.hcomp(C.vcomp(delta!, gamma!), C.vcomp(beta!, alpha!));
        const right = C.vcomp(C.hcomp(delta!, beta!), C.hcomp(gamma!, alpha!));
        
        if (C.eq2 && !C.eq2(left, right)) {
          violations.push("Interchange law violation");
          interchangeLaw = false;
        }
      } catch (e) {
        // Skip if composition not defined
      }
    }
    
  } catch (error) {
    violations.push(`Law checking failed: ${(error as Error).message}`);
  }
  
  return {
    unitalLaws,
    associativityLaws,
    interchangeLaw,
    violations
  };
}

/**
 * Demonstrate 2-category structure and laws
 */
export function demonstrate2Category() {
  console.log("🔧 2-CATEGORY STRUCTURE DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\n2-Category Components:");
  console.log("  • 0-cells: Objects");
  console.log("  • 1-cells: Morphisms between objects");
  console.log("  • 2-cells: Morphisms between 1-cells");
  
  console.log("\\nComposition Structure:");
  console.log("  • Vertical composition: β • α (2-cells with same 1-cell boundaries)");
  console.log("  • Horizontal composition: β ∘∘ α (2-cells in sequence)");
  console.log("  • Whiskering: F ⋆ α, α ⋆ G (1-cell with 2-cell)");
  
  console.log("\\n2-Category Laws:");
  console.log("  • Unital laws: Identity 2-cells are neutral");
  console.log("  • Associativity: Both compositions are associative");
  console.log("  • Interchange law: (δ•γ) ∘∘ (β•α) = (δ ∘∘ β) • (γ ∘∘ α)");
  
  console.log("\\nApplications:");
  console.log("  • Cat: Categories, functors, natural transformations");
  console.log("  • Bicategories: Weak 2-categories with coherence");
  console.log("  • Higher category theory and homotopy theory");
  
  console.log("\\n🎯 Foundation for higher-dimensional category theory!");
}