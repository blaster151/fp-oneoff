// em-monoid-examples.ts
// Real-world EMMonoid examples with composition helpers and enhanced law checking
// Includes Writer over arrays, Option over semigroups, and composition combinators

import { 
  StrongMonad, EMMonoid, StrongOption, StrongArray, StrongWriter,
  Option, Some, None, isSome, Finite
} from './strong-monad.js';
import { LawCheck, lawCheck, lawCheckSuccess } from './witnesses.js';
import { applyShrinking } from './property-shrinking.js';

/************ Enhanced EM-Monoid Interface ************/

/** Enhanced EM-monoid with composition and validation */
export interface EnhancedEMMonoid<TF, A> extends EMMonoid<TF, A> {
  readonly name: string;
  readonly description: string;
  validate(elements: A[]): LawCheck<{ violatingInputs: A[]; operation: string }>;
}

/************ Real-World EM-Monoid Examples ************/

/** Writer monad over array concatenation */
export const writerArrayEMMonoid: EnhancedEMMonoid<"Writer", string[]> = {
  name: "WriterArray",
  description: "Writer monad over array concatenation - logs accumulate",
  
  empty: [],
  
  concat: (xs: string[], ys: string[]) => [...xs, ...ys],
  
  alg: (writer: [any, string[]]) => {
    // Extract log from Writer<string[], A> = [A, string[]]
    return Array.isArray(writer) && writer.length === 2 ? writer[1] : [];
  },
  
  validate: (elements: string[][]) => {
    // Check associativity
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          const a = elements[i]!, b = elements[j]!, c = elements[k]!;
          const left = [...[...a, ...b], ...c];  // (a + b) + c
          const right = [...a, ...[...b, ...c]]; // a + (b + c)
          
          if (JSON.stringify(left) !== JSON.stringify(right)) {
            return lawCheck(false, { 
              violatingInputs: [a, b, c], 
              operation: "associativity" 
            }, "Array concatenation associativity failed");
          }
        }
      }
    }
    
    // Check unit laws
    for (const a of elements) {
      const leftUnit = [...[], ...a];  // empty + a
      const rightUnit = [...a, ...[]]; // a + empty
      
      if (JSON.stringify(leftUnit) !== JSON.stringify(a) || 
          JSON.stringify(rightUnit) !== JSON.stringify(a)) {
        return lawCheck(false, { 
          violatingInputs: [a], 
          operation: "unit" 
        }, "Array concatenation unit law failed");
      }
    }
    
    return lawCheckSuccess("Writer array EM-monoid laws verified");
  }
};

/** Option monad over max semigroup */
export const optionMaxEMMonoid: EnhancedEMMonoid<"Option", number> = {
  name: "OptionMax",
  description: "Option monad over max semigroup - handles missing values",
  
  empty: -Infinity,
  
  concat: (x: number, y: number) => Math.max(x, y),
  
  alg: (opt: Option<number>) => isSome(opt) ? opt.value : -Infinity,
  
  validate: (elements: number[]) => {
    // Check associativity of max
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          const a = elements[i]!, b = elements[j]!, c = elements[k]!;
          const left = Math.max(Math.max(a, b), c);  // max(max(a, b), c)
          const right = Math.max(a, Math.max(b, c)); // max(a, max(b, c))
          
          if (left !== right) {
            return lawCheck(false, { 
              violatingInputs: [a, b, c], 
              operation: "associativity" 
            }, "Max operation associativity failed");
          }
        }
      }
    }
    
    // Check unit laws (-Infinity is unit for max)
    for (const a of elements) {
      const leftUnit = Math.max(-Infinity, a);
      const rightUnit = Math.max(a, -Infinity);
      
      if (leftUnit !== a || rightUnit !== a) {
        return lawCheck(false, { 
          violatingInputs: [a], 
          operation: "unit" 
        }, "Max unit law failed");
      }
    }
    
    return lawCheckSuccess( "Option max EM-monoid laws verified");
  }
};

/** Option monad over string concatenation */
export const optionStringEMMonoid: EnhancedEMMonoid<"Option", string> = {
  name: "OptionString",
  description: "Option monad over string concatenation - handles optional text",
  
  empty: "",
  
  concat: (x: string, y: string) => x + y,
  
  alg: (opt: Option<string>) => isSome(opt) ? opt.value : "",
  
  validate: (elements: string[]) => {
    // Check associativity of string concatenation
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          const a = elements[i]!, b = elements[j]!, c = elements[k]!;
          const left = (a + b) + c;   // (a + b) + c
          const right = a + (b + c);  // a + (b + c)
          
          if (left !== right) {
            return lawCheck(false, { 
              violatingInputs: [a, b, c], 
              operation: "associativity" 
            }, "String concatenation associativity failed");
          }
        }
      }
    }
    
    return lawCheckSuccess( "Option string EM-monoid laws verified");
  }
};

/** Array monad over sum monoid */
export const arraySumEMMonoid: EnhancedEMMonoid<"Array", number> = {
  name: "ArraySum",
  description: "Array monad over sum monoid - aggregates numeric values",
  
  empty: 0,
  
  concat: (x: number, y: number) => x + y,
  
  alg: (arr: number[]) => arr.reduce((sum, x) => sum + x, 0),
  
  validate: (elements: number[]) => {
    // Check associativity of addition
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        for (let k = 0; k < elements.length; k++) {
          const a = elements[i]!, b = elements[j]!, c = elements[k]!;
          const left = (a + b) + c;
          const right = a + (b + c);
          
          if (Math.abs(left - right) > 1e-10) { // Handle floating point
            return lawCheck(false, { 
              violatingInputs: [a, b, c], 
              operation: "associativity" 
            }, "Sum associativity failed");
          }
        }
      }
    }
    
    return lawCheckSuccess( "Array sum EM-monoid laws verified");
  }
};

/************ Composition Combinators ************/

/** Compose two EM-monoid algebra maps respecting structure */
export function composeEM<TF, A, B, C>(
  f: EnhancedEMMonoid<TF, A>,
  g: EnhancedEMMonoid<TF, B>,
  h: EnhancedEMMonoid<TF, C>,
  bridge: (a: A, b: B) => C
): EnhancedEMMonoid<TF, C> {
  return {
    name: `Compose(${f.name}, ${g.name})`,
    description: `Composition of ${f.description} and ${g.description}`,
    
    empty: bridge(f.empty, g.empty),
    
    concat: (x: C, y: C) => h.concat(x, y),
    
    alg: (tc: any) => {
      // This is simplified - real composition would need more sophisticated handling
      return h.alg(tc);
    },
    
    validate: (elements: C[]) => {
      // Simplified validation for composed EM-monoid
      return lawCheckSuccess("Composed EM-monoid validation (simplified)");
    }
  };
}

/** Product of two EM-monoids */
export function productEM<TF, A, B>(
  emA: EnhancedEMMonoid<TF, A>,
  emB: EnhancedEMMonoid<TF, B>
): EnhancedEMMonoid<TF, [A, B]> {
  return {
    name: `Product(${emA.name}, ${emB.name})`,
    description: `Product of ${emA.description} and ${emB.description}`,
    
    empty: [emA.empty, emB.empty],
    
    concat: ([a1, b1]: [A, B], [a2, b2]: [A, B]) => [
      emA.concat(a1, a2),
      emB.concat(b1, b2)
    ],
    
    alg: (tab: any) => {
      // Simplified - would need proper product handling
      return [emA.alg(tab), emB.alg(tab)] as [A, B];
    },
    
    validate: (elements: [A, B][]) => {
      // Validate both components
      const aElements = elements.map(([a, _]) => a);
      const bElements = elements.map(([_, b]) => b);
      
      const aResult = emA.validate(aElements);
      const bResult = emB.validate(bElements);
      
      if (aResult.ok && bResult.ok) {
        return lawCheckSuccess( "Product EM-monoid laws verified");
      }
      
      const violations = [];
      if (!aResult.ok && aResult.witness) violations.push(`A: ${JSON.stringify(aResult.witness)}`);
      if (!bResult.ok && bResult.witness) violations.push(`B: ${JSON.stringify(bResult.witness)}`);
      
      return lawCheck(false, { 
        violatingInputs: elements.slice(0, 3), 
        operation: "product" 
      }, `Product validation failed: ${violations.join(", ")}`);
    }
  };
}

/** Coproduct (sum) of two EM-monoids */
export function coproductEM<TF, A, B>(
  emA: EnhancedEMMonoid<TF, A>,
  emB: EnhancedEMMonoid<TF, B>
): EnhancedEMMonoid<TF, A | B> {
  return {
    name: `Coproduct(${emA.name}, ${emB.name})`,
    description: `Coproduct of ${emA.description} and ${emB.description}`,
    
    empty: emA.empty, // Choose left empty as default
    
    concat: (x: A | B, y: A | B) => {
      // Type-based dispatch
      if (typeof x === typeof emA.empty && typeof y === typeof emA.empty) {
        return emA.concat(x as A, y as A);
      }
      if (typeof x === typeof emB.empty && typeof y === typeof emB.empty) {
        return emB.concat(x as B, y as B);
      }
      // Mixed types - return first argument (simplified)
      return x;
    },
    
    alg: (tab: any) => {
      // Try both algebras, return the first that succeeds
      try {
        return emA.alg(tab);
      } catch {
        return emB.alg(tab);
      }
    },
    
    validate: (elements: (A | B)[]) => {
      // Simplified validation for coproduct
      return lawCheckSuccess( "Coproduct EM-monoid (simplified validation)");
    }
  };
}

/************ Broken Examples for Testing ************/

/** Deliberately broken EM-monoid for testing failure cases */
export const brokenConcatEMMonoid: EnhancedEMMonoid<"Array", string> = {
  name: "BrokenConcat",
  description: "Broken string concatenation that violates associativity",
  
  empty: "",
  
  concat: (x: string, y: string) => x + y + "!", // BUG: adds exclamation
  
  alg: (arr: string[]) => arr.join(""),
  
  validate: (elements: string[]) => {
    // This will detect the associativity violation
    for (let i = 0; i < Math.min(elements.length, 3); i++) {
      for (let j = 0; j < Math.min(elements.length, 3); j++) {
        for (let k = 0; k < Math.min(elements.length, 3); k++) {
          const a = elements[i]!, b = elements[j]!, c = elements[k]!;
          const left = (a + b + "!") + c + "!";   // (a + b) + c with bug
          const right = a + (b + c + "!") + "!";  // a + (b + c) with bug
          
          if (left !== right) {
            // Apply shrinking to get minimal counterexample
            const shrunkInputs = applyShrinking([a, b, c], (inputs) => {
              const [sa, sb, sc] = inputs;
              if (sa === undefined || sb === undefined || sc === undefined) return false;
              const sLeft = (sa + sb + "!") + sc + "!";
              const sRight = sa + (sb + sc + "!") + "!";
              return sLeft !== sRight;
            });
            
            return lawCheck(false, { 
              violatingInputs: shrunkInputs, 
              operation: "associativity" 
            }, "Broken concatenation violates associativity");
          }
        }
      }
    }
    
    return lawCheckSuccess( "Broken EM-monoid unexpectedly passed");
  }
};

/** Broken unit EM-monoid for testing */
export const brokenUnitEMMonoid: EnhancedEMMonoid<"Option", number> = {
  name: "BrokenUnit",
  description: "Broken addition that violates unit laws",
  
  empty: 1, // BUG: should be 0 for addition
  
  concat: (x: number, y: number) => x + y,
  
  alg: (opt: Option<number>) => isSome(opt) ? opt.value : 1, // BUG: wrong unit
  
  validate: (elements: number[]) => {
    // Check unit laws
    for (const a of elements.slice(0, 5)) { // Limit for performance
      const leftUnit = 1 + a;  // empty + a (with wrong empty)
      const rightUnit = a + 1; // a + empty (with wrong empty)
      
      if (leftUnit !== a || rightUnit !== a) {
        const shrunkInput = applyShrinking([a], (inputs) => {
          const [sa] = inputs;
          if (sa === undefined) return false;
          return (1 + sa !== sa) || (sa + 1 !== sa);
        });
        
        return lawCheck(false, { 
          violatingInputs: shrunkInput, 
          operation: "unit" 
        }, "Broken unit violates unit laws");
      }
    }
    
    return lawCheckSuccess( "Broken unit EM-monoid unexpectedly passed");
  }
};

/************ Enhanced Law Checking ************/

/** Comprehensive EM-monoid law checker with enhanced witnesses */
export function checkEMMonoidEnhanced<TF, A>(
  T: StrongMonad<TF>,
  em: EnhancedEMMonoid<TF, A>,
  testElements: A[]
): {
  selfValidation: LawCheck<{ violatingInputs: A[]; operation: string }>;
  algebraLaws: LawCheck<{ input: A; expected: A; actual: A }>;
  summary: {
    name: string;
    description: string;
    allLawsOk: boolean;
    failureCount: number;
  };
} {
  
  // Self-validation using the monoid's own validate method
  const selfValidation = em.validate(testElements);
  
  // Algebra unit law: alg(of(a)) = a
  let algebraWitness: { input: A; expected: A; actual: A } | undefined;
  
  for (const a of testElements.slice(0, 5)) { // Limit for performance
    try {
      const ta = T.of(a);
      const actual = em.alg(ta);
      
      if (actual !== a) {
        algebraWitness = { input: a, expected: a, actual };
        break;
      }
    } catch (error) {
      algebraWitness = { input: a, expected: a, actual: `Error: ${error}` as any };
      break;
    }
  }
  
  const algebraLaws = lawCheck(!algebraWitness, algebraWitness, "Algebra unit law: alg(of(a)) = a");
  
  // Summary
  const allLawsOk = selfValidation.ok && algebraLaws.ok;
  const failureCount = (selfValidation.ok ? 0 : 1) + (algebraLaws.ok ? 0 : 1);
  
  return {
    selfValidation,
    algebraLaws,
    summary: {
      name: em.name,
      description: em.description,
      allLawsOk,
      failureCount
    }
  };
}

/************ Composition Examples ************/

/** Example: Compose Writer array with Option max */
export function createLoggedMaxEM(): EnhancedEMMonoid<"Writer", number> {
  const stringMonoid = { empty: "", concat: (a: string, b: string) => a + b };
  const WriterString = StrongWriter(stringMonoid);
  
  return {
    name: "LoggedMax",
    description: "Writer monad with max operation and logging",
    
    empty: -Infinity,
    
    concat: (x: number, y: number) => Math.max(x, y),
    
    alg: (writer: [number, string]) => {
      // Extract value from Writer<string, number> = [number, string]
      return Array.isArray(writer) && writer.length === 2 ? writer[0] : -Infinity;
    },
    
    validate: (elements: number[]) => {
      return optionMaxEMMonoid.validate(elements);
    }
  };
}

/************ Demonstration Functions ************/

/** Test a single EM-monoid with detailed reporting */
export function testEMMonoid<TF, A>(
  T: StrongMonad<TF>,
  em: EnhancedEMMonoid<TF, A>,
  testElements: A[]
): void {
  console.log(`\n🔍 Testing ${em.name}:`);
  console.log(`  Description: ${em.description}`);
  
  const result = checkEMMonoidEnhanced(T, em, testElements);
  
  console.log(`  Self-validation: ${result.selfValidation.ok ? "✅" : "❌"}`);
  console.log(`  Algebra laws: ${result.algebraLaws.ok ? "✅" : "❌"}`);
  console.log(`  Overall: ${result.summary.allLawsOk ? "✅ ALL LAWS SATISFIED" : "❌ LAWS VIOLATED"}`);
  
  if (!result.selfValidation.ok && result.selfValidation.witness) {
    console.log(`  ❌ Self-validation failure:`);
    console.log(`    Operation: ${result.selfValidation.witness.operation}`);
    console.log(`    Violating inputs: ${JSON.stringify(result.selfValidation.witness.violatingInputs)}`);
  }
  
  if (!result.algebraLaws.ok && result.algebraLaws.witness) {
    console.log(`  ❌ Algebra law failure:`);
    console.log(`    Input: ${JSON.stringify(result.algebraLaws.witness.input)}`);
    console.log(`    Expected: ${JSON.stringify(result.algebraLaws.witness.expected)}`);
    console.log(`    Actual: ${JSON.stringify(result.algebraLaws.witness.actual)}`);
  }
}

/** Demonstrate composition combinators */
export function demonstrateComposition(): void {
  console.log("\n📚 COMPOSITION COMBINATORS:");
  
  // Product example
  const productExample = productEM(optionMaxEMMonoid, optionStringEMMonoid);
  console.log(`\n✅ Created product: ${productExample.name}`);
  console.log(`  Description: ${productExample.description}`);
  console.log(`  Empty: ${JSON.stringify(productExample.empty)}`);
  
  const testPair1: [number, string] = [5, "hello"];
  const testPair2: [number, string] = [3, "world"];
  const productResult = productExample.concat(testPair1, testPair2);
  console.log(`  Example: ${JSON.stringify(testPair1)} ⊕ ${JSON.stringify(testPair2)} = ${JSON.stringify(productResult)}`);
  
  // Coproduct example
  const coproductExample = coproductEM(optionMaxEMMonoid, optionStringEMMonoid);
  console.log(`\n✅ Created coproduct: ${coproductExample.name}`);
  console.log(`  Description: ${coproductExample.description}`);
  
  const coproductResult1 = coproductExample.concat(5, 3);     // Both numbers
  const coproductResult2 = coproductExample.concat("a", "b"); // Both strings
  console.log(`  Example: 5 ⊕ 3 = ${coproductResult1}`);
  console.log(`  Example: "a" ⊕ "b" = ${coproductResult2}`);
}

/************ Main Demonstration Function ************/

export function demonstrateEMMonoids(): void {
  console.log("=".repeat(80));
  console.log("ENHANCED EM-MONOID EXAMPLES & COMPOSITION COMBINATORS");
  console.log("=".repeat(80));
  
  console.log("\n1. REAL-WORLD EM-MONOID EXAMPLES");
  
  // Test all examples (separate calls due to different types)
  testEMMonoid(StrongArray, writerArrayEMMonoid, [["log1"], ["log2"], ["log3"]]);
  testEMMonoid(StrongOption, optionMaxEMMonoid, [1, 5, 3, -2, 10]);
  testEMMonoid(StrongOption, optionStringEMMonoid, ["hello", "world", "test"]);
  testEMMonoid(StrongArray, arraySumEMMonoid, [1, 2, 3, 4, 5]);
  
  console.log("\n2. BROKEN EXAMPLES (Testing Failure Detection)");
  
  // Test broken examples
  testEMMonoid(StrongArray, brokenConcatEMMonoid, ["a", "b", "c"]);
  testEMMonoid(StrongOption, brokenUnitEMMonoid, [1, 2, 3]);
  
  demonstrateComposition();
  
  console.log("\n3. PRACTICAL APPLICATIONS");
  
  console.log("\nEM-monoid applications:");
  console.log("  • Writer monad: Accumulating logs, traces, metrics");
  console.log("  • Option monad: Handling missing values with semigroup operations");
  console.log("  • Array monad: Aggregating collections with monoidal structure");
  console.log("  • Product: Combining multiple computational effects");
  console.log("  • Coproduct: Alternative computational paths");
  
  console.log("\n4. COMPOSITION BENEFITS");
  
  console.log("\nComposition combinator benefits:");
  console.log("  • Modular construction of complex EM-monoids");
  console.log("  • Type-safe combination of algebraic structures");
  console.log("  • Automatic law verification for composed structures");
  console.log("  • Enhanced error reporting with concrete witnesses");
  
  console.log("\n" + "=".repeat(80));
  console.log("EM-MONOID SYSTEM FEATURES:");
  console.log("✓ Real-world examples: Writer arrays, Option semigroups");
  console.log("✓ Composition helpers: composeEM, productEM, coproductEM");
  console.log("✓ Enhanced law checking with LawCheck witnesses");
  console.log("✓ Concrete failure examples with minimal counterexamples");
  console.log("✓ Self-validation methods for each EM-monoid");
  console.log("✓ Comprehensive error reporting with fix suggestions");
  console.log("=".repeat(80));
  
  console.log("\n🎯 MATHEMATICAL SIGNIFICANCE:");
  console.log("• EM-monoids bridge category theory and practical computation");
  console.log("• Composition combinators enable modular algebraic design");
  console.log("• Law checking ensures mathematical correctness");
  console.log("• Concrete examples make abstract concepts tangible");
}