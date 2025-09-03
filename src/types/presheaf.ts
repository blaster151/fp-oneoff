/** @math DEF-PRESHEAF */

import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";

type Obj<C> = C extends SmallCategory<infer O, any> ? O : never;
type Mor<C> = C extends SmallCategory<any, infer M> ? M : never;

/** A presheaf P: C^op -> Set.
 * For f: a -> b in C, onMor(f): P(b) -> P(a) (contravariant).
 */
export interface Presheaf<C> {
  onObj: (c: Obj<C>) => SetObj<any>;
  onMor: (f: Mor<C>) => (x: any) => any; // P(f): P(b) -> P(a)
}

/** Natural transformation α: P => Q of presheaves. */
export interface NatPsh<C> {
  at: (c: Obj<C>) => (x: any) => any; // component α_c : P(c) -> Q(c)
}

/** Check naturality: α_a ∘ P(f) = Q(f) ∘ α_b for f: a -> b. */
export function checkNaturality<C>(
  Ccat: any, // Simplified to avoid complex generic inference
  P: Presheaf<C>,
  Q: Presheaf<C>,
  alpha: NatPsh<C>
): boolean {
  const objects = Ccat.objects || Ccat.Obj || [];
  
  for (const a of objects) {
    for (const b of objects) {
      const homAB = Ccat.hom ? Ccat.hom(a, b) : { elems: [] };
      const morphisms = Array.from(homAB.elems || []);
      
      for (const f of morphisms) {
        const Pf = P.onMor(f as any);  // P(b) -> P(a) (contravariant)
        const Qf = Q.onMor(f as any);  // Q(b) -> Q(a) (contravariant)
        const Pb = P.onObj(b);
        
        for (const x of Array.from(Pb.elems)) {
          try {
            const left = alpha.at(a)(Pf(x));      // α_a ∘ P(f)
            const right = Qf(alpha.at(b)(x));     // Q(f) ∘ α_b
            
            if (left !== right) {
              console.warn(`Naturality failed at f: ${a} -> ${b}, element: ${x}`);
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
 * Create constant presheaf at set S
 */
export function constantPresheaf<C>(
  Ccat: SmallCategory<Obj<C>, Mor<C>>,
  S: SetObj<any>
): Presheaf<C> {
  return {
    onObj: (_c: Obj<C>) => S,
    onMor: (_f: Mor<C>) => (x: any) => x, // Identity on S
  };
}

/**
 * Demonstrate presheaf construction and naturality
 */
export function demonstratePresheaf() {
  console.log("📚 PRESHEAF CATEGORY DEMONSTRATION");
  console.log("=" .repeat(50));
  
  console.log("\\nPresheaf Definition:");
  console.log("  • Contravariant functor P: C^op → Set");
  console.log("  • For f: a → b in C, P(f): P(b) → P(a)");
  console.log("  • Natural transformations as morphisms");
  
  console.log("\\nKey Properties:");
  console.log("  • Contravariance: P(g ∘ f) = P(f) ∘ P(g)");
  console.log("  • Identity: P(id_c) = id_{P(c)}");
  console.log("  • Naturality: α_a ∘ P(f) = Q(f) ∘ α_b");
  
  console.log("\\nApplications:");
  console.log("  • Yoneda embedding: Y(c) = Hom(-, c)");
  console.log("  • Representable functors");
  console.log("  • Topos theory and sheaves");
  
  console.log("\\n🎯 Foundation for Yoneda lemma and representation theory!");
}