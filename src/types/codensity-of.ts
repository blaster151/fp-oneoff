// codensity-of.ts
// A discoverable, single-entry helper: given G : B -> Set (finite),
// return its codensity monad T^G with (T, eta, mu) + ergonomic of/map/chain/ap
//
// This provides the "standard, discoverable way" to get a codensity monad
// following the mathematical recipe: T^G = Ran_G G = ∫_{b∈B} [A(-, G b), G b]

import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetFunctor, SetObj, HasHom } from "./catkit-kan.js";
import { mkCodensityMonad } from "./codensity-monad.js";

/************ Main Entry Point ************/

/**
 * Create codensity monad for any Set-valued functor G: B → Set
 * 
 * This is the canonical way to construct codensity monads following:
 * T^G = Ran_G G = ∫_{b∈B} [[A, G b], G b]
 * 
 * Returns familiar monadic interface: {T, eta, mu, of, map, chain, ap, run}
 * 
 * @math THM-CODENSITY-RAN @math THM-CODENSITY-EXISTENCE @math GUARDRAIL-SMALL-LIMITS
 */
export type CodensityAssumptions = {
  smallDomain?: boolean;     // B is small category
  hasSmallLimits?: boolean;  // Codomain has small limits (Set does)
  rightAdjointCase?: boolean; // If true, expect T^G ≅ G∘F elsewhere
  note?: string;             // Additional context
};

export function codensityOf<B_O, B_M>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> } & HasHom<B_O, B_M>,
  G: SetFunctor<B_O, B_M>,
  assumptions: CodensityAssumptions = { 
    smallDomain: true, 
    hasSmallLimits: true 
  },
  keyB: (b: B_O) => string = (b) => String(b),
  keyBMor: (m: B_M) => string = (m) => String(m)
) {
  // Existence condition guardrails (soft warnings for development)
  if (!assumptions.smallDomain) {
    console.warn("[codensityOf] Warning: Domain B not declared small; right Kan extension existence uncertain.");
  }
  
  if (!assumptions.hasSmallLimits) {
    console.warn("[codensityOf] Warning: Codomain lacks small limits; codensity construction may fail.");
  }
  
  if (assumptions.rightAdjointCase) {
    console.info("[codensityOf] Info: Right adjoint case - expect T^G ≅ G∘F collapse.");
  }
  
  // For finite Set case, we know existence is guaranteed
  const objectCount = B.objects.length;
  const morphismCount = B.morphisms.length;
  
  if (objectCount > 100) {
    console.warn(`[codensityOf] Warning: Large domain (${objectCount} objects) may cause exponential complexity.`);
  }
  
  if (assumptions.note) {
    console.info(`[codensityOf] Note: ${assumptions.note}`);
  }
  
  return mkCodensityMonad(B, G, keyB, keyBMor);
}

/************ Convenience Constructors ************/

/**
 * Codensity monad for terminal category (single object)
 * Given Set X, creates T^X where T^X(A) = [Set(A,X), X]
 */
export function codensityOfSet<A>(X: SetObj<A>) {
  // Create terminal category
  type BObj = "*";
  type BM = { tag: "id" };
  
  const Terminal: SmallCategory<BObj, BM> & { objects: BObj[]; morphisms: BM[] } & HasHom<BObj, BM> = {
    objects: ["*"],
    morphisms: [{ tag: "id" }],
    id: (_: BObj) => ({ tag: "id" }),
    src: (_: BM) => "*",
    dst: (_: BM) => "*",
    compose: (_g: BM, _f: BM) => ({ tag: "id" }),
    hom: (_x: BObj, _y: BObj) => [{ tag: "id" }]
  };

  // Constant functor G: * ↦ X
  const G: SetFunctor<BObj, BM> = {
    obj: (_: BObj) => X,
    map: (_: BM) => (x: A) => x
  };

  return codensityOf(Terminal, G);
}

/**
 * Codensity monad for discrete category  
 * Given objects and Set-valued assignments, creates product-like codensity
 */
export function codensityOfDiscrete<B_O>(
  objects: ReadonlyArray<B_O>,
  G: (b: B_O) => SetObj<any>
) {
  type BM = { tag: "id", o: B_O };
  
  const Discrete: SmallCategory<B_O, BM> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<BM> } & HasHom<B_O, BM> = {
    objects,
    morphisms: objects.map(o => ({ tag: "id", o })),
    id: (o: B_O) => ({ tag: "id", o }),
    src: (m: BM) => m.o,
    dst: (m: BM) => m.o,
    compose: (g: BM, f: BM) => {
      if (g.o === f.o) return g;
      throw new Error("Cannot compose across different objects in discrete category");
    },
    hom: (x: B_O, y: B_O) => x === y ? [{ tag: "id", o: x }] : []
  };

  const setG: SetFunctor<B_O, BM> = {
    obj: G,
    map: (_: BM) => (x: any) => x // Identity on morphisms
  };

  return codensityOf(Discrete, setG);
}

/************ Examples and Documentation ************/

/**
 * Example: End(X) monad for a specific set X
 */
export function exampleEndMonad(): void {
  console.log('🎮 EXAMPLE: End(X) monad via codensityOf');
  console.log('-'.repeat(50));
  
  const X: SetObj<string> = {
    id: "X",
    elems: ["x0", "x1", "x2"],
    eq: (a, b) => a === b
  };

  console.log(`   Set X = {${X.elems.join(', ')}} (|X| = ${X.elems.length})`);

  try {
    const endX = codensityOfSet(X);
    
    console.log('   End(X) monad created ✅');
    console.log('   Available operations: T, eta, mu, of, map, chain, ap, run');
    
    // Test with simple set A
    const A: SetObj<number> = {
      id: "A",
      elems: [1, 2],
      eq: (a, b) => a === b
    };
    
    const principal = endX.of(A)(1);
    console.log('   Principal element η_A(1) created ✅');
    
    const result = endX.run(A)(principal)((n: number) => n * 10);
    console.log(`   run(η_A(1))(n => n * 10) = ${result} ✅`);
    
  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }
}

/**
 * Example: Discrete codensity for multiple objects
 */
export function exampleDiscreteCodensity(): void {
  console.log('\n🎮 EXAMPLE: Discrete codensity via codensityOf');
  console.log('-'.repeat(50));

  const objects = ["obj1", "obj2"] as const;
  const G = (b: "obj1" | "obj2") => 
    b === "obj1" 
      ? { id: "G(obj1)", elems: [1, 2], eq: (a: any, b: any) => a === b }
      : { id: "G(obj2)", elems: ["α", "β"], eq: (a: any, b: any) => a === b };

  console.log('   Discrete category: obj1, obj2');
  console.log('   G(obj1) = {1, 2}, G(obj2) = {α, β}');

  try {
    const discreteCodensity = codensityOfDiscrete(objects, G);
    
    console.log('   Discrete codensity created ✅');
    
    const A: SetObj<string> = {
      id: "A",
      elems: ["test"],
      eq: (a, b) => a === b
    };
    
    const element = discreteCodensity.of(A)("test");
    console.log('   Element η_A("test") created ✅');
    
  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }
}

/************ Demonstration Function ************/

export function demonstrateCodensityOf(): void {
  console.log('='.repeat(70));
  console.log('🎯 CODENSITY-OF: DISCOVERABLE ENTRY POINT');
  console.log('='.repeat(70));

  console.log('\n📐 MATHEMATICAL RECIPE:');
  console.log('   Given G: B → Set, construct T^G = Ran_G G');
  console.log('   Formula: T^G(A) = ∫_{b∈B} [[A, G b], G b]');
  console.log('   Result: Codensity monad with familiar interface');

  console.log('\n🔧 DISCOVERABLE API:');
  console.log('   codensityOf(B, G): General construction');
  console.log('   codensityOfSet(X): End(X) monad for Set X');
  console.log('   codensityOfDiscrete(objects, G): Product-like construction');

  console.log('\n🎯 USAGE PATTERN:');
  console.log('   const codensity = Codensity.codensityOf(B, G);');
  console.log('   const computation = codensity.chain(A, B)(k)(codensity.of(A)(a));');
  console.log('   const result = codensity.run(B)(computation)(continuation);');

  // Run examples
  exampleEndMonad();
  exampleDiscreteCodensity();

  console.log('\n' + '='.repeat(70));
  console.log('✅ CODENSITY-OF FEATURES:');
  console.log('   🔹 Single discoverable entry point');
  console.log('   🔹 Follows mathematical recipe exactly');
  console.log('   🔹 Convenience constructors for common cases');
  console.log('   🔹 Integration with existing infrastructure');
  console.log('   🔹 Perfect for documentation and tutorials');
  console.log('='.repeat(70));
}