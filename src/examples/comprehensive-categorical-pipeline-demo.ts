// comprehensive-categorical-pipeline-demo.ts
// The complete pipeline: Categories → Nerves → Homology + Quasi-category checking
// Demonstrates the full integration of all categorical machinery

import { makeFreeCategory } from "../types/category-to-nerve-sset.js";
import { computeFreeQuiverHomology } from "../types/catkit-homology-bridge.js";
import { Homology, CommaCategories, Posets } from "../types/index.js";
import { checkQuiverNerveQuasicat, comprehensiveNerveAnalysis } from "../types/nerve-quasicat-bridge.js";
import { isQuasiCategory, nerveOfPoset, printQCReport } from "../types/sset-quasicat.js";

console.log("=".repeat(90));
console.log("COMPREHENSIVE CATEGORICAL PIPELINE DEMO");
console.log("Categories → Nerves → Homology + Quasi-category + Comma constructions");
console.log("=".repeat(90));

// ------------------------------------------------------------
// Example 1: Complete analysis of a 4-cycle
// ------------------------------------------------------------

console.log("\n1. COMPLETE ANALYSIS: 4-CYCLE");

const cycle4 = {
  objects: ["A", "B", "C", "D"],
  edges: [
    { src: "A", dst: "B", label: "f" },
    { src: "B", dst: "C", label: "g" },
    { src: "C", dst: "D", label: "h" },
    { src: "D", dst: "A", label: "k" }
  ]
};

console.log("Quiver: A→B→C→D→A (4-cycle)");

// 1. Category theory
const cat4 = makeFreeCategory(cycle4);
console.log("✓ Free category constructed");

// 2. Homology computation
const homology4 = computeFreeQuiverHomology(cycle4);
console.log("✓ Homology computed:");
console.log(`  H₀: β₀ = ${homology4.rational.betti0} (connected components)`);
console.log(`  H₁: β₁ = ${homology4.rational.betti1} (independent loops)`);

// 3. Quasi-category checking
const quasicat4 = checkQuiverNerveQuasicat(cycle4, 3);
console.log("✓ Quasi-category analysis:");
printQCReport(quasicat4);

// 4. Comprehensive analysis
const analysis4 = comprehensiveNerveAnalysis(cycle4);
console.log("✓ Summary:", analysis4.summary);

console.log("\n" + "-".repeat(70));

// ------------------------------------------------------------
// Example 2: Poset nerve with full checking
// ------------------------------------------------------------

console.log("\n2. POSET NERVE: DIVISIBILITY LATTICE");

const V = ["1", "2", "3", "6"];
const leq = (x: string, y: string) => (parseInt(y) % parseInt(x) === 0);

console.log("Divisibility poset {1,2,3,6}:");

// 1. Build nerve directly
const nerve = nerveOfPoset(V, leq);
console.log("✓ Nerve constructed:");
console.log(`  Dimensions: ${nerve.V.length}V, ${nerve.E.length}E, ${nerve.T2.length}T₂, ${nerve.T3?.length || 0}T₃`);

// 2. Quasi-category verification
const qc_report = isQuasiCategory(nerve, 3);
console.log("✓ Quasi-category verification:");
printQCReport(qc_report);

// 3. Poset as thin category
const poset = Posets.divisibilityPoset(6);
const thin_cat = Posets.thinCategory(poset);
console.log("✓ Thin category structure:");
console.log(`  Elements: ${poset.elems}`);
console.log(`  Sample arrows: 1→6: ${thin_cat.hasArrow(1, 6)}, 2→3: ${thin_cat.hasArrow(2, 3)}`);

// 4. Lattice operations
console.log("✓ Lattice operations (categorical limits):");
console.log(`  meet(2,3) = gcd = ${Posets.meet(poset, 2, 3)}`);
console.log(`  join(2,3) = lcm = ${Posets.join(poset, 2, 3)}`);

console.log("\n" + "-".repeat(70));

// ------------------------------------------------------------
// Example 3: Broken simplicial set analysis
// ------------------------------------------------------------

console.log("\n3. BROKEN SIMPLICIAL SET: MISSING FILLERS");

// Create a broken version by removing some edges
const broken = {
  V: nerve.V,
  E: nerve.E.filter(e => e.key !== "e(1,6)"), // remove 1→6 edge
  T2: nerve.T2.filter(t => t.e02 !== "e(1,6)"), // remove triangles using that edge
  T3: nerve.T3?.filter(t => !t.key.includes("1") || !t.key.includes("6"))
};

console.log("Broken nerve (removed 1→6 edge and related simplices):");
const broken_report = isQuasiCategory(broken, 3);
printQCReport(broken_report);

if (!broken_report.isQuasiCategory) {
  console.log("✅ Expected: broken simplicial set fails quasi-category test");
  console.log(`  Missing ${broken_report.horns2.examplesMissing} Λ²₁ fillers`);
  if (broken_report.horns3) {
    console.log(`  Missing ${broken_report.horns3.examplesMissing} Λ³ᵢ fillers`);
  }
}

console.log("\n" + "-".repeat(70));

// ------------------------------------------------------------
// Example 4: Integration summary
// ------------------------------------------------------------

console.log("\n4. INTEGRATION SUMMARY");

console.log("🔗 CATEGORICAL PIPELINE COMPLETE:");
console.log("  Quivers → Free Categories → Nerves → Simplicial Sets");
console.log("  ↓         ↓                ↓       ↓");
console.log("  Graphs → Compositions → Topology → Homotopy");

console.log("\n📊 COMPUTATIONAL TOOLS:");
console.log("  • Homology: H₀/H₁ Betti numbers via chain complexes");
console.log("  • Quasi-category: Λⁱⁿ inner horn filler verification");
console.log("  • Comma categories: Universal constructions for limits");
console.log("  • Poset categories: Order theory ↔ category theory bridge");

console.log("\n🎯 MATHEMATICAL CONNECTIONS:");
console.log("  • Nerves of categories are automatically quasi-categories");
console.log("  • Inner horn fillers ↔ composition coherence in higher categories");
console.log("  • Homology detects holes, quasi-category detects composition structure");
console.log("  • Comma categories provide indexing for Kan extensions and limits");

console.log("\n" + "=".repeat(90));
console.log("COMPLETE CATEGORICAL TOOLKIT ACHIEVED:");
console.log("✓ Category theory: Small categories, functors, natural transformations");
console.log("✓ Nerve construction: Category → Simplicial set conversion");
console.log("✓ Homology computation: Chain complexes and topological invariants");
console.log("✓ Quasi-category checking: Inner horn fillers and (∞,1)-category structure");
console.log("✓ Comma categories: Universal constructions and slice/coslice");
console.log("✓ Poset integration: Order theory as thin categories");
console.log("✓ Pullbacks/pushouts: Limits and colimits with universal properties");
console.log("=".repeat(90));

console.log("\n🚀 READY FOR ADVANCED APPLICATIONS:");
console.log("• Homotopy type theory with univalent foundations");
console.log("• Model categories and homotopical algebra");
console.log("• Topos theory and geometric morphisms");
console.log("• Higher-dimensional rewriting and coherence");
console.log("• Computational homotopy theory and persistent homology");