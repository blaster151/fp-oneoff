// nerve-to-homology-demo.ts
// Demonstration of the full pipeline: Category → Nerve → Chain Complex → Homology
// This shows how the new homology computation integrates with existing nerve construction

import { makeFreeCategory, Nerve } from "../types/category-to-nerve-sset.js";
import { computeFreeQuiverHomology, computeNerveHomology } from "../types/catkit-homology-bridge.js";
import { Homology } from "../types/index.js";

type HomologyQuiver = Homology.HomologyQuiver;

console.log("=".repeat(80));
console.log("NERVE → HOMOLOGY INTEGRATION DEMO");
console.log("=".repeat(80));

// Example 1: 4-cycle quiver A→B→C→D→A
const Q1 = {
  objects: ["A", "B", "C", "D"],
  edges: [
    { src: "A", dst: "B", label: "f" },
    { src: "B", dst: "C", label: "g" },
    { src: "C", dst: "D", label: "h" },
    { src: "D", dst: "A", label: "k" }
  ]
};

console.log("\n1. QUIVER → FREE CATEGORY → NERVE → HOMOLOGY");
console.log("Quiver Q1: 4-cycle A→B→C→D→A");

// Build free category
const C1 = makeFreeCategory(Q1);
console.log("✓ Free category C1 = Free(Q1) constructed");

// Build nerve  
const N1 = Nerve(C1);
console.log("✓ Nerve N1 = Nerve(C1) constructed");

// Compute homology via bridge
const H1 = computeFreeQuiverHomology(Q1);
console.log("\nHomology Results:");
console.log("H0 (ℚ): β0 =", H1.rational.betti0, "components =", H1.rational.components.length);
console.log("H1 (ℚ): β1 =", H1.rational.betti1);
console.log("H0 (ℤ): rank =", H1.integer.H0.rank, "torsion =", H1.integer.H0.torsion);
console.log("H1 (ℤ): rank =", H1.integer.H1.rank, "torsion =", H1.integer.H1.torsion);

// Show H1 generators
if (H1.integer.presentation.freeGenerators.length > 0) {
  console.log("\nH1 Free Generators:");
  for (const gen of H1.integer.presentation.freeGenerators) {
    console.log(`  ${gen.name}: ${Homology.prettyChain(gen.coeffs)}`);
  }
}

console.log("\n" + "-".repeat(60));

// Example 2: Two disconnected components
const Q2 = {
  objects: ["X", "Y", "Z", "W"],
  edges: [
    { src: "X", dst: "Y", label: "a" },
    { src: "Z", dst: "W", label: "b" }
  ]
};

console.log("\n2. TWO COMPONENTS EXAMPLE");
console.log("Quiver Q2: X→Y and Z→W (disconnected)");

const H2 = computeFreeQuiverHomology(Q2);
console.log("\nHomology Results:");
console.log("H0 (ℚ): β0 =", H2.rational.betti0, "components =", H2.rational.components.length);
console.log("H1 (ℚ): β1 =", H2.rational.betti1);
console.log("Components:", H2.rational.components.map(c => `{${c.join(",")}}`).join(" | "));

console.log("\n" + "-".repeat(60));

// Example 3: Triangle with loop (more complex topology)
const Q3 = {
  objects: ["P", "Q", "R"],
  edges: [
    { src: "P", dst: "Q", label: "e1" },
    { src: "Q", dst: "R", label: "e2" },
    { src: "R", dst: "P", label: "e3" },
    { src: "P", dst: "P", label: "loop" } // self-loop
  ]
};

console.log("\n3. TRIANGLE WITH SELF-LOOP");
console.log("Quiver Q3: Triangle P→Q→R→P with self-loop at P");

const H3 = computeFreeQuiverHomology(Q3);
console.log("\nHomology Results:");
console.log("H0 (ℚ): β0 =", H3.rational.betti0);
console.log("H1 (ℚ): β1 =", H3.rational.betti1);
console.log("H1 (ℤ): rank =", H3.integer.H1.rank, "torsion =", H3.integer.H1.torsion);

// Show detailed chain complex dimensions
console.log("\nChain Complex Dimensions:");
console.log("C0 (objects):", H3.rational.debug.C0.length);
console.log("C1 (paths ≤2):", H3.rational.debug.C1.length);
console.log("C2 (2-simplices):", H3.rational.debug.C2.length);

console.log("\n" + "=".repeat(80));
console.log("Integration complete! The nerve construction now connects to homology computation.");
console.log("This demonstrates the bridge: Categories → Nerves → Chain Complexes → Betti Numbers");
console.log("=".repeat(80));