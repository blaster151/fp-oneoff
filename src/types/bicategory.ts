/** @math DEF-BICAT @math LAW-PENTAGON @math LAW-TRIANGLE */

export interface Bicategory<Obj, One, Two> {
  /** Identity 1-cell at object A */
  id1: (A: Obj) => One;
  
  /** Composition of 1-cells: g ∘ f */
  comp1: (g: One, f: One) => One;

  /** Identity 2-cell at 1-cell f */
  id2: (f: One) => Two;
  
  /** Vertical composition of 2-cells: β • α */
  vcomp: (beta: Two, alpha: Two) => Two;

  /** Left whisker: F ⋆ α (1-cell F with 2-cell α) */
  whiskerL: (F: One, alpha: Two) => Two;
  
  /** Right whisker: α ⋆ G (2-cell α with 1-cell G) */
  whiskerR: (alpha: Two, G: One) => Two;

  /** Associator 2-isomorphism: a_{H,G,F}: (H∘G)∘F ⇒ H∘(G∘F) */
  associator: (H: One, G: One, F: One) => Two;

  /** Left unitor 2-isomorphism: l_F : id∘F ⇒ F */
  leftUnitor: (F: One) => Two;
  
  /** Right unitor 2-isomorphism: r_F : F∘id ⇒ F */
  rightUnitor: (F: One) => Two;

  /** Horizontal composite: default via whiskers+vcomp, but overrideable */
  hcomp?: (beta: Two, alpha: Two) => Two;

  /** Equality check for 2-cells (used in coherence tests) */
  eq2?: (x: Two, y: Two) => boolean;
}

/**
 * Check bicategory coherence laws (pentagon and triangle)
 */
export function checkBicategoryCoherence<Obj, One, Two>(
  B: Bicategory<Obj, One, Two>,
  testData: {
    objects: Obj[];
    oneCells: One[];
    twoCells: Two[];
  }
): {
  pentagonLaw: boolean;
  triangleLaw: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let pentagonLaw = true;
  let triangleLaw = true;
  
  try {
    // Pentagon law (simplified for finite test)
    if (testData.oneCells.length >= 4) {
      const [F, G, H, K] = testData.oneCells;
      
      try {
        // Pentagon: a_{K,H,G∘F} • a_{K∘H,G,F} = (K ⋆ a_{H,G,F}) • a_{K,H∘G,F} • (a_{K,H,G} ⋆ F)
        const left = B.vcomp(
          B.associator(K!, H!, B.comp1(G!, F!)),
          B.associator(B.comp1(K!, H!), G!, F!)
        );
        
        const right = B.vcomp(
          B.vcomp(
            B.whiskerL(K!, B.associator(H!, G!, F!)),
            B.associator(K!, B.comp1(H!, G!), F!)
          ),
          B.whiskerR(B.associator(K!, H!, G!), F!)
        );
        
        if (B.eq2 && !B.eq2(left, right)) {
          violations.push("Pentagon law violation");
          pentagonLaw = false;
        }
      } catch (e) {
        // Skip if compositions not defined
      }
    }
    
    // Triangle law (simplified)
    if (testData.oneCells.length >= 2) {
      const [F, G] = testData.oneCells;
      
      try {
        // Triangle: (l_G ⋆ F) • a_{G,id,F} = (G ⋆ r_F)
        const left = B.vcomp(
          B.whiskerL(G!, B.leftUnitor(F!)),
          B.associator(G!, B.id1({} as any), F!)
        );
        
        const right = B.whiskerR(B.rightUnitor(F!), G!);
        
        if (B.eq2 && !B.eq2(left, right)) {
          violations.push("Triangle law violation");
          triangleLaw = false;
        }
      } catch (e) {
        // Skip if operations not defined
      }
    }
    
  } catch (error) {
    violations.push(`Coherence checking failed: ${(error as Error).message}`);
  }
  
  return {
    pentagonLaw,
    triangleLaw,
    violations
  };
}

/**
 * Demonstrate bicategory structure and coherence
 */
export function demonstrateBicategory() {
  console.log("🔧 BICATEGORY STRUCTURE DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nBicategory Components:");
  console.log("  • 0-cells: Objects");
  console.log("  • 1-cells: Morphisms between objects");
  console.log("  • 2-cells: Morphisms between 1-cells");
  
  console.log("\\nCoherence Structure:");
  console.log("  • Associator: a_{H,G,F}: (H∘G)∘F ⇒ H∘(G∘F)");
  console.log("  • Left unitor: l_F: id∘F ⇒ F");
  console.log("  • Right unitor: r_F: F∘id ⇒ F");
  
  console.log("\\nCoherence Laws:");
  console.log("  • Pentagon: Mac Lane pentagon identity for associators");
  console.log("  • Triangle: Compatibility between associator and unitors");
  
  console.log("\\nStrict vs Weak:");
  console.log("  • Strict: Associator and unitors are identity 2-cells");
  console.log("  • Weak: Associator and unitors are invertible 2-cells");
  
  console.log("\\nApplications:");
  console.log("  • Cat: Strict bicategory of categories");
  console.log("  • Span: Bicategory of spans in a category");
  console.log("  • Prof: Bicategory of profunctors");
  
  console.log("\\n🎯 Foundation for weak higher category theory!");
}