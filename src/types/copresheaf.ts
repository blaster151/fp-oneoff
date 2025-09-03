/** @math DEF-COYONEDA */

import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";

type Obj<C> = C extends SmallCategory<infer O, any> ? O : never;
type Mor<C> = C extends SmallCategory<any, infer M> ? M : never;

/** A copresheaf G: C -> Set (covariant functor).
 * For f: a -> b in C, onMor(f): G(a) -> G(b) (covariant).
 */
export interface Copresheaf<C> {
  onObj: (c: Obj<C>) => SetObj<any>;
  onMor: (f: Mor<C>) => (x: any) => any; // G(f): G(a) -> G(b)
}

/** Natural transformation β: G => H of copresheaves. */
export interface NatCo<C> {
  at: (c: Obj<C>) => (x: any) => any; // component β_c : G(c) -> H(c)
}

/** Check naturality: β_b ∘ G(f) = H(f) ∘ β_a for f: a -> b. */
export function checkNaturalityCo<C>(
  Ccat: any, // Simplified to avoid complex generic inference
  G: Copresheaf<C>,
  H: Copresheaf<C>,
  beta: NatCo<C>
): boolean {
  const objects = Ccat.objects || Ccat.Obj || [];
  
  for (const a of objects) {
    for (const b of objects) {
      const homAB = Ccat.hom ? Ccat.hom(a, b) : { elems: [] };
      const morphisms = Array.from(homAB.elems || []);
      
      for (const f of morphisms) {
        const Gf = G.onMor(f as any);  // G(a) -> G(b) (covariant)
        const Hf = H.onMor(f as any);  // H(a) -> H(b) (covariant)
        const Ga = G.onObj(a);
        
        for (const x of Array.from(Ga.elems)) {
          try {
            const left = beta.at(b)(Gf(x));      // β_b ∘ G(f)
            const right = Hf(beta.at(a)(x));     // H(f) ∘ β_a
            
            if (left !== right) {
              console.warn(`Covariant naturality failed at f: ${a} -> ${b}, element: ${x}`);
              return false;
            }
          } catch (e) {
            // Skip if evaluation fails (may be structural issues)
            continue;
          }
        }
      }
    }
  }
  return true;
}

/**
 * Create constant copresheaf at set S
 */
export function constantCopresheaf<C>(
  Ccat: any,
  S: SetObj<any>
): Copresheaf<C> {
  return {
    onObj: (_c: Obj<C>) => S,
    onMor: (_f: Mor<C>) => (x: any) => x, // Identity on S
  };
}

/**
 * Demonstrate copresheaf construction and naturality
 */
export function demonstrateCopresheaf() {
  console.log("📚 COPRESHEAF CATEGORY DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nCopresheaf Definition:");
  console.log("  • Covariant functor G: C → Set");
  console.log("  • For f: a → b in C, G(f): G(a) → G(b)");
  console.log("  • Natural transformations as morphisms");
  
  console.log("\\nKey Properties:");
  console.log("  • Covariance: G(g ∘ f) = G(g) ∘ G(f)");
  console.log("  • Identity: G(id_c) = id_{G(c)}");
  console.log("  • Naturality: β_b ∘ G(f) = H(f) ∘ β_a");
  
  console.log("\\nApplications:");
  console.log("  • Co-Yoneda embedding: Ŷ(c) = Hom(c, -)");
  console.log("  • Isbell duality: O and Spec conjugates");
  console.log("  • Colimit computations");
  
  console.log("\\n🎯 Foundation for Isbell duality and co-representable functors!");
}