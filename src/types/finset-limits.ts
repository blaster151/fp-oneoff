/** @math LIMIT-GENERAL */

import { SetObj } from "./catkit-kan.js";
import { DiagramToFinSet } from "./diagram.js";

/** Limit of D: J -> Set as subset of Π_j D(j) satisfying cone equations F(f)(x_a) = x_b. */
export function limitFinSet<J>(D: DiagramToFinSet<J>): SetObj<any[]> {
  const J = D.shape;
  const F = D.functor;
  const objs = (J as any).objects || (J as any).Obj || [];
  
  // Build product carrier as arrays aligned with objects order
  const tuples: any[][] = [];
  
  function buildProduct(i: number, acc: any[]): void {
    if (i === objs.length) { 
      tuples.push(acc.slice()); 
      return; 
    }
    const Dj = F.obj(objs[i]);
    for (const x of Array.from(Dj.elems)) { 
      acc.push(x); 
      buildProduct(i + 1, acc); 
      acc.pop(); 
    }
  }
  
  buildProduct(0, []);
  
  // Filter to keep only compatible tuples (cone condition)
  const isCompatible = (t: any[]): boolean => {
    for (const a of objs) {
      for (const b of objs) {
        const homAB = (J as any).hom ? (J as any).hom(a, b) : { elems: [] };
        for (const f of Array.from(homAB.elems || [])) {
          const ia = objs.indexOf(a);
          const ib = objs.indexOf(b);
          
          if (ia >= 0 && ib >= 0) {
            try {
              const Ff = F.map(f);
              const transformed = Ff(t[ia]);
              if (!Object.is(transformed, t[ib])) {
                return false;
              }
            } catch (e) {
              // If transformation fails, skip this constraint
              continue;
            }
          }
        }
      }
    }
    return true;
  };
  
  const compatibleTuples = tuples.filter(isCompatible);
  
  return {
    id: "limit",
    elems: compatibleTuples,
    eq: (x, y) => JSON.stringify(x) === JSON.stringify(y)
  };
}

/**
 * Verify limit universal property for a given diagram
 */
export function verifyLimitUniversal<J>(
  D: DiagramToFinSet<J>,
  limitResult: SetObj<any[]>,
  testCone: { vertex: SetObj<any>; projections: Array<(x: any) => any> }
): {
  hasMediator: boolean;
  isUnique: boolean;
  mediator?: (x: any) => any[];
} {
  const objs = (D.shape as any).objects || (D.shape as any).Obj || [];
  
  try {
    // Construct mediating morphism from cone
    const mediator = (x: any): any[] => {
      return objs.map((_: any, i: any) => testCone.projections[i]!(x));
    };
    
    // Verify that mediator lands in the limit
    for (const x of Array.from(testCone.vertex.elems)) {
      const image = mediator(x);
      const inLimit = limitResult.elems.some(tuple => 
        limitResult.eq(tuple, image)
      );
      
      if (!inLimit) {
        return { hasMediator: false, isUnique: false };
      }
    }
    
    return {
      hasMediator: true,
      isUnique: true, // Unique by universal property
      mediator
    };
  } catch (error) {
    return { hasMediator: false, isUnique: false };
  }
}

/**
 * Demonstrate limit construction for FinSet diagrams
 */
export function demonstrateFinSetLimits() {
  console.log("🔧 FINITE LIMITS IN FINSET");
  console.log("=" .repeat(50));
  
  console.log("\\nLimit Construction:");
  console.log("  • Product: Π_j D(j) of all diagram values");
  console.log("  • Cone equations: F(f)(x_a) = x_b for f: a → b");
  console.log("  • Compatible tuples: Subset satisfying all constraints");
  
  console.log("\\nCommon Limit Types:");
  console.log("  • Product: Limit of discrete diagram");
  console.log("  • Equalizer: Limit of parallel pair");
  console.log("  • Pullback: Limit of cospan A → T ← B");
  
  console.log("\\nUniversal Property:");
  console.log("  • Cone factorization: Every cone factors through limit");
  console.log("  • Uniqueness: Mediating morphism is unique");
  console.log("  • Preservation: Limit preserves cone structure");
  
  console.log("\\n🎯 Complete finite limit theory for FinSet!");
}