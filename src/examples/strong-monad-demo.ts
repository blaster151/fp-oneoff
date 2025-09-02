// strong-monad-demo.ts
// Comprehensive demonstration of strong monads, EM algebras, and EM monoids

import { 
  StrongOption, StrongArray, StrongReader, StrongState, StrongWriter,
  enumOption, enumArray, checkEMMonoid, checkStrongMonadLaws,
  optionSumEMMonoid, arrayStringEMMonoid, optionMaxEMMonoid,
  demonstrateStrongMonads, EMMonoid, Finite
} from "../types/strong-monad.js";

console.log("=".repeat(80));
console.log("COMPREHENSIVE STRONG MONAD & EILENBERG-MOORE DEMONSTRATION");
console.log("=".repeat(80));

export function demo() {
  console.log("\n1. BASIC STRONG MONAD OPERATIONS");
  
  // Option strength examples
  console.log("\nOption strength demonstrations:");
  const someValue = StrongOption.of(42);
  const noneValue = StrongOption.of(null).tag === "none" ? { tag: "none" as const } : StrongOption.of(null);
  
  console.log("  of(42):", someValue);
  console.log("  strength(10, Some(20)):", StrongOption.strength(10, StrongOption.of(20)));
  console.log("  strength(10, None):", StrongOption.strength(10, { tag: "none" }));
  console.log("  prod(Some(1), Some(2)):", StrongOption.prod(StrongOption.of(1), StrongOption.of(2)));
  
  // Array strength examples  
  console.log("\nArray strength demonstrations:");
  console.log("  strength('x', [1,2]):", StrongArray.strength('x', [1, 2]));
  console.log("  prod([1,2], ['a','b']):", StrongArray.prod([1, 2], ['a', 'b']));
  
  console.log("\n2. READER MONAD STRENGTH");
  
  const StringReader = StrongReader<string>();
  const envLength = (s: string) => s.length;
  const envUpper = (s: string) => s.toUpperCase();
  
  console.log("Reader monad with string environment:");
  const readerExample = StringReader.prod(envLength, envUpper);
  console.log("  prod(length, upper)('hello'):", readerExample('hello'));
  console.log("  strength(42, upper)('world'):", StringReader.strength(42, envUpper)('world'));
  
  console.log("\n3. STATE MONAD STRENGTH");
  
  const IntState = StrongState<number>();
  const increment = (n: number): [number, number] => [n, n + 1];
  const double = (n: number): [number, number] => [n * 2, n];
  
  console.log("State monad with integer state:");
  const stateExample = IntState.prod(increment, double);
  console.log("  prod(increment, double)(5):", stateExample(5));
  console.log("  strength('tag', increment)(10):", IntState.strength('tag', increment)(10));
  
  console.log("\n4. WRITER MONAD STRENGTH");
  
  const stringMonoid = { empty: "", concat: (a: string, b: string) => a + b };
  const StringWriter = StrongWriter(stringMonoid);
  
  const logged1: [number, string] = [42, "computed 42"];
  const logged2: [string, string] = ["hello", "said hello"];
  
  console.log("Writer monad with string log:");
  console.log("  prod(logged1, logged2):", StringWriter.prod(logged1, logged2));
  console.log("  strength('prefix', logged1):", StringWriter.strength('prefix', logged1));
  
  console.log("\n5. EILENBERG-MOORE MONOID LAW VERIFICATION");
  
  // Test multiple EM monoids
  const testCarriers = {
    numbers: { elems: [0, 1, 2] } as Finite<number>,
    strings: { elems: ["x", "y"] } as Finite<string>
  };
  
  console.log("\nOption + Sum monoid verification:");
  const optionSumResult = checkEMMonoid(StrongOption, testCarriers.numbers, optionSumEMMonoid, enumOption);
  console.log("  Monoid laws:", optionSumResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", optionSumResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", optionSumResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", optionSumResult.unitMorphism.ok ? "✅" : "❌");
  
  if (!optionSumResult.monoidLaws.ok) {
    console.log("    Monoid violation:", JSON.stringify(optionSumResult.monoidLaws.witness));
  }
  
  console.log("\nArray + String concatenation monoid verification:");
  const arrayStringResult = checkEMMonoid(StrongArray, testCarriers.strings, arrayStringEMMonoid, 
    (F) => enumArray(F, 2));
  console.log("  Monoid laws:", arrayStringResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", arrayStringResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", arrayStringResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", arrayStringResult.unitMorphism.ok ? "✅" : "❌");
  
  console.log("\nOption + Max monoid verification:");
  const numberCarrier = { elems: [-1, 0, 1] } as Finite<number>;
  const optionMaxResult = checkEMMonoid(StrongOption, numberCarrier, optionMaxEMMonoid, enumOption);
  console.log("  Monoid laws:", optionMaxResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", optionMaxResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", optionMaxResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", optionMaxResult.unitMorphism.ok ? "✅" : "❌");

  console.log("\n6. STRONG MONAD LAW VERIFICATION");
  
  const lawResults = checkStrongMonadLaws(
    StrongOption, 
    testCarriers.numbers, 
    testCarriers.strings, 
    { elems: [true, false] },
    enumOption
  );
  
  console.log("Strong Option monad laws:");
  console.log("  Left unit:", lawResults.monadLaws.leftUnit.ok ? "✅" : "❌");
  console.log("  Right unit:", lawResults.monadLaws.rightUnit.ok ? "✅" : "❌");
  console.log("  Associativity:", lawResults.monadLaws.associativity.ok ? "✅" : "❌");
  console.log("  Strength unit:", lawResults.strengthLaws.unit.ok ? "✅" : "❌");
  
  if (!lawResults.monadLaws.leftUnit.ok) {
    console.log("    Left unit violation:", JSON.stringify(lawResults.monadLaws.leftUnit.witness));
  }
  if (!lawResults.monadLaws.rightUnit.ok) {
    console.log("    Right unit violation:", JSON.stringify(lawResults.monadLaws.rightUnit.witness));
  }
  if (!lawResults.strengthLaws.unit.ok) {
    console.log("    Strength unit violation:", JSON.stringify(lawResults.strengthLaws.unit.witness));
  }

  console.log("\n7. PRACTICAL APPLICATIONS");
  
  console.log("Strong monad applications in fp-oneoff:");
  console.log("  • Effect composition with strength for environment passing");
  console.log("  • Parallel computation via tensor products");
  console.log("  • EM monoids for structured data aggregation");
  console.log("  • Reader for dependency injection with strength");
  console.log("  • State for stateful computations with product operations");
  console.log("  • Writer for logging with monoidal accumulation");
  
  console.log("\n8. CATEGORICAL SIGNIFICANCE");
  
  console.log("Mathematical foundations:");
  console.log("  • Strong monads model computational effects with environment access");
  console.log("  • Strength τ: A × T B → T(A × B) enables sequential composition");
  console.log("  • EM algebras provide canonical interpretations T A → A");
  console.log("  • EM monoids are monoid objects in the EM category");
  console.log("  • All constructions preserve categorical structure");
  
  console.log("\n9. ADVANCED CONSTRUCTIONS");
  
  // Custom EM monoid for demonstration
  const customEMMonoid: EMMonoid<"Array", number> = {
    empty: 0,
    concat: (x: number, y: number) => x + y,
    alg: (xs: number[]) => xs.reduce((sum, x) => sum + x, 0)
  };
  
  const customResult = checkEMMonoid(StrongArray, testCarriers.numbers, customEMMonoid, 
    (F) => enumArray(F, 2));
  
  console.log("Custom Array + Sum EM monoid:");
  console.log("  Monoid laws:", customResult.monoidLaws.ok ? "✅" : "❌");
  console.log("  Algebra unit:", customResult.algebraUnit.ok ? "✅" : "❌");
  console.log("  Multiplicativity:", customResult.multiplicativity.ok ? "✅" : "❌");
  console.log("  Unit morphism:", customResult.unitMorphism.ok ? "✅" : "❌");
  
  // Demonstrate composition
  console.log("\nStrength composition examples:");
  const composed1 = StrongArray.chain([1, 2], (x: number) => [x, x * 2]);
  console.log("  chain([1,2], x => [x, x*2]):", composed1);
  
  const composed2 = StrongOption.ap(StrongOption.of((x: number) => x * 3), StrongOption.of(7));
  console.log("  ap(Some(x => x*3), Some(7)):", composed2);

  console.log("\n" + "=".repeat(80));
  console.log("STRONG MONAD SYSTEM FEATURES:");
  console.log("✓ Complete strong monad interface with strength and tensor");
  console.log("✓ Multiple instances: Option, Array, Reader, State, Writer");
  console.log("✓ Eilenberg-Moore algebras with structure maps");
  console.log("✓ EM monoids as monoid objects in EM categories");
  console.log("✓ Comprehensive law verification with finite model testing");
  console.log("✓ Practical applications in effect composition and aggregation");
  console.log("✓ Categorical foundations with mathematical rigor");
  console.log("=".repeat(80));
}

// Run the built-in demonstration as well
demonstrateStrongMonads();
demo();