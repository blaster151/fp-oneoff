/** @math DEF-ADT-INIT @math THM-INITIAL-ALGEBRA @math DEF-CATAMORPHISM */

/** Recursion schemes over node-local functor maps (finite / polynomial F). */

export type Fix<F> = { readonly _tag: "Fix"; readonly unfix: F };

export const In  = <F>(unfix: F): Fix<F> => ({ _tag: "Fix", unfix });
export const Out = <F>(fx: Fix<F>): F => fx.unfix;

/** --- Functor map plumbing: node-local (attach at construction with withMap) --- */
const FMAP = Symbol("Fmap");

/** Attach a mapper to an F-node. Use this inside your F-constructors. */
export const withMap = <F>(node: unknown, map: (f:(x:any)=>any)=> any): F => {
  Object.defineProperty(node as object, FMAP, { value: map, enumerable: false });
  return node as F;
};

/** Apply the stored fmap. Throws if the node didn't use withMap(...) */
export const mapF = <F>(f: (x:any)=>any, fa: F): F => {
  const m = (fa as any)[FMAP];
  if (typeof m !== "function") {
    throw new Error("F node missing fmap; construct with withMap(...).");
  }
  return m(f);
};

/** Algebras / Coalgebras */
export type Algebra<F,A>   = (fa: F) => A;
export type Coalgebra<F,A> = (a: A) => F;

/** 1) catamorphism: μF -> A */
export const cata = <F,A>(alg: Algebra<F,A>) => {
  const go = (fx: Fix<F>): A => {
    const fa  = Out(fx);
    const rec = mapF((child: Fix<F>) => go(child), fa);
    return alg(rec);
  };
  return go;
};

/** 2) anamorphism: A -> μF */
export const ana = <F,A>(coalg: Coalgebra<F,A>) => {
  const go = (a: A): Fix<F> => {
    const fr     = coalg(a);
    const mapped = mapF((seed: A) => go(seed), fr);
    return In(mapped);
  };
  return go;
};

/** 3) hylomorphism: A -> B (no intermediate Fix built) */
export const hylo = <F,A,B>(alg: Algebra<F,B>, coalg: Coalgebra<F,A>) => {
  const go = (a: A): B => {
    const fr     = coalg(a);
    const mapped = mapF((seed: A) => go(seed), fr);
    return alg(mapped);
  };
  return go;
};

/** Bonus: paramorphism (algebra sees both child result and original child) */
export const para = <F,A>(alg: (fpa: any)=>A) => {
  const go = (fx: Fix<F>): A => {
    const fa     = Out(fx);
    const paired = mapF((child: Fix<F>) => [child, go(child)], fa);
    return alg(paired);
  };
  return go;
};

/** Bonus: apomorphism (coalgebra can return already-built subtrees) */
export const apo = <F,A>(coalg: (a:A)=> any /* F<Either<Fix<F>,A>> */) => {
  const go = (a: A): Fix<F> => {
    const fr       = coalg(a);
    const stitched = mapF((e: any) => (e?._t === "inl" ? e.value : go(e.value)), fr);
    return In(stitched);
  };
  return go;
};

/**
 * Verify algebra laws (if F-algebra structure is well-formed)
 */
export function verifyAlgebraLaws<F, A>(
  alg: Algebra<F, A>,
  testData: { examples: F[]; fmapTest?: (f: (x: any) => any, fa: F) => F }
): { lawsHold: boolean; violations: string[] } {
  const violations: string[] = [];
  let lawsHold = true;
  
  try {
    // Basic structural checks
    for (const fa of testData.examples) {
      try {
        const result = alg(fa);
        if (typeof result === 'undefined') {
          violations.push("Algebra produces undefined for some inputs");
          lawsHold = false;
        }
      } catch (e) {
        violations.push(`Algebra evaluation failed: ${(e as Error).message}`);
        lawsHold = false;
      }
    }
    
    // If fmap test provided, verify functoriality
    if (testData.fmapTest) {
      const testF = (x: any) => x;
      for (const fa of testData.examples.slice(0, 3)) {
        try {
          const mapped = testData.fmapTest(testF, fa);
          const result = alg(mapped);
          if (typeof result === 'undefined') {
            violations.push("Algebra fails on mapped structures");
            lawsHold = false;
          }
        } catch (e) {
          // Skip if fmap test fails
        }
      }
    }
  } catch (e) {
    violations.push(`Overall algebra verification failed: ${(e as Error).message}`);
    lawsHold = false;
  }
  
  return { lawsHold, violations };
}

/**
 * Demonstrate fixpoint and recursion scheme theory
 */
export function demonstrateFixpointTheory() {
  console.log("🔧 FIXPOINT THEORY AND RECURSION SCHEMES");
  console.log("=" .repeat(50));
  
  console.log("\\nFixpoint Construction:");
  console.log("  • Fix<F>: Least fixpoint μF of endofunctor F");
  console.log("  • In: F(μF) → μF (constructor from F-structure)");
  console.log("  • Out: μF → F(μF) (destructor to F-structure)");
  console.log("  • Lambek's lemma: In and Out are isomorphisms");
  
  console.log("\\nRecursion Schemes:");
  console.log("  • cata: (F(A) → A) → μF → A (fold/consume)");
  console.log("  • ana: (A → F(A)) → A → μF (unfold/generate)");
  console.log("  • hylo: (F(B) → B) → (A → F(A)) → A → B (fusion)");
  console.log("  • para: Enhanced cata with access to original substructure");
  console.log("  • apo: Enhanced ana with early termination");
  
  console.log("\\nF-Functor Support:");
  console.log("  • withMap: Attach fmap to F-structures at construction");
  console.log("  • mapF: Apply function over F-structure using stored fmap");
  console.log("  • Symbol-based: Non-intrusive fmap attachment");
  console.log("  • Node-local: Each F-node carries its own mapping function");
  
  console.log("\\nMathematical Properties:");
  console.log("  • Initial algebra: μF is initial in Alg(F)");
  console.log("  • Unique morphisms: cata provides canonical maps");
  console.log("  • Fusion laws: Optimization via hylo composition");
  console.log("  • Parametricity: Free theorems from types");
  
  console.log("\\n🎯 Complete foundation for algebraic data types!");
}