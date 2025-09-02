// optics-lawcheck-demo.ts
// Comprehensive demonstration of witnessful optics law checking

import { 
  checkLens, checkPrism, checkTraversal, checkCompositeOptics,
  Lens, Prism, Traversal, demonstrateOpticsWitnesses,
  adaptProfunctorLens, adaptProfunctorPrism
} from "../types/optics-witness.js";

console.log("=".repeat(80));
console.log("🔍 WITNESSFUL OPTICS LAW CHECKING DEMONSTRATION 🔍");
console.log("=".repeat(80));

export function opticsLawcheckDemo() {
  console.log("\n1. 🔍 LENS LAW WITNESSES");
  
  // Example: Lens on a pair [number,string] focusing first component
  type S = [number, string];
  type A = number;
  const FSS = { elems: [[0,"a"], [1,"b"], [2,"c"], [3,"d"]] as S[] };
  const FAA = { elems: [0, 1, 2, 3, 4] };
  
  const fstLens: Lens<S, A> = {
    get: (s) => s[0],
    set: (s, a) => [a, s[1]]
  };
  
  console.log("Testing first-component lens:");
  console.log(`  Structure: [number, string] → number`);
  console.log(`  Test domain: ${FSS.elems.map(s => `[${s[0]},${s[1]}]`).join(', ')}`);
  console.log(`  Test values: {${FAA.elems.join(', ')}}`);
  
  const lensResult = checkLens(FSS, FAA, fstLens);
  
  console.log("\nLens law verification:");
  console.log(`  Get-Set law (get(set(s,a)) = a): ${lensResult.getSet.ok ? '✅' : '❌'}`);
  console.log(`  Set-Get law (set(s,get(s)) = s): ${lensResult.setGet.ok ? '✅' : '❌'}`);
  console.log(`  Set-Set law (set(set(s,a),b) = set(s,b)): ${lensResult.setSet.ok ? '✅' : '❌'}`);
  
  if (!lensResult.getSet.ok) {
    console.log("  Get-Set counterexamples:", lensResult.getSet.counterexamples.slice(0, 2));
  }
  if (!lensResult.setGet.ok) {
    console.log("  Set-Get counterexamples:", lensResult.setGet.counterexamples.slice(0, 2));
  }
  if (!lensResult.setSet.ok) {
    console.log("  Set-Set counterexamples:", lensResult.setSet.counterexamples.slice(0, 2));
  }
  
  console.log("\n2. 🎯 PRISM LAW WITNESSES");
  
  // Prism for string digits: match digits, build from number to string
  type PS = string;
  type PA = number;
  const FPS = { elems: ["0", "7", "x", "9", "abc", "5"] };
  const FPA = { elems: [0, 5, 7, 9] };
  
  const digitPrism: Prism<PS, PA> = {
    match: (s) => /^[0-9]$/.test(s) ? { tag: "some", value: Number(s) } : { tag: "none" },
    build: (a) => String(a)
  };
  
  console.log("Testing digit prism:");
  console.log(`  Structure: string ⇄ number (digits only)`);
  console.log(`  Test strings: [${FPS.elems.join(', ')}]`);
  console.log(`  Test numbers: [${FPA.elems.join(', ')}]`);
  
  const prismResult = checkPrism(FPS, FPA, digitPrism);
  
  console.log("\nPrism law verification:");
  console.log(`  Build-Match law (match(build(a)) = Some(a)): ${prismResult.buildMatch.ok ? '✅' : '❌'}`);
  console.log(`  Partial inverse law: ${prismResult.partialInverse.ok ? '✅' : '❌'}`);
  
  if (!prismResult.buildMatch.ok) {
    console.log("  Build-Match counterexamples:", prismResult.buildMatch.counterexamples);
  }
  if (!prismResult.partialInverse.ok) {
    console.log("  Partial inverse counterexamples:", prismResult.partialInverse.counterexamples);
  }
  
  console.log("\n3. 🌟 TRAVERSAL LAW WITNESSES");
  
  // Traversal: both components of number pair
  type TS = [number, number];
  type TA = number;
  const FTS = { elems: [[0,0], [1,2], [3,4], [5,6]] as TS[] };
  const FTA = { elems: [0, 1, 2, 3] };
  
  const bothTraversal: Traversal<TS, TA> = {
    modify: (s, k) => [k(s[0]), k(s[1])]
  };
  
  console.log("Testing both-components traversal:");
  console.log(`  Structure: [number, number] with both foci`);
  console.log(`  Test pairs: ${FTS.elems.map(s => `[${s[0]},${s[1]}]`).join(', ')}`);
  console.log(`  Test modifiers: constants from {${FTA.elems.join(', ')}}`);
  
  const traversalResult = checkTraversal(FTS, FTA, bothTraversal);
  
  console.log("\nTraversal law verification:");
  console.log(`  Identity law (modify(s, id) = s): ${traversalResult.identity.ok ? '✅' : '❌'}`);
  console.log(`  Composition law (modify fusion): ${traversalResult.composition.ok ? '✅' : '❌'}`);
  
  if (!traversalResult.identity.ok) {
    console.log("  Identity counterexamples:", traversalResult.identity.counterexamples);
  }
  if (!traversalResult.composition.ok) {
    console.log("  Composition counterexamples:", traversalResult.composition.counterexamples.slice(0, 2));
  }
  
  console.log("\n4. 🔧 COMPOSITE OPTICS WITNESSES");
  
  // Test lens composition
  const sndLens: Lens<S, string> = {
    get: (s) => s[1],
    set: (s, str) => [s[0], str]
  };
  
  const lengthLens: Lens<string, number> = {
    get: (str) => str.length,
    set: (str, len) => str.slice(0, len).padEnd(len, 'x')
  };
  
  const FSS_str = { elems: [[0,"a"], [1,"bb"], [2,"ccc"]] as [number, string][] };
  const FStr = { elems: ["a", "bb", "ccc", "dddd"] };
  const FLen = { elems: [1, 2, 3, 4] };
  
  console.log("Testing composite lens (pair → string → length):");
  const compositeResult = checkCompositeOptics(FSS_str, FStr, FLen, sndLens, lengthLens);
  
  console.log(`  Composite lens laws: ${
    compositeResult.lensComposition.getSet.ok && 
    compositeResult.lensComposition.setGet.ok && 
    compositeResult.lensComposition.setSet.ok ? '✅' : '❌'
  }`);
  
  console.log("\n5. 🎯 PROFUNCTOR BRIDGE");
  
  // Demonstrate bridge to profunctor optics
  const profunctorLens = {
    _tag: "Lens" as const,
    get: fstLens.get,
    set: fstLens.set
  };
  
  const adaptedLens = adaptProfunctorLens(profunctorLens);
  const bridgeResult = checkLens(FSS, FAA, adaptedLens);
  
  console.log("Profunctor optics bridge:");
  console.log(`  Adapted lens laws: ${
    bridgeResult.getSet.ok && bridgeResult.setGet.ok && bridgeResult.setSet.ok ? '✅' : '❌'
  }`);
  console.log("  Bridge enables witness checking for existing profunctor optics");
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 MODULE 2 COMPLETE: OPTICS WITNESS SYSTEM:");
  console.log("✓ Lens laws with detailed counterexample reporting");
  console.log("✓ Prism laws with build/match violation witnesses");
  console.log("✓ Traversal laws with identity/composition witnesses");
  console.log("✓ Composite optics with composition law verification");
  console.log("✓ Profunctor bridge for existing optics integration");
  console.log("✓ All optics failures now provide concrete counterexamples");
  console.log("=".repeat(80));
}

// Run built-in demonstration
demonstrateOpticsWitnesses();

// Run our comprehensive demo
opticsLawcheckDemo();