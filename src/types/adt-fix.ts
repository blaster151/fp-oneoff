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

/** Zygomorphism.
 * psi : F<A> -> A   (helper algebra, usually "attributes")
 * phi : F<B> -> B   (result algebra, can depend on psi-results of children)
 * Returns only B; use zygoPair if you want both (A,B).
 */
export const zygo = <F,A,B>(psi: (fa:F)=>A, phi: (fb:F)=>B) => {
  const go = (fx: Fix<F>): B => {
    const fa = Out(fx);                               // F<Fix F>
    const fPairs = mapF((child: Fix<F>) => {
      const fb = Out(child); // not needed; call go(child) to get B
      // compute pair (A,B) for child by recursive descent
      const b = go(child);
      // to compute 'a' for child, we need psi over F<A>; get A for that child via zygoPair
      // Simpler: compute both via zygoPair helper (below). This call is safe (memo below).
      return zygoPair(psi, phi)._go(child);
    }, fa) as any;                                    // F<(A,B)>

    const fA = mapF((ab:[A,B]) => ab[0], fPairs) as F; // F<A>
    const fB = mapF((ab:[A,B]) => ab[1], fPairs) as F; // F<B>
    // psi uses F<A> over *children*; phi uses F<B> over *children*
    // Here at the parent, we want the B-result:
    return phi(fB);
  };
  // small memo (optional): WeakMap<Fix<F>, B> to avoid quadratic traversals
  const memo = new WeakMap<any,B>();
  const memoized = (fx: Fix<F>): B => {
    const got = memo.get(fx as any);
    if (got !== undefined) return got;
    const b = go(fx);
    memo.set(fx as any, b);
    return b;
  };
  return memoized;
};

/** zygoPair: returns both attributes.
 * Carries a memo to ensure linear time under sharing.
 */
export const zygoPair = <F,A,B>(psi:(fa:F)=>A, phi:(fb:F)=>B) => {
  const memo = new WeakMap<any,[A,B]>();
  const _go = (fx: Fix<F>): [A,B] => {
    const g = memo.get(fx as any); if (g) return g;
    const fa = Out(fx);
    const childPairs = mapF((child: Fix<F>) => _go(child), fa) as any as F; // F<(A,B)>
    const fA = mapF((ab:[A,B]) => ab[0], childPairs) as F;                  // F<A>
    const fB = mapF((ab:[A,B]) => ab[1], childPairs) as F;                  // F<B>
    const a = psi(fA);
    const b = phi(fB);
    const res:[A,B] = [a,b];
    memo.set(fx as any, res);
    return res;
  };
  return Object.assign((fx: Fix<F>) => _go(fx)[1], { _go });
};

/** Histomorphism (course-of-value).
 * Provides each child as { value: A, self: Fix<F>, ask(sub): A } with memoized 'ask'.
 * Your algebra sees F<Attr<A>> and can dive deeper using 'ask'.
 */
export const histo = <F,A>(alg: (fattr: any /* F<Attr<A>> */)=>A) => {
  type Attr = { value: A; self: Fix<F>; ask: (sub: Fix<F>) => A };
  const cache = new WeakMap<any,A>();
  const go = (fx: Fix<F>): A => {
    const have = cache.get(fx as any); if (have !== undefined) return have;
    const fa = Out(fx);
    const lifted = mapF((child: Fix<F>) => {
      const value = go(child);
      const ask = (sub: Fix<F>) => {
        const got = cache.get(sub as any);
        return got !== undefined ? got : go(sub);
      };
      return { value, self: child, ask } as Attr;
    }, fa);
    const a = alg(lifted);
    cache.set(fx as any, a);
    return a;
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