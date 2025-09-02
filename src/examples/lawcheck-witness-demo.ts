// lawcheck-witness-demo.ts
// Showcase witnessful APIs: refinement, Hoare triples, and square witnesses.

import { Finite, Rel, Subset } from "../types/rel-equipment.js";
import { 
  refines, hoareWitness, squareWitness, wpTransportWitness, spTransportWitness,
  modularLawWitness, equipmentWitness, demonstrateAllegoryWitnesses
} from "../types/allegory-witness.js";

console.log("=".repeat(80));
console.log("🔍 WITNESSFUL ALLEGORY & HOARE LOGIC DEMONSTRATION 🔍");
console.log("=".repeat(80));

export function lawcheckWitnessDemo() {
  console.log("\n1. 🔗 REFINEMENT WITNESSES");
  
  const A = new Finite([0, 1, 2, 3]);
  const B = new Finite(["x", "y", "z", "w"]);
  
  // Create relations with clear refinement relationships
  const R_large = Rel.fromPairs(A, B, [[0, "x"], [0, "y"], [1, "z"], [2, "w"], [3, "x"]]);
  const R_small = Rel.fromPairs(A, B, [[0, "x"], [1, "z"], [3, "x"]]);
  const R_different = Rel.fromPairs(A, B, [[0, "y"], [1, "z"], [2, "w"]]);
  
  console.log("Test relations:");
  console.log(`  R_large: {${R_large.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  R_small: {${R_small.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  R_different: {${R_different.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  
  // Test refinements
  console.log("\nRefinement witness tests:");
  
  const refine1 = refines(R_small, R_large);
  console.log(`  R_small ⊆ R_large: ${refine1.holds ? '✅' : '❌'}`);
  if (!refine1.holds) {
    console.log(`    Missing pairs: ${JSON.stringify(refine1.missing)}`);
  }
  
  const refine2 = refines(R_large, R_small);
  console.log(`  R_large ⊆ R_small: ${refine2.holds ? '✅' : '❌'}`);
  if (!refine2.holds) {
    console.log(`    Extra pairs: ${JSON.stringify(refine2.missing.slice(0, 3))}${refine2.missing.length > 3 ? '...' : ''}`);
  }
  
  const refine3 = refines(R_small, R_different);
  console.log(`  R_small ⊆ R_different: ${refine3.holds ? '✅' : '❌'}`);
  if (!refine3.holds) {
    console.log(`    Violating pairs: ${JSON.stringify(refine3.missing)}`);
  }
  
  console.log("\n2. ⚖️ HOARE LOGIC WITNESSES");
  
  // Create predicates for Hoare logic
  const P_evens = Subset.by(A, a => a % 2 === 0);  // {0, 2}
  const Q_vowels = Subset.by(B, b => ['x', 'y'].includes(b)); // vowel-like
  
  console.log("Hoare logic test setup:");
  console.log(`  Precondition P (evens): {${P_evens.toArray().join(', ')}}`);
  console.log(`  Postcondition Q (x,y): {${Q_vowels.toArray().join(', ')}}`);
  console.log(`  Program R_large: {${R_large.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  
  // Test demonic Hoare logic: {P} R {Q}
  const demonicResult = hoareWitness("demonic", P_evens, R_large, Q_vowels);
  console.log(`\nDemonic Hoare triple {P} R_large {Q}: ${demonicResult.ok ? '✅' : '❌'}`);
  if (!demonicResult.ok) {
    console.log(`  Counterexample transitions: ${JSON.stringify(demonicResult.counterexamples)}`);
    console.log(`  Explanation: Some element in P has a transition to non-Q element`);
  }
  
  // Test angelic Hoare logic: <P> R <Q>
  const angelicResult = hoareWitness("angelic", P_evens, R_large, Q_vowels);
  console.log(`Angelic Hoare triple <P> R_large <Q>: ${angelicResult.ok ? '✅' : '❌'}`);
  if (!angelicResult.ok) {
    console.log(`  Elements without good transitions: ${JSON.stringify(angelicResult.counterexamples)}`);
    console.log(`  Explanation: Some element in P has no transition to any Q element`);
  }
  
  console.log("\n3. 📐 SQUARE WITNESSES");
  
  // Create a commutative square test
  const A1 = new Finite([0, 1, 2]);
  const B1 = new Finite(["X", "Y", "Z"]);
  
  const f = (a: number) => a;  // identity on numbers
  const g = (b: string) => {   // map strings to uppercase-like
    switch (b) {
      case "x": return "X";
      case "y": return "Y"; 
      case "z": return "Z";
      default: return "X";
    }
  };
  
  const R1 = Rel.fromPairs(A1, B1, [[0, "X"], [1, "Y"], [2, "Z"]]);
  
  console.log("Square commutativity test:");
  console.log(`  Top relation R_small: {${R_small.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  Bottom relation R1: {${R1.toPairs().map(([a,b]) => `${a}→${b}`).join(', ')}}`);
  console.log(`  Left morphism f: identity`);
  console.log(`  Right morphism g: lowercase → uppercase`);
  
  const squareResult = squareWitness(A, B, A1, B1, f, g, R_small, R1);
  console.log(`\nSquare commutes: ${squareResult.holds ? '✅' : '❌'}`);
  if (!squareResult.holds) {
    console.log(`  Missing pairs in left path: ${JSON.stringify(squareResult.missing)}`);
  }
  
  console.log("\n4. 🌟 WEAKEST PRECONDITION WITNESSES");
  
  // Create a simple program relation  
  const States = new Finite(['init', 'work', 'done', 'error']);
  const Program = Rel.fromPairs(States, States, [
    ['init', 'work'],
    ['work', 'done'],
    ['work', 'error'],
    ['done', 'done'],
    ['error', 'error']
  ]);
  
  const Post = Subset.by(States, s => s === 'done');
  const Pre = Subset.by(States, s => s === 'init' || s === 'work');
  
  console.log("WP transport test:");
  console.log(`  Program: {${Program.toPairs().map(([s1,s2]) => `${s1}→${s2}`).join(', ')}}`);
  console.log(`  Postcondition: {${Post.toArray().join(', ')}}`);
  console.log(`  Proposed precondition: {${Pre.toArray().join(', ')}}`);
  
  const wpResult = wpTransportWitness(Pre, Program, Post);
  console.log(`\nWP inclusion Pre ⊆ wp(Program, Post): ${wpResult.ok ? '✅' : '❌'}`);
  console.log(`  Computed WP: {${wpResult.wp.toArray().join(', ')}}`);
  if (!wpResult.ok) {
    console.log(`  Elements in Pre but not WP: {${wpResult.missing.join(', ')}}`);
  }
  
  console.log("\n5. 🔬 MODULAR LAW WITNESS");
  
  // Test modular law on a simple relation
  const Domain = new Finite([1, 2, 3]);
  const R_mod = Rel.fromPairs(Domain, Domain, [[1, 2], [2, 3]]);
  const S_mod = Rel.fromPairs(Domain, Domain, [[1, 1], [2, 2], [3, 3]]);  // identity-like
  const T_mod = Rel.fromPairs(Domain, Domain, [[1, 3], [2, 1]]);
  
  const modularResult = modularLawWitness(R_mod, S_mod, T_mod);
  console.log("Modular law test:");
  console.log(`  ${modularResult.description}`);
  console.log(`  Law holds: ${modularResult.holds ? '✅' : '❌'}`);
  if (!modularResult.holds) {
    console.log(`  Violating pairs: ${JSON.stringify(modularResult.witness.missing.slice(0, 3))}`);
  }
  
  console.log("\n6. 🏗️ EQUIPMENT LAW WITNESS");
  
  const equipmentDomain = new Finite([1, 2, 3]);
  const equipmentCodomain = new Finite(['a', 'b']);
  const equipmentFunction = (n: number) => n <= 2 ? 'a' : 'b';
  
  const equipmentResult = equipmentWitness(equipmentDomain, equipmentCodomain, equipmentFunction);
  console.log("Equipment law test (companion/conjoint):");
  console.log(`  Function: ${equipmentDomain.elems.map(n => `${n}→${equipmentFunction(n)}`).join(', ')}`);
  console.log(`  Unit law holds: ${equipmentResult.companionConjoint.unitLaw.holds ? '✅' : '❌'}`);
  console.log(`  Counit law holds: ${equipmentResult.companionConjoint.counitLaw.holds ? '✅' : '❌'}`);
  console.log(`  Overall equipment: ${equipmentResult.tabulation.holds ? '✅' : '❌'}`);
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 WITNESSFUL ALLEGORY SYSTEM FEATURES:");
  console.log("✓ Refinement witnesses with exact counterexample pairs");
  console.log("✓ Hoare logic with demonic/angelic violation reporting");
  console.log("✓ Square witnesses for commutative diagram failures");
  console.log("✓ WP/SP transport with precise precondition analysis");
  console.log("✓ Modular law witnesses for allegory verification");
  console.log("✓ Equipment law witnesses for double category structure");
  console.log("✓ All witnesses provide constructive counterexamples");
  console.log("=".repeat(80));
  
  console.log("\n🌟 Module 1 Complete: Relations/Allegory layer now fully witnessful! 🌟");
}

// Run the built-in demonstration
demonstrateAllegoryWitnesses();

// Run our comprehensive demo
lawcheckWitnessDemo();