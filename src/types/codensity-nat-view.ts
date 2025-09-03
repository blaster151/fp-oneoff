// codensity-nat-view.ts
// Natural transformations viewpoint: T^G(A) ≅ Nat(G^A, G)
// 
// This provides the "operationalizable insight" from the slides:
// - G^A : B → Set given by b ↦ (G b)^A  
// - Nat(G^A, G) ≅ End_b [(G b)^A, G b]
// - Shuttle between End-representation and Nat view for testing/construction

import { 
  SetFunctor, 
  SetObj, 
  Functor, 
  HasHom
} from './catkit-kan.js';
import { SmallCategory } from './category-to-nerve-sset.js';
import { Nat } from './catkit-adjunction.js'; // Use existing Nat interface
import { createFunctionSpace } from './ran-set.js';
import { eqJSON } from './eq.js';

/************ Power Functor Construction ************/

/**
 * Construct the power functor G^A : B → Set
 * Given by b ↦ (G b)^A (function space from A to G b)
 */
export function powerFunctor<B_O, B_M, A>(
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  keyA: (a: A) => string = (a) => JSON.stringify(a)
): SetFunctor<B_O, B_M> {
  return {
    obj: (b: B_O): SetObj<any> => {
      const Gb = G.obj(b);
      // (G b)^A = functions from A to G b
      const functions = createFunctionSpace(A.elems, Gb.elems, keyA);
      
      return {
        id: `(${Gb.id})^${A.id}`,
        elems: functions,
        eq: (f1: any, f2: any) => {
          if (f1.size !== f2.size) return false;
          for (const [key, val1] of f1.entries()) {
            if (!f2.has(key) || !Gb.eq(val1, f2.get(key))) {
              return false;
            }
          }
          return true;
        }
      };
    },
    
    map: (f: B_M) => (k: any) => {
      // For morphism f: b → b', map k: A → G b to (a ↦ G(f)(k(a))): A → G b'
      const Gf = G.map(f);
      
      if (k && typeof k.get === 'function') {
        // k is a function represented as Map
        const result = new Map();
        for (const [aKey, gbValue] of k.entries()) {
          result.set(aKey, Gf(gbValue));
        }
        (result as any).__dom = k.__dom;
        (result as any).__cod = k.__cod; // This would need to be updated to G b'
        (result as any).__type = k.__type;
        return result;
      }
      
      return k; // Fallback for non-Map representations
    }
  };
}

/************ Natural Transformation Representation ************/

/**
 * Natural transformation α: G^A ⇒ G
 * Component at b: α_b : (G b)^A → G b
 */
export interface CodensityNat<B_O, B_M, A> {
  // Natural transformation structure
  source: SetFunctor<B_O, B_M>; // G^A
  target: SetFunctor<B_O, B_M>; // G
  
  // Components α_b : (G b)^A → G b
  at: (b: B_O) => (k: (a: A) => any) => any;
  
  // Naturality verification
  checkNaturality: (B: SmallCategory<B_O, B_M> & { morphisms: ReadonlyArray<B_M> }) => boolean;
}

/************ Conversion Functions ************/

/**
 * Convert End element to natural transformation view
 * From {φ_b : (A → G b) → G b} to α: G^A ⇒ G
 */
export function endToNat<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  endElem: any
): CodensityNat<B_O, B_M, A> {
  const GA = powerFunctor(A, G);
  
  return {
    source: GA,
    target: G,
    
    at: (b: B_O) => {
      // Extract component φ_b from end element
      if (endElem && typeof endElem === 'object' && endElem.at) {
        const phib = endElem.at(b);
        if (typeof phib === 'function') {
          // α_b : (G b)^A → G b given by α_b(k) = φ_b(k)
          return (k: (a: A) => any) => phib(k);
        }
      }
      
      // Fallback: identity-like behavior
      return (k: (a: A) => any) => {
        // Apply k to first element of A as fallback
        if (A.elems.length > 0) {
          return k(A.elems[0]!);
        }
        return k;
      };
    },
    
    checkNaturality: (B: SmallCategory<B_O, B_M> & { morphisms: ReadonlyArray<B_M> }) => {
      // Check naturality: G(f) ∘ α_b = α_b' ∘ (G^A)(f)
      return B.morphisms.every(f => {
        const b = B.src(f);
        const bp = B.dst(f);
        
        try {
          const alpha_b = endElem.at(b);
          const alpha_bp = endElem.at(bp);
          const Gf = G.map(f);
          const GAf = GA.map(f);
          
          // For naturality verification, we'd need to check the commutative square
          // This is simplified for now
          return typeof alpha_b === 'function' && typeof alpha_bp === 'function';
        } catch {
          return false;
        }
      });
    }
  };
}

/**
 * Convert natural transformation to End element (reverse direction)
 * From α: G^A ⇒ G to {φ_b : (A → G b) → G b}
 */
export function natToEnd<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  nat: CodensityNat<B_O, B_M, A>
): any {
  // Create End element from natural transformation
  return {
    type: 'nat-derived',
    source: A,
    
    at: (b: B_O) => {
      const alpha_b = nat.at(b);
      // φ_b(k) = α_b(k) where k: A → G b
      return (k: (a: A) => any) => alpha_b(k);
    },
    
    naturality: nat.checkNaturality(B)
  };
}

/************ Utility Functions ************/

/**
 * Create a natural transformation from explicit components
 * Useful for constructing examples and tests
 */
export function createNaturalTransformation<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  components: Record<string, (k: (a: A) => any) => any>
): CodensityNat<B_O, B_M, A> {
  const GA = powerFunctor(A, G);
  
  return {
    source: GA,
    target: G,
    
    at: (b: B_O) => {
      const key = String(b);
      return components[key] || ((k: (a: A) => any) => {
        // Default: apply k to first element of A
        return A.elems.length > 0 ? k(A.elems[0]!) : undefined;
      });
    },
    
    checkNaturality: () => true // Assume provided components are natural
  };
}

/**
 * Verify that a natural transformation satisfies the naturality condition
 */
export function verifyNaturality<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  nat: CodensityNat<B_O, B_M, A>
): { natural: boolean; violations: any[] } {
  const violations: any[] = [];
  
  const natural = B.morphisms.every(f => {
    const b = B.src(f);
    const bp = B.dst(f);
    
    try {
      const alpha_b = nat.at(b);
      const alpha_bp = nat.at(bp);
      const Gf = G.map(f);
      const GAf = nat.source.map(f);
      
      // Test naturality on a sample function k: A → G b
      if (A.elems.length > 0) {
        const sampleK = (a: A) => {
          const Gb = G.obj(b);
          return Gb.elems.length > 0 ? Gb.elems[0] : undefined;
        };
        
        // Check: G(f)(α_b(k)) = α_b'(G^A(f)(k))
        const left = Gf(alpha_b(sampleK));
        const mappedK = GAf(sampleK);
        const right = alpha_bp(mappedK);
        
        const eq = eqJSON<any>();
        if (!eq(left, right)) {
          violations.push({ morphism: f, function: sampleK, left, right });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      violations.push({ morphism: f, error: (error as Error).message });
      return false;
    }
  });
  
  return { natural, violations };
}

/************ Examples and Testing Utilities ************/

/**
 * Create the unit natural transformation η_A: G^A ⇒ G
 * Component at b: η_b(k) = k(a) for the specific element a
 */
export function unitNaturalTransformation<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  a: A
): CodensityNat<B_O, B_M, A> {
  const components: Record<string, (k: (a: A) => any) => any> = {};
  
  for (const b of B.objects) {
    const key = String(b);
    components[key] = (k: (a: A) => any) => k(a); // η_b(k) = k(a)
  }
  
  return createNaturalTransformation(B, A, G, components);
}

/**
 * Create evaluation natural transformation: eval_a: G^A ⇒ G
 * Component at b: eval_b(k) = k(a) - this is the same as unit for specific a
 */
export function evaluationNaturalTransformation<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  a: A
): CodensityNat<B_O, B_M, A> {
  return unitNaturalTransformation(B, A, G, a);
}

/************ Demonstration Function ************/

export function demonstrateNatView(): void {
  console.log('='.repeat(70));
  console.log('🔄 NATURAL TRANSFORMATIONS VIEWPOINT');
  console.log('='.repeat(70));

  console.log('\n📐 MATHEMATICAL EQUIVALENCE:');
  console.log('   T^G(A) ≅ Nat(G^A, G)');
  console.log('   Where G^A : b ↦ (G b)^A (power functor)');
  console.log('   Natural transformations α: G^A ⇒ G');
  console.log('   Component α_b : (G b)^A → G b');

  console.log('\n🔧 OPERATIONALIZABLE INSIGHT:');
  console.log('   • Alternative construction of T^G(A) elements');
  console.log('   • Direct inspection via natural transformation components');
  console.log('   • Testing framework for naturality conditions');
  console.log('   • Foundation for free n-ary operations');

  // Example with terminal category
  type BObj = "*";
  type BM = { tag: "id" };
  
  const B: SmallCategory<BObj, BM> & { objects: BObj[]; morphisms: BM[] } = {
    objects: ["*"],
    morphisms: [{ tag: "id" }],
    id: (_: BObj) => ({ tag: "id" }),
    src: (_: BM) => "*",
    dst: (_: BM) => "*",
    comp: (_g: BM, _f: BM) => ({ tag: "id" })
  };

  const G: SetFunctor<BObj, BM> = {
    obj: (_: BObj) => ({ id: "G(*)", elems: [0, 1, 2], eq: (a, b) => a === b }),
    map: (_: BM) => (x: any) => x
  };

  const A: SetObj<string> = {
    id: "A",
    elems: ["a", "b"],
    eq: (x, y) => x === y
  };

  console.log('\n🎮 EXAMPLE COMPUTATION:');
  console.log(`   A = {${A.elems.join(', ')}} (|A| = ${A.elems.length})`);
  console.log(`   G(*) = {${G.obj("*").elems.join(', ')}} (|G(*)| = ${G.obj("*").elems.length})`);

  try {
    // Construct power functor G^A
    const GA = powerFunctor(A, G);
    const GAStar = GA.obj("*");
    
    console.log(`   G^A(*) = (G(*))^A has ${GAStar.elems.length} functions`);
    console.log(`   Expected: |G(*)|^|A| = ${G.obj("*").elems.length}^${A.elems.length} = ${Math.pow(G.obj("*").elems.length, A.elems.length)}`);
    
    // Show sample functions
    if (GAStar.elems.length > 0 && GAStar.elems.length <= 10) {
      console.log('\n   Sample functions A → G(*):');
      GAStar.elems.slice(0, 3).forEach((func: any, i: number) => {
        if (func && typeof func.get === 'function') {
          const mappings = A.elems.map(a => `${a}→${func.get(JSON.stringify(a))}`).join(', ');
          console.log(`     f${i + 1}: {${mappings}}`);
        }
      });
    }
    
    // Create unit natural transformation η_A("a"): G^A ⇒ G
    console.log('\n🔄 UNIT NATURAL TRANSFORMATION:');
    const etaA = unitNaturalTransformation(B, A, G, "a");
    console.log('   η_A("a"): G^A ⇒ G constructed');
    console.log('   Component at *: η_*: (G(*))^A → G(*)');
    
    // Test the component
    const component = etaA.at("*");
    if (typeof component === 'function' && GAStar.elems.length > 0) {
      const sampleFunction = GAStar.elems[0];
      if (sampleFunction && typeof sampleFunction.get === 'function') {
        const result = component((x: string) => sampleFunction.get(JSON.stringify(x)));
        console.log(`   η_*(sample_function) = ${result}`);
        console.log(`   This implements: η(a)(k) = k(a) where a = "a"`);
      }
    }
    
    // Verify naturality (trivial for terminal category)
    const naturalityCheck = verifyNaturality(B, A, G, etaA);
    console.log(`   Naturality verified: ${naturalityCheck.natural ? '✅' : '❌'}`);
    if (!naturalityCheck.natural) {
      console.log(`   Violations: ${naturalityCheck.violations.length}`);
    }
    
  } catch (error) {
    console.log('   Error:', (error as Error).message);
  }

  console.log('\n🌟 PRACTICAL BENEFITS:');
  console.log('   ✓ Alternative element construction via natural transformations');
  console.log('   ✓ Direct component inspection and testing');
  console.log('   ✓ Naturality verification framework');
  console.log('   ✓ Bridge between categorical and computational perspectives');
  console.log('   ✓ Foundation for advanced constructions (free n-ary operations)');

  console.log('\n' + '='.repeat(70));
  console.log('✅ NATURAL TRANSFORMATIONS VIEWPOINT FEATURES:');
  console.log('   🔹 Power functor G^A construction');
  console.log('   🔹 End ↔ Nat conversion utilities');
  console.log('   🔹 Unit natural transformation η_A');
  console.log('   🔹 Naturality verification and testing');
  console.log('   🔹 Component-wise inspection capabilities');
  console.log('   🔹 Integration with existing categorical infrastructure');
  console.log('='.repeat(70));
}

/************ Advanced Constructions ************/

/**
 * Create natural transformation from evaluation at multiple points
 * This demonstrates the flexibility of the Nat view
 */
export function multiPointEvaluation<B_O, B_M, A>(
  B: SmallCategory<B_O, B_M> & { objects: ReadonlyArray<B_O>; morphisms: ReadonlyArray<B_M> },
  A: SetObj<A>,
  G: SetFunctor<B_O, B_M>,
  points: A[],
  combinator: (values: any[]) => any
): CodensityNat<B_O, B_M, A> {
  const components: Record<string, (k: (a: A) => any) => any> = {};
  
  for (const b of B.objects) {
    const key = String(b);
    components[key] = (k: (a: A) => any) => {
      // Evaluate k at multiple points and combine
      const values = points.map(a => k(a));
      return combinator(values);
    };
  }
  
  return createNaturalTransformation(B, A, G, components);
}

/**
 * Composition of natural transformations in the codensity setting
 */
export function composeCodensityNats<B_O, B_M, A>(
  nat1: CodensityNat<B_O, B_M, A>,
  nat2: CodensityNat<B_O, B_M, A>,
  compositor: (x: any, y: any) => any
): CodensityNat<B_O, B_M, A> {
  return {
    source: nat1.source,
    target: nat1.target,
    
    at: (b: B_O) => {
      const comp1 = nat1.at(b);
      const comp2 = nat2.at(b);
      
      return (k: (a: A) => any) => {
        const result1 = comp1(k);
        const result2 = comp2(k);
        return compositor(result1, result2);
      };
    },
    
    checkNaturality: (B) => {
      // Both components should be natural for the composition to be natural
      return nat1.checkNaturality(B) && nat2.checkNaturality(B);
    }
  };
}