// quickstart-examples.ts
// All the golden path examples from the README in a single runnable file
// Perfect for new users to copy-paste and experiment with

import { Finite, Rel } from "../types/rel-equipment.js";
import { BitRel } from "../types/bitrel.js";
import { inclusionWitness } from "../types/witnesses.js";
import { checkLens } from "../types/optics-witness.js";

console.log("🚀 GOLDEN PATH QUICKSTART EXAMPLES");
console.log("=".repeat(50));

export function runQuickstartExamples(): void {
  
  // Example 1: Building Finite Sets and Relations
  console.log("\n1️⃣ FINITE SETS AND RELATIONS");
  
  const Users = new Finite([1, 2, 3, 4]);
  const Roles = new Finite(['admin', 'user', 'guest']);
  
  const userRoles = Rel.fromPairs(Users, Roles, [
    [1, 'admin'],
    [2, 'user'], 
    [3, 'user'],
    [4, 'guest']
  ]);
  
  console.log("✅ User-Role relation created");
  console.log("  Has (1, 'admin'):", userRoles.has(1, 'admin'));
  console.log("  Has (2, 'admin'):", userRoles.has(2, 'admin'));
  console.log("  All pairs:", userRoles.toPairs());
  
  const Permissions = new Finite(['read', 'write', 'delete']);
  const rolePerms = Rel.fromPairs(Roles, Permissions, [
    ['admin', 'read'], ['admin', 'write'], ['admin', 'delete'],
    ['user', 'read'], ['user', 'write'],
    ['guest', 'read']
  ]);
  
  const userPerms = userRoles.compose(rolePerms);
  console.log("  User permissions:", userPerms.toPairs());
  
  // Example 2: Spec→Impl Square with Failing Witness
  console.log("\n2️⃣ SPEC→IMPL SQUARE WITH WITNESS");
  
  const SpecA = new Finite(['spec1', 'spec2']);
  const ImplA = new Finite(['impl1', 'impl2']);
  const SpecB = new Finite(['specX', 'specY']);
  const ImplB = new Finite(['implX', 'implY']);
  
  const specMorphism = Rel.fromPairs(SpecA, SpecB, [
    ['spec1', 'specX'],
    ['spec2', 'specY']
  ]);
  
  const implMorphism = Rel.fromPairs(ImplA, ImplB, [
    ['impl1', 'implX'],
    ['impl2', 'implY']
  ]);
  
  // Intentionally incomplete refinement to show witness
  const refineA = Rel.fromPairs(SpecA, ImplA, [
    ['spec1', 'impl1']
    // Missing: ['spec2', 'impl2']
  ]);
  
  const refineB = Rel.fromPairs(SpecB, ImplB, [
    ['specX', 'implX'],
    ['specY', 'implY']
  ]);
  
  const leftPath = refineA.compose(implMorphism);
  const rightPath = specMorphism.compose(refineB);
  
  const witness = inclusionWitness(
    { has: (a, b) => rightPath.has(a, b), A: SpecA, B: ImplB },
    { has: (a, b) => leftPath.has(a, b), A: SpecA, B: ImplB }
  );
  
  console.log("✅ Square preservation check:");
  console.log("  Square commutes:", witness.holds);
  if (!witness.holds) {
    console.log("  ❌ Missing pairs (concrete witnesses):");
    witness.missing.forEach(([spec, impl]) => {
      console.log(`    Missing: (${spec}, ${impl})`);
    });
  }
  
  // Example 3: Lens Law Failure
  console.log("\n3️⃣ LENS LAW FAILURE WITH COUNTEREXAMPLE");
  
  type Person = { name: string; age: number };
  const People: Finite<Person> = { 
    elems: [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 }
    ]
  };
  const Ages: Finite<number> = { elems: [25, 30, 35] };
  
  // Broken lens that violates laws
  const brokenAgeLens = {
    get: (p: Person) => p.age,
    set: (p: Person, age: number) => ({ 
      ...p, 
      age: age + 1  // BUG: adds 1
    })
  };
  
  const lensResult = checkLens(People, Ages, brokenAgeLens);
  
  console.log("✅ Lens law verification:");
  console.log("  Get-Set law:", lensResult.getSet.ok ? "✅" : "❌");
  console.log("  Set-Get law:", lensResult.setGet.ok ? "✅" : "❌");
  
  if (!lensResult.setGet.ok && lensResult.setGet.counterexamples.length > 0) {
    const violation = lensResult.setGet.counterexamples[0];
    console.log("  ❌ Concrete counterexample:");
    console.log(`    Person: ${JSON.stringify(violation.s)}`);
    console.log(`    Set age: ${violation.a}`);
    console.log(`    Got back: ${violation.got} (expected: ${violation.a})`);
  }
  
  // Example 4: Rel vs BitRel Parity
  console.log("\n4️⃣ REL vs BITREL PARITY CHECK");
  
  const A = new Finite([1, 2, 3]);
  const B = new Finite(['x', 'y', 'z']);
  const C = new Finite(['α', 'β']);
  
  const pairs1 = [[1, 'x'], [2, 'y'], [3, 'z']] as const;
  const pairs2 = [['x', 'α'], ['y', 'β'], ['z', 'α']] as const;
  
  const relR = Rel.fromPairs(A, B, pairs1);
  const relS = Rel.fromPairs(B, C, pairs2);
  const relComposed = relR.compose(relS);
  
  const bitR = BitRel.fromPairs(A, B, pairs1);
  const bitS = BitRel.fromPairs(B, C, pairs2);
  const bitComposed = bitR.compose(bitS);
  
  const relPairs = new Set(relComposed.toPairs().map(p => JSON.stringify(p)));
  const bitPairs = new Set(bitComposed.toPairs().map(p => JSON.stringify(p)));
  
  const paritySame = relPairs.size === bitPairs.size && 
    Array.from(relPairs).every(p => bitPairs.has(p));
  
  console.log("✅ Parity verification:");
  console.log("  Rel result:", relComposed.toPairs());
  console.log("  BitRel result:", bitComposed.toPairs());
  console.log("  Implementations match:", paritySame ? "✅" : "❌");
  
  // Show successful case for contrast
  console.log("\n5️⃣ SUCCESSFUL CASE (for contrast)");
  
  const correctLens = {
    get: (p: Person) => p.age,
    set: (p: Person, age: number) => ({ ...p, age }) // Correct
  };
  
  const correctResult = checkLens(People, Ages, correctLens);
  console.log("✅ Correct lens verification:");
  console.log("  Get-Set law:", correctResult.getSet.ok ? "✅" : "❌");
  console.log("  Set-Get law:", correctResult.setGet.ok ? "✅" : "❌");
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 GOLDEN PATH COMPLETE!");
  console.log("All examples demonstrate:");
  console.log("  ✅ Successful operations");
  console.log("  ❌ Failing operations with concrete witnesses");
  console.log("  🔍 Parity verification between implementations");
  console.log("=".repeat(50));
}

// Export for use in other demos
export { runQuickstartExamples };

// Run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('quickstart-examples')) {
  runQuickstartExamples();
}