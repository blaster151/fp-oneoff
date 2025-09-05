/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// kan-ranset-worked-examples.ts
// Comprehensive worked examples of Right Kan extensions and pointwise formulas
// Perfect for documentation and educational purposes

import { 
  RanSet, 
  RanSetDirect,
  createFunctionSpace,
  computeRanEnd,
  demonstrateRanSet
} from "../types/ran-set.js";
import { 
  SmallCategory 
} from "../types/category-to-nerve-sset.js";
import { 
  SetFunctor, 
  SetObj, 
  Functor, 
  HasHom,
  RightKan_Set,
  demoKanExample 
} from "../types/catkit-kan.js";

console.log('='.repeat(80));
console.log('📚 RIGHT KAN EXTENSION WORKED EXAMPLES FOR DOCUMENTATION');
console.log('='.repeat(80));

// ============================================================================
// SECTION 1: Mathematical Foundation
// ============================================================================

console.log('\n📖 SECTION 1: MATHEMATICAL FOUNDATION');
console.log('-'.repeat(50));

console.log(`
🎯 RIGHT KAN EXTENSION FORMULA:
   (Ran_g h)(d) ≅ ∫_c h(c)^{D(d, g c)}

📐 COMPONENTS:
   • g: C → D  (functor)
   • h: C → Set (Set-valued functor)  
   • d: object in D
   • ∫_c: End (limit) over objects c in C
   • h(c)^{D(d, g c)}: Function space (exponential object)
   • D(d, g c): Hom-set from d to g(c) in D

🔧 COMPUTATION STEPS:
   1. For each object c in C, compute D(d, g c)
   2. Build function space h(c)^{D(d, g c)}
   3. Form product over all objects c
   4. Filter by dinaturality constraints
   5. Result: End = {natural families}
`);

// ============================================================================
// SECTION 2: Function Spaces (Exponential Objects)
// ============================================================================

console.log('\n📖 SECTION 2: FUNCTION SPACES');
console.log('-'.repeat(50));

// Example 2.1: Basic function space enumeration
console.log('\n🔹 Example 2.1: Function space enumeration');
const domain = ["a", "b"];
const codomain = [1, 2, 3];
const keyDom = (x: string) => x;

const functionSpaces = createFunctionSpace(domain, codomain, keyDom);

console.log(`   Domain: [${domain.join(', ')}]`);
console.log(`   Codomain: [${codomain.join(', ')}]`);
console.log(`   Function space size: ${functionSpaces.length} (expected: 3^2 = 9)`);
console.log(`   Sample functions:`);

functionSpaces.slice(0, 3).forEach((fs, i) => {
  const mappings = Array.from(fs.entries()).map(([k, v]) => `${k}→${v}`).join(', ');
  console.log(`     f${i + 1}: {${mappings}}`);
});

// Example 2.2: Empty domain case
console.log('\n🔹 Example 2.2: Empty domain (terminal object)');
const emptyDomain: string[] = [];
const emptySpaces = createFunctionSpace(emptyDomain, [1, 2, 3], keyDom);

console.log(`   Empty domain → [1,2,3]: ${emptySpaces.length} function(s)`);
console.log(`   (There's exactly one function from empty set to any set)`);

// Example 2.3: Single element domain
console.log('\n🔹 Example 2.3: Singleton domain');
const singletonSpaces = createFunctionSpace(["x"], ["red", "blue"], (x) => x);

console.log(`   ["x"] → ["red", "blue"]: ${singletonSpaces.length} function(s)`);
singletonSpaces.forEach((fs, i) => {
  const mapping = fs.get("x");
  console.log(`     f${i + 1}: x → ${mapping}`);
});

// ============================================================================
// SECTION 3: Small Categories and Functors
// ============================================================================

console.log('\n📖 SECTION 3: SMALL CATEGORIES AND FUNCTORS');
console.log('-'.repeat(50));

// Example 3.1: Arrow category C: X --u--> Y
console.log('\n🔹 Example 3.1: Arrow category C: X --u--> Y');

type CObj = "X" | "Y";
type CM = { tag: "id", o: CObj } | { tag: "u" };

const ArrowCategory: SmallCategory<CObj, CM> & { objects: CObj[]; morphisms: CM[] } = {
  objects: ["X", "Y"],
  morphisms: [{ tag: "id", o: "X" }, { tag: "id", o: "Y" }, { tag: "u" }],
  id: (o: CObj) => ({ tag: "id", o }),
  src: (m: CM) => m.tag === "id" ? m.o : "X",
  dst: (m: CM) => m.tag === "id" ? m.o : "Y",
  compose: (g: CM, f: CM) => {
    if (f.tag === "id") return g;
    if (g.tag === "id") return f;
    return { tag: "u" };
  }
};

console.log(`   Objects: [${ArrowCategory.objects.join(', ')}]`);
console.log(`   Morphisms: id_X, id_Y, u: X → Y`);
console.log(`   This represents the "walking arrow" - simplest non-trivial category`);

// Example 3.2: Terminal category D: •
console.log('\n🔹 Example 3.2: Terminal category D: •');

type DObj = "*";
type DM = { tag: "id" };

const TerminalCategory: SmallCategory<DObj, DM> & HasHom<DObj, DM> & { objects: DObj[] } = {
  objects: ["*"],
  id: (_) => ({ tag: "id" }),
  src: (_) => "*",
  dst: (_) => "*",
  compose: (_g, _f) => ({ tag: "id" }),
  hom: (_x, _y) => [{ tag: "id" }]
};

console.log(`   Objects: [${TerminalCategory.objects.join(', ')}]`);
console.log(`   Morphisms: id_* only`);
console.log(`   This is the terminal category - exactly one object, one morphism`);

// Example 3.3: Discrete category (no non-identity morphisms)
console.log('\n🔹 Example 3.3: Discrete category A, B');

type DiscreteObj = "A" | "B";
type DiscreteMor = { tag: "id", o: DiscreteObj };

const DiscreteCategory: SmallCategory<DiscreteObj, DiscreteMor> & { objects: DiscreteObj[]; morphisms: DiscreteMor[] } = {
  objects: ["A", "B"],
  morphisms: [{ tag: "id", o: "A" }, { tag: "id", o: "B" }],
  id: (o: DiscreteObj) => ({ tag: "id", o }),
  src: (m: DiscreteMor) => m.o,
  dst: (m: DiscreteMor) => m.o,
  compose: (g: DiscreteMor, f: DiscreteMor) => {
    if (g.o === f.o) return g;
    throw new Error("Cannot compose morphisms between different objects");
  }
};

console.log(`   Objects: [${DiscreteCategory.objects.join(', ')}]`);
console.log(`   Morphisms: id_A, id_B only`);
console.log(`   No morphisms between different objects - completely disconnected`);

// ============================================================================
// SECTION 4: Set-Valued Functors
// ============================================================================

console.log('\n📖 SECTION 4: SET-VALUED FUNCTORS');
console.log('-'.repeat(50));

// Example 4.1: Functor h: ArrowCategory → Set
console.log('\n🔹 Example 4.1: Set-valued functor on arrow category');

const set = <A>(id: string, xs: A[], eq: (a: A, b: A) => boolean): SetObj<A> => 
  ({ id, elems: xs, eq });

const HX = set("H(X)", ["x0", "x1"], (a, b) => a === b);
const HY = set("H(Y)", ["y0"], (a, b) => a === b);

const h_arrow: SetFunctor<CObj, CM> = {
  obj: (c) => c === "X" ? HX : HY,
  map: (u) => (x: any) => {
    if (u.tag === "id") return x;
    // u: X→Y, collapse both x0,x1 to y0
    return "y0";
  }
};

console.log(`   H(X) = {${HX.elems.join(', ')}} (${HX.elems.length} elements)`);
console.log(`   H(Y) = {${HY.elems.join(', ')}} (${HY.elems.length} elements)`);
console.log(`   H(u: X→Y) maps both x0,x1 to y0 (collapse operation)`);

// Example 4.2: Functor on discrete category
console.log('\n🔹 Example 4.2: Set-valued functor on discrete category');

const HA = set("H(A)", [0, 1], (a, b) => a === b);
const HB = set("H(B)", ["α", "β", "γ"], (a, b) => a === b);

const h_discrete: SetFunctor<DiscreteObj, DiscreteMor> = {
  obj: (o) => o === "A" ? HA : HB,
  map: (m) => (x: any) => x // Identity on morphisms (only identities exist)
};

console.log(`   H(A) = {${HA.elems.join(', ')}} (${HA.elems.length} elements)`);
console.log(`   H(B) = {${HB.elems.join(', ')}} (${HB.elems.length} elements)`);
console.log(`   Expected limit size: |H(A)| × |H(B)| = ${HA.elems.length} × ${HB.elems.length} = ${HA.elems.length * HB.elems.length}`);

// ============================================================================
// SECTION 5: Right Kan Extension Computation
// ============================================================================

console.log('\n📖 SECTION 5: RIGHT KAN EXTENSION COMPUTATION');
console.log('-'.repeat(50));

// Example 5.1: Right Kan extension along constant functor
console.log('\n🔹 Example 5.1: Ran along constant functor C → •');

// Constant functor g: C → D (everything maps to *)
const g_constant: Functor<CObj, CM, DObj, DM> = {
  Fobj: (_) => "*",
  Fmor: (_) => ({ tag: "id" })
};

const keyC = (c: CObj) => c;
const keyDMor = (_: DM) => "id";

try {
  // Use existing robust implementation
  const Ran = RightKan_Set(ArrowCategory, TerminalCategory, g_constant, h_arrow, keyC, keyDMor);
  const RanStar = Ran.obj("*");
  
  console.log(`   Computing (Ran_g h)(*)...`);
  console.log(`   Result: ${RanStar.elems.length} natural families`);
  console.log(`   Each family assigns functions D(*,g(c)) → h(c) for each c`);
  
  if (RanStar.elems.length > 0 && RanStar.elems.length <= 3) {
    console.log(`   Sample natural family structure:`);
    const sample = RanStar.elems[0] as any;
    if (typeof sample === 'object') {
      Object.keys(sample).forEach(key => {
        if (key !== '__objects' && key !== '__type') {
          const component = sample[key];
          if (component && typeof component === 'object' && component.__dom) {
            console.log(`     Component at ${key}: domain size ${component.__dom.length}, codomain size ${component.__cod?.length || '?'}`);
          }
        }
      });
    }
  }
  
} catch (error) {
  console.log(`   Error computing Right Kan extension: ${(error as Error).message}`);
}

// Example 5.2: Discrete category case (should give product)
console.log('\n🔹 Example 5.2: Discrete category → Terminal (limit = product)');

const g_discrete: Functor<DiscreteObj, DiscreteMor, DObj, DM> = {
  Fobj: (_) => "*",
  Fmor: (_) => ({ tag: "id" })
};

const keyDiscrete = (o: DiscreteObj) => o;

try {
  const RanDiscrete = RightKan_Set(
    DiscreteCategory, 
    TerminalCategory, 
    g_discrete, 
    h_discrete, 
    keyDiscrete, 
    keyDMor
  );
  const RanStarDiscrete = RanDiscrete.obj("*");
  
  console.log(`   For discrete category: (Ran_! h)(*)...`);
  console.log(`   Mathematical expectation: lim h ≅ h(A) × h(B)`);
  console.log(`   Expected size: ${HA.elems.length} × ${HB.elems.length} = ${HA.elems.length * HB.elems.length}`);
  console.log(`   Computed size: ${RanStarDiscrete.elems.length}`);
  
  // The actual implementation may represent the product differently,
  // but should capture the mathematical essence
  
} catch (error) {
  console.log(`   Error: ${(error as Error).message}`);
}

// ============================================================================
// SECTION 6: Dinaturality and Natural Families
// ============================================================================

console.log('\n📖 SECTION 6: DINATURALITY AND NATURAL FAMILIES');
console.log('-'.repeat(50));

console.log(`
🔍 DINATURALITY CONDITION:
   For each morphism u: c → c' in C, natural families must satisfy:
   
   H(u) ∘ α_c = α_c' ∘ (g(u) ∘ -)
   
   Where:
   • α_c: D(d, g(c)) → H(c) (component at object c)
   • α_c': D(d, g(c')) → H(c') (component at object c')  
   • H(u): H(c) → H(c') (functor action)
   • g(u): g(c) → g(c') (functor action)

📊 INTERPRETATION:
   This ensures the family of functions forms a "natural transformation"
   from the contravariant hom-functor D(d, g(-)) to H.
   
   Only families satisfying this condition for ALL morphisms u
   are included in the final end computation.
`);

// Example 6.1: Checking dinaturality manually
console.log('\n🔹 Example 6.1: Dinaturality verification concept');

console.log(`   For arrow category with morphism u: X → Y:
   
   Given family: α_X: D(*,*) → H(X), α_Y: D(*,*) → H(Y)
   
   Must check: H(u)(α_X(id_*)) = α_Y(g(u) ∘ id_*)
   
   Since g is constant: g(u) = id_*, so g(u) ∘ id_* = id_*
   
   Condition becomes: H(u)(α_X(id_*)) = α_Y(id_*)
   
   This constrains which families are natural!`);

// ============================================================================
// SECTION 7: Integration with Existing Infrastructure
// ============================================================================

console.log('\n📖 SECTION 7: INTEGRATION WITH EXISTING INFRASTRUCTURE');
console.log('-'.repeat(50));

// Example 7.1: Using existing Kan extension demo
console.log('\n🔹 Example 7.1: Existing Kan extension infrastructure');

try {
  console.log(`   Running existing demoKanExample():`);
  demoKanExample();
} catch (error) {
  console.log(`   Error running demo: ${(error as Error).message}`);
}

// Example 7.2: Comparison of implementations
console.log('\n🔹 Example 7.2: Implementation comparison');

console.log(`   Available implementations:
   
   1. RightKan_Set (existing, robust)
      • Production-ready implementation
      • Handles complex cases efficiently
      • Returns families as Map structures
      
   2. RanSet (new, delegates to existing)
      • Clean API following pointwise formula
      • Integrates with existing infrastructure
      • Type-safe categorical computation
      
   3. RanSetDirect (new, educational)
      • Direct implementation of mathematical formula
      • Explicit end computation with dinaturality
      • Perfect for understanding the theory
   
   All three compute the same mathematical object!`);

// ============================================================================
// SECTION 8: Practical Applications
// ============================================================================

console.log('\n📖 SECTION 8: PRACTICAL APPLICATIONS');
console.log('-'.repeat(50));

console.log(`
🎯 RIGHT KAN EXTENSIONS IN PRACTICE:

📚 THEORETICAL APPLICATIONS:
   • Codensity monads: Codensity f ≅ Ran f f
   • Kan extension calculus: Compositionality properties
   • Adjoint functor theorem: Right adjoints as Kan extensions
   • Sheaf theory: Sheafification via Kan extensions

🔧 COMPUTATIONAL APPLICATIONS:  
   • Database query optimization: Limits as products
   • Distributed systems: Consensus as limits
   • Type theory: Dependent types via Kan extensions
   • Category theory libraries: Foundation for higher constructs

📊 DATA SCIENCE APPLICATIONS:
   • Feature aggregation: Limits over data categories
   • Model composition: Functorial data pipelines  
   • Schema integration: Kan extensions for data fusion
   • Probabilistic programming: Measure-theoretic limits

🌐 SOFTWARE ENGINEERING:
   • Module systems: Interfaces as Kan extensions
   • Configuration management: Environment composition
   • Plugin architectures: Extension mechanisms
   • Domain-specific languages: Semantic foundations
`);

// ============================================================================
// SECTION 9: Advanced Examples
// ============================================================================

console.log('\n📖 SECTION 9: ADVANCED EXAMPLES');
console.log('-'.repeat(50));

// Example 9.1: Identity Kan extension
console.log('\n🔹 Example 9.1: Identity Right Kan extension');

console.log(`   Theoretical result: Ran_id h ≅ h
   
   When g = identity functor, the Right Kan extension
   should be naturally isomorphic to the original functor h.
   
   This is a fundamental property that validates our implementation.`);

// Example 9.2: Composition of Kan extensions  
console.log('\n🔹 Example 9.2: Composition properties');

console.log(`   Theoretical result: Ran_g (Ran_f h) ≅ Ran_{g∘f} h
   
   Kan extensions compose in a natural way, reflecting
   the compositional structure of the underlying functors.
   
   This property is crucial for building complex categorical constructions.`);

// Example 9.3: Adjunction relationship
console.log('\n🔹 Example 9.3: Adjunction with Left Kan extension');

console.log(`   Theoretical result: Lan_g ⊣ precomposition by g ⊣ Ran_g
   
   Left and Right Kan extensions form adjoints with precomposition,
   creating a fundamental adjoint triple in category theory.
   
   This relationship underlies many important constructions.`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 SUMMARY OF RIGHT KAN EXTENSION EXAMPLES');
console.log('='.repeat(80));

console.log(`
✅ MATHEMATICAL FOUNDATION:
   • Pointwise formula: (Ran_g h)(d) ≅ ∫_c h(c)^{D(d, g c)}
   • Function spaces and exponential objects
   • End computation with dinaturality constraints
   
✅ CATEGORICAL STRUCTURES:
   • Small categories: Arrow, Terminal, Discrete
   • Set-valued functors with concrete examples
   • Natural transformations and dinaturality
   
✅ COMPUTATIONAL EXAMPLES:
   • Function space enumeration (3^2 = 9 functions)
   • Constant functors and terminal objects
   • Discrete categories yielding products
   
✅ IMPLEMENTATION COMPARISON:
   • RightKan_Set: Production-ready, robust
   • RanSet: Clean API, integrates existing infrastructure  
   • RanSetDirect: Educational, explicit mathematics
   
✅ THEORETICAL CONNECTIONS:
   • Identity Kan extensions: Ran_id h ≅ h
   • Composition properties: Ran_g (Ran_f h) ≅ Ran_{g∘f} h
   • Adjunction relationships: Lan_g ⊣ (-) ∘ g ⊣ Ran_g
   
✅ PRACTICAL APPLICATIONS:
   • Codensity monads for performance optimization
   • Database query optimization via limits
   • Type theory and dependent types
   • Software architecture and module systems
   
🎓 EDUCATIONAL VALUE:
   • Step-by-step mathematical development
   • Concrete examples with small categories
   • Integration with existing infrastructure
   • Bridge between theory and implementation
   • Perfect foundation for codensity monads!
`);

console.log('='.repeat(80));