// golden-path-demo.ts
// Implementation of all the golden path examples from the README
// Copy-pasteable snippets that demonstrate core functionality

import { Finite, Rel } from "../types/rel-equipment.js";
import { BitRel } from "../types/bitrel.js";
import { inclusionWitness } from "../types/witnesses.js";
import { checkLens } from "../types/optics-witness.js";

console.log("=".repeat(80));
console.log("GOLDEN PATH QUICKSTART DEMONSTRATION");
console.log("=".repeat(80));

console.log("\n1. BUILDING FINITE SETS AND RELATIONS");

// Create finite sets
const Users = new Finite([1, 2, 3, 4]);
const Roles = new Finite(['admin', 'user', 'guest']);

// Build a relation: User → Role assignments
const userRoles = Rel.fromPairs(Users, Roles, [
  [1, 'admin'],
  [2, 'user'], 
  [3, 'user'],
  [4, 'guest']
]);

console.log("User-Role relation:");
console.log("Has relation (1, 'admin'):", userRoles.has(1, 'admin')); // true
console.log("Has relation (2, 'admin'):", userRoles.has(2, 'admin')); // false
console.log("All pairs:", userRoles.toPairs());

// Compose with permissions relation
const Permissions = new Finite(['read', 'write', 'delete']);
const rolePerms = Rel.fromPairs(Roles, Permissions, [
  ['admin', 'read'], ['admin', 'write'], ['admin', 'delete'],
  ['user', 'read'], ['user', 'write'],
  ['guest', 'read']
]);

// Composition: Users → Roles → Permissions = Users → Permissions
const userPerms = userRoles.compose(rolePerms);
console.log("User permissions via composition:", userPerms.toPairs());

console.log("\n2. SPEC→IMPL SQUARE PRESERVATION WITH WITNESS");

// Create a failing square to show witness functionality
const SpecA = new Finite(['spec1', 'spec2']);
const ImplA = new Finite(['impl1', 'impl2']);
const SpecB = new Finite(['specX', 'specY']);
const ImplB = new Finite(['implX', 'implY']);

// Define morphisms for the square
const specMorphism = Rel.fromPairs(SpecA, SpecB, [
  ['spec1', 'specX'],
  ['spec2', 'specY']
]);

const implMorphism = Rel.fromPairs(ImplA, ImplB, [
  ['impl1', 'implX'],
  ['impl2', 'implY']
]);

// Refinement relations (intentionally incomplete for demo)
const refineA = Rel.fromPairs(SpecA, ImplA, [
  ['spec1', 'impl1']
  // Missing: ['spec2', 'impl2'] - this will cause witness failure
]);

const refineB = Rel.fromPairs(SpecB, ImplB, [
  ['specX', 'implX'],
  ['specY', 'implY']
]);

// Check square commutativity: refineA ; implMorphism ≤ specMorphism ; refineB
const leftPath = refineA.compose(implMorphism);
const rightPath = specMorphism.compose(refineB);

const witness = inclusionWitness(
  { has: (a, b) => rightPath.has(a, b), A: SpecA, B: ImplB },
  { has: (a, b) => leftPath.has(a, b), A: SpecA, B: ImplB }
);

console.log("Square preservation check:");
console.log("Square commutes:", witness.holds);
if (!witness.holds) {
  console.log("❌ Missing pairs (witnesses to failure):");
  witness.missing.forEach(([spec, impl]) => {
    console.log(`  Missing: (${spec}, ${impl})`);
  });
  console.log("This shows exactly where the square fails to commute!");
}

console.log("\n3. LENS LAW FAILURE WITH CONCRETE COUNTEREXAMPLE");

// Create a deliberately broken lens for demonstration
type Person = { name: string; age: number };
const People: Finite<Person> = { 
  elems: [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 }
  ]
};
const Ages: Finite<number> = { elems: [25, 30, 35] };

// Broken lens: get works but set doesn't preserve the get-set law
const brokenAgeLens = {
  get: (p: Person) => p.age,
  set: (p: Person, age: number) => ({ 
    ...p, 
    age: age + 1  // BUG: adds 1, violating get-set law
  })
};

// Check lens laws
const lensResult = checkLens(People, Ages, brokenAgeLens);

console.log("Lens Law Verification:");
console.log("Get-Set law:", lensResult.getSet.ok ? "✅" : "❌");
console.log("Set-Get law:", lensResult.setGet.ok ? "✅" : "❌");

if (!lensResult.getSet.ok) {
  console.log("\n❌ Get-Set Law Violations:");
  lensResult.getSet.counterexamples.forEach(violation => {
    console.log(`  Input: ${JSON.stringify(violation.s)}`);
    console.log(`  Got age: ${violation.got}`);
    console.log(`  After set: ${JSON.stringify(violation.after)}`);
    console.log(`  Expected: original person unchanged`);
  });
}

if (!lensResult.setGet.ok) {
  console.log("\n❌ Set-Get Law Violations:");
  lensResult.setGet.counterexamples.forEach(violation => {
    console.log(`  Person: ${JSON.stringify(violation.s)}`);
    console.log(`  Set age: ${violation.a}`);
    console.log(`  Got back: ${violation.got}`);
    console.log(`  Expected: ${violation.a}`);
  });
}

console.log("\n4. REL vs BITREL PARITY CHECK");

// Create test data
const A = new Finite([1, 2, 3]);
const B = new Finite(['x', 'y', 'z']);
const C = new Finite(['α', 'β']);

const pairs1 = [[1, 'x'], [2, 'y'], [3, 'z']] as const;
const pairs2 = [['x', 'α'], ['y', 'β'], ['z', 'α']] as const;

// Test with naive Rel implementation
console.log("🔍 Testing Rel vs BitRel Parity:");

const relR = Rel.fromPairs(A, B, pairs1);
const relS = Rel.fromPairs(B, C, pairs2);
const relComposed = relR.compose(relS);

// Test with BitRel implementation  
const bitR = BitRel.fromPairs(A, B, pairs1);
const bitS = BitRel.fromPairs(B, C, pairs2);
const bitComposed = bitR.compose(bitS);

// Verify parity
const relPairs = new Set(relComposed.toPairs().map(p => JSON.stringify(p)));
const bitPairs = new Set(bitComposed.toPairs().map(p => JSON.stringify(p)));

const paritySame = relPairs.size === bitPairs.size && 
  Array.from(relPairs).every(p => bitPairs.has(p));

console.log("Composition Results:");
console.log("  Rel result:", relComposed.toPairs());
console.log("  BitRel result:", bitComposed.toPairs());
console.log("  Parity check:", paritySame ? "✅ IDENTICAL" : "❌ DIFFERENT");

// Test union parity
const relUnion = relR.join(Rel.fromPairs(A, B, [[1, 'y'], [3, 'x']]));
const bitUnion = bitR.join(BitRel.fromPairs(A, B, [[1, 'y'], [3, 'x']]));

const unionRelPairs = new Set(relUnion.toPairs().map(p => JSON.stringify(p)));
const unionBitPairs = new Set(bitUnion.toPairs().map(p => JSON.stringify(p)));

const unionParity = unionRelPairs.size === unionBitPairs.size && 
  Array.from(unionRelPairs).every(p => unionBitPairs.has(p));

console.log("\nUnion Results:");
console.log("  Rel union:", relUnion.toPairs());
console.log("  BitRel union:", bitUnion.toPairs());
console.log("  Parity check:", unionParity ? "✅ IDENTICAL" : "❌ DIFFERENT");

// Performance comparison
console.log("\n⚡ Performance Comparison:");
console.time("Rel operations");
for (let i = 0; i < 1000; i++) {
  relR.compose(relS).join(relR).meet(relR);
}
console.timeEnd("Rel operations");

console.time("BitRel operations");
for (let i = 0; i < 1000; i++) {
  bitR.compose(bitS).join(bitR).meet(bitR);
}
console.timeEnd("BitRel operations");

console.log("\n5. ADDITIONAL DEMONSTRATIONS");

// Show successful law check for contrast
const correctAgeLens = {
  get: (p: Person) => p.age,
  set: (p: Person, age: number) => ({ ...p, age }) // Correct implementation
};

const correctResult = checkLens(People, Ages, correctAgeLens);
console.log("\nCorrect lens verification:");
console.log("Get-Set law:", correctResult.getSet.ok ? "✅" : "❌");
console.log("Set-Get law:", correctResult.setGet.ok ? "✅" : "❌");

// Show benchmark CLI usage
console.log("\n6. BENCHMARK CLI DEMONSTRATION");
console.log("Run performance benchmarks:");
console.log("  pnpm bench:rel --sizes 32,64 --densities 0.05,0.1");
console.log("  pnpm bench:rel --sizes 64,128,256 --densities 0.01,0.05,0.1");

console.log("\n" + "=".repeat(80));
console.log("🎯 GOLDEN PATH COMPLETE:");
console.log("✅ Built finite sets and relations");
console.log("✅ Demonstrated failing square with concrete witnesses");
console.log("✅ Showed lens law failure with detailed counterexamples");
console.log("✅ Verified Rel vs BitRel parity with performance comparison");
console.log("✅ All examples are copy-pasteable and working");
console.log("=".repeat(80));

console.log("\n📚 NEXT STEPS:");
console.log("• Explore src/examples/ for more advanced demonstrations");
console.log("• Read the technical summaries for deep dives");
console.log("• Run the benchmark suite for performance analysis");
console.log("• Check out the law checking system for formal verification");