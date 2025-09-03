/** @math THM-CODENSITY-COMMA-LIMIT */

import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";

type Obj<C> = C extends SmallCategory<infer O, any> ? O : never;
type Mor<C> = C extends SmallCategory<any, infer M> ? M : never;

// Simple functor interface for this educational tool
interface SimpleFunctor<CatB> {
  onObj: (b: Obj<CatB>) => SetObj<any>;
  onMor: (m: Mor<CatB>) => (x: any) => any;
}

// Simple category interface for this tool
interface SimpleCategory<CatB> {
  objects: ReadonlyArray<Obj<CatB>>;
  hom: (x: Obj<CatB>, y: Obj<CatB>) => SetObj<Mor<CatB>>;
}

/**
 * Pedagogical calculator for T^G(A) via the comma-limit:
 *   T^G(A) = lim_{(f:A→G b)} G b
 * Works best when B is small/discrete and sets are tiny.
 */
export function codensityByComma<CatB>(
  B: SimpleCategory<CatB>,
  G: SimpleFunctor<CatB>,
  A: SetObj<any>
) {
  // 1) objects of (A ↓ G) are pairs (b, f) with f : A -> G(b)
  const objs: Array<{ b: Obj<CatB>; f: (a: any) => any }> = [];
  const bs = Array.from(B.objects);
  
  for (const b of bs) {
    const Gb = G.onObj(b);
    const domainElts = Array.from(A.elems);
    const codomainElts = Array.from(Gb.elems);
    
    // Generate all functions A -> G(b)
    const functionCount = Math.pow(codomainElts.length, domainElts.length);
    
    // For small examples, enumerate all functions
    if (functionCount <= 1000) {
      // Generate all possible function tables
      for (let i = 0; i < functionCount; i++) {
        const f = (a: any): any => {
          const aIndex = domainElts.indexOf(a);
          if (aIndex === -1) throw new Error("Element not in domain");
          
          // Convert i to base-|codomain| representation
          let temp = i;
          const table: any[] = [];
          for (let j = 0; j < domainElts.length; j++) {
            table.push(codomainElts[temp % codomainElts.length]);
            temp = Math.floor(temp / codomainElts.length);
          }
          
          return table[aIndex];
        };
        
        objs.push({ b, f });
      }
    } else {
      console.warn(`[codensityByComma] Warning: ${functionCount} functions A → G(${b}) - truncating for demo`);
      // Just add a few sample functions for very large cases
      for (let i = 0; i < Math.min(10, functionCount); i++) {
        const f = (a: any): any => codomainElts[i % codomainElts.length];
        objs.push({ b, f });
      }
    }
  }

  // 2) product Π_{(b,f)} G(b)
  const productCarrier: any[] = [];
  
  function buildProduct(i: number, acc: any[]): void {
    if (i === objs.length) { 
      productCarrier.push(acc.slice()); 
      return; 
    }
    const Gb = G.onObj(objs[i]!.b);
    for (const x of Array.from(Gb.elems)) {
      acc.push(x); 
      buildProduct(i + 1, acc); 
      acc.pop();
    }
  }
  
  buildProduct(0, []);

  // 3) constraints along morphisms (u: b -> b') that relate (b,f) and (b',f')
  // We only enforce those where f' = G(u) ∘ f.
  const constraints: Array<(tuple: any[]) => boolean> = [];
  
  for (let i = 0; i < objs.length; i++) {
    for (let j = 0; j < objs.length; j++) {
      const bi = objs[i]!.b;
      const bj = objs[j]!.b;
      const homSet = B.hom(bi, bj);
      
      for (const u of Array.from(homSet.elems)) {
        const Gu = G.onMor(u);
        // check if f_j = Gu ∘ f_i  (pointwise)
        const fi = objs[i]!.f;
        const fj = objs[j]!.f;
        const agrees = Array.from(A.elems).every(a => {
          try {
            return A.eq ? A.eq(fj(a), Gu(fi(a))) : fj(a) === Gu(fi(a));
          } catch {
            return false; // If evaluation fails, constraint doesn't apply
          }
        });
        
        if (agrees) {
          constraints.push((tuple: any[]) => {
            try {
              return tuple[j] === Gu(tuple[i]);
            } catch {
              return true; // If constraint can't be checked, assume satisfied
            }
          });
        }
      }
    }
  }

  // 4) the limit is those tuples satisfying all constraints
  const elems = productCarrier.filter(t => constraints.every(c => c(t)));

  // Provide a tiny "component" API matching End-like style
  return {
    enumerate: () => elems,
    at: (b: Obj<CatB>) => (k: (a: any) => any) => {
      // find index where object equals (b,k)
      const idx = objs.findIndex(ob => ob.b === b && equalFuncs(A, ob.f, k));
      if (idx < 0) throw new Error("component not found in comma diagram");
      // project every tuple at idx
      return (tuple: any[]) => tuple[idx];
    },
    cardinality: () => elems.length,
    diagramSize: objs.length,
  };
}

function equalFuncs(A: SetObj<any>, f: (a: any) => any, g: (a: any) => any): boolean {
  return Array.from(A.elems).every(a => {
    try {
      return A.eq ? A.eq(f(a), g(a)) : f(a) === g(a);
    } catch {
      return false;
    }
  });
}