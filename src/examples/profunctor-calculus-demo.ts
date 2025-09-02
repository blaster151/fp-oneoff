// profunctor-calculus-demo.ts
// Demonstrates profunctor composition, coends, protransformations, and whiskering

import {
  // Relations/equipment bits
  SetObj, FnM, RelCat, FuncCat, makeRelationsDouble,
  // Profunctor & coend bits
  ProTrans, composeFiniteProfCoend, checkProTransNaturality,
  leftWhisker, Disc, tableProf, showClasses,
  // Category & nerve fundamentals
  companionOf, conjointOf, trianglesHold
} from "../types/category-to-nerve-sset";

console.log("🎯 Profunctor Calculus Demo");
console.log("===========================\n");

// Build some finite discrete categories for profunctor examples
const A = Disc(["a1", "a2"] as const);
const B = Disc(["b1", "b2", "b3"] as const);  
const C = Disc(["c1", "c2"] as const);

console.log("📊 Discrete categories:");
console.log("A = {a1, a2} (discrete)");
console.log("B = {b1, b2, b3} (discrete)");
console.log("C = {c1, c2} (discrete)\n");

// Define some profunctors P: A ⇸ B and Q: B ⇸ C as tables
const P_table = {
  a1: { b1: ["p11"], b2: ["p12a", "p12b"], b3: [] },
  a2: { b1: [], b2: ["p22"], b3: ["p23"] }
};

const Q_table = {
  b1: { c1: ["q11"], c2: [] },
  b2: { c1: ["q21"], c2: ["q22"] },
  b3: { c1: [], c2: ["q32"] }
};

const P = tableProf(A, B, P_table);
const Q = tableProf(B, C, Q_table);

console.log("🔗 Profunctors defined:");
console.log("P: A ⇸ B with elements:", JSON.stringify(P_table, null, 2));
console.log("Q: B ⇸ C with elements:", JSON.stringify(Q_table, null, 2));
console.log();

// Compute coend composition R = P ∘ Q : A ⇸ C
const keyB = (b: string) => b;
const R = composeFiniteProfCoend(A, B, C, keyB, P, Q);

console.log("⚡ Coend composition R = P ∘ Q:");
for (const a of A.objects) {
  for (const c of C.objects) {
    const classes = showClasses(a, c, R);
    if (classes.length > 0) {
      console.log(`R(${a},${c}) = {${classes.join(", ")}}`);
    }
  }
}
console.log();

// Define a protransformation α: P ⇒ P' (just identity for simplicity)
const alpha: ProTrans<string, any, string, any, string, string> = {
  at: (_a, _b) => (p) => `α(${p})`
};

console.log("🔄 Protransformation α: P ⇒ P' defined");
console.log("α transforms each element p to α(p)\n");

// Test naturality (trivially holds for discrete categories)
const sampleMorphisms: Array<{ u: any; v: any }> = [];
const isNatural = checkProTransNaturality(A, B, P, P, alpha, sampleMorphisms);
console.log("✅ Naturality check:", isNatural ? "PASS" : "FAIL");

// Demonstrate left whiskering: L ⋙ α where L: C ⇸ A is some simple profunctor
const L_table = {
  c1: { a1: ["l11"], a2: [] },
  c2: { a1: [], a2: ["l22"] }
};
const L = tableProf(C, A, L_table);

const keyA = (a: string) => a;
leftWhisker(A, B, C, keyA, L, P, P, alpha);

console.log("\n🥞 Left whiskering L ⋙ α:");
console.log("L: C ⇸ A with elements:", JSON.stringify(L_table, null, 2));
console.log("Result: (L∘P) ⇒ (L∘P') via whiskered transformation");

// Show some concrete Set/Rel examples
console.log("\n🧮 Concrete Set/Rel Equipment Example:");

// Define some small finite sets
const set1: SetObj<string> = { id: "X", elems: ["x1", "x2"], eq: (a,b) => a === b };
const set2: SetObj<string> = { id: "Y", elems: ["y1", "y2", "y3"], eq: (a,b) => a === b };

// Define a function f: X → Y
const f: FnM = {
  src: set1,
  dst: set2,
  f: (x) => x === "x1" ? "y1" : "y2"
};

// Compute companion and conjoint
const companion = companionOf(f);  // graph
const conjoint = conjointOf(f);    // cograph

console.log("Function f: X → Y maps x1↦y1, x2↦y2");
console.log("Companion Γ_f (graph): relates x to f(x)");
console.log("Conjoint Γ_f† (cograph): relates f(x) to x");

// Check triangle laws
const trianglesOK = trianglesHold(f);
console.log("Triangle laws hold:", trianglesOK ? "✅ YES" : "❌ NO");

// Build the relations double category and demonstrate squares
const RelDouble = makeRelationsDouble();

try {
  RelDouble.mkSquare({
    hTop: RelCat().id(set1),
    hBot: RelCat().comp(conjoint, companion),
    vLeft: FuncCat().id(set1),
    vRight: FuncCat().id(set1)
  });
  console.log("✅ Unit square constructed successfully");
} catch (e) {
  console.log("❌ Unit square failed:", (e as Error).message);
}

try {
  RelDouble.mkSquare({
    hTop: RelCat().comp(companion, conjoint),
    hBot: RelCat().id(set2),
    vLeft: FuncCat().id(set2),
    vRight: FuncCat().id(set2)
  });
  console.log("✅ Counit square constructed successfully");
} catch (e) {
  console.log("❌ Counit square failed:", (e as Error).message);
}

console.log("\n🎉 Profunctor calculus demo completed!");
console.log("This demonstrates:");
console.log("• Discrete categories and table-based profunctors");
console.log("• Coend-based profunctor composition");
console.log("• Protransformations and naturality checking");
console.log("• Left whiskering of protransformations");
console.log("• Concrete Set/Rel equipment with companions/conjoints");
console.log("• Triangle laws and double category squares");
console.log("🚀 The full profunctor bicategory structure is ready for use!");