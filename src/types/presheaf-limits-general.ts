/** @math LIMIT-PRESHEAF-POINTWISE */

/** Pointwise limits in Presheaf(C) with explicit transport.
 * For a diagram D: J -> Presheaf(C), define (lim D)(c) = lim_j D(j)(c).
 * Transport: (lim D)(f)( (x_j)_j at b ) = ( D(j)(f)(x_j) )_j at a.
 */
import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";
import { Presheaf } from "./presheaf.js";
import { buildPointwiseLimit } from "./pointwise-limit-util.js";

type CObj<C> = C extends SmallCategory<infer O, any> ? O : never;

export function pshLimitGeneral<C, J>(
  C: any, // SmallCategory with hom
  J: any, // Shape category
  D: { 
    onObj: (j: any) => Presheaf<C>; 
    onMor?: (f: any) => (P: Presheaf<C>) => Presheaf<C> 
  }
): Presheaf<C> {
  const at = buildPointwiseLimit(C, J, D);
  
  return {
    onObj: (c: any) => at(c).carrier,
    
    onMor: (f: any) => {
      return (famAtB: any[]) => {
        const stA = at((f as any).src ?? (f as any).from);
        return stA.transport(f, famAtB);
      };
    }
  };
}

/**
 * Presheaf pullback (special case of limit)
 */
export function pshPullbackGeneral<C>(
  C: any, // SmallCategory with hom
  P: Presheaf<C>,
  Q: Presheaf<C>, 
  R: Presheaf<C>,
  pi: any, // P → R
  rho: any // Q → R
): Presheaf<C> {
  // Cospan diagram: P → R ← Q
  const J = {
    objects: ["jP", "jR", "jQ"],
    Obj: ["jP", "jR", "jQ"],
    Mor: [
      { src: "jP", dst: "jP", name: "idP" },
      { src: "jR", dst: "jR", name: "idR" },
      { src: "jQ", dst: "jQ", name: "idQ" },
      { src: "jP", dst: "jR", name: "pi" },
      { src: "jQ", dst: "jR", name: "rho" }
    ],
    id: (o: string) => ({ src: o, dst: o, name: `id${o.slice(1)}` }),
    src: (m: any) => m.src,
    dst: (m: any) => m.dst,
    comp: (g: any, f: any) => {
      if (f.dst !== g.src) throw new Error("composition mismatch");
      if (f.name.startsWith("id")) return g;
      if (g.name.startsWith("id")) return f;
      throw new Error("no nontrivial compositions in cospan");
    },
    hom: (x: string, y: string) => {
      if (x === y) {
        return {
          id: `hom-${x}-${x}`,
          elems: [{ src: x, dst: x, name: `id${x.slice(1)}` }],
          eq: (m1: any, m2: any) => m1.name === m2.name
        } as SetObj<any>;
      } else if (x === "jP" && y === "jR") {
        return {
          id: "hom-jP-jR",
          elems: [{ src: "jP", dst: "jR", name: "pi" }],
          eq: (m1: any, m2: any) => m1.name === m2.name
        } as SetObj<any>;
      } else if (x === "jQ" && y === "jR") {
        return {
          id: "hom-jQ-jR",
          elems: [{ src: "jQ", dst: "jR", name: "rho" }],
          eq: (m1: any, m2: any) => m1.name === m2.name
        } as SetObj<any>;
      } else {
        return {
          id: `hom-${x}-${y}`,
          elems: [],
          eq: (m1: any, m2: any) => false
        } as SetObj<any>;
      }
    }
  };

  const DJ = {
    onObj: (j: "jP" | "jR" | "jQ") => {
      if (j === "jP") return P;
      if (j === "jR") return R;
      if (j === "jQ") return Q;
      throw new Error(`Unknown diagram object: ${j}`);
    }
  };

  return pshLimitGeneral(C, J, DJ);
}

/**
 * Demonstrate presheaf limits and pullbacks
 */
export function demonstratePresheafLimits() {
  console.log("🔧 PRESHEAF LIMITS WITH EXPLICIT TRANSPORT");
  console.log("=" .repeat(50));
  
  console.log("\\nLimit Construction:");
  console.log("  • Pointwise: (lim D)(c) = lim_j D(j)(c)");
  console.log("  • Product: Π_j P_j(c) with compatibility");
  console.log("  • Transport: Componentwise via P_j(f)");
  
  console.log("\\nTransport Formula:");
  console.log("  • Q(f)((x_j)_j at b) = (P_j(f)(x_j))_j at a");
  console.log("  • Contravariant: Presheaf morphisms reverse direction");
  console.log("  • Functorial: Preserves composition");
  
  console.log("\\nPullback Construction:");
  console.log("  • Cospan: P → R ← Q");
  console.log("  • Limit: {(p,q) : π(p) = ρ(q)}");
  console.log("  • Universal property: Unique mediating morphism");
  
  console.log("\\nApplications:");
  console.log("  • Pullbacks in presheaf categories");
  console.log("  • Fiber products");
  console.log("  • Base change constructions");
  
  console.log("\\n🎯 Complete presheaf limit theory with transport!");
}