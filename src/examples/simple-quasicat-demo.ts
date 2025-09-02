// simple-quasicat-demo.ts
// Simple demonstration of quasi-category checking functionality

import { QuasiCategory } from "../types/index.js";

console.log("=".repeat(80));
console.log("SIMPLE QUASI-CATEGORY DEMO");
console.log("=".repeat(80));

console.log("\n1. NERVE OF DIVISIBILITY POSET");

const V = ["1","2","3","6"];
const leq = (x:string,y:string)=> (parseInt(y)%parseInt(x)===0);
const N = QuasiCategory.nerveOfPoset(V, leq);

console.log("Divisibility poset {1,2,3,6} nerve:");
console.log("  Vertices:", N.V.length);
console.log("  Edges:", N.E.length);
console.log("  Triangles:", N.T2.length);
console.log("  Tetrahedra:", N.T3?.length || 0);

const rep = QuasiCategory.isQuasiCategory(N, 3);
console.log("\nQuasi-category analysis:");
QuasiCategory.printQCReport(rep);

if (rep.isQuasiCategory) {
  console.log("✅ Perfect! Nerve of category is quasi-category (as expected)");
} else {
  console.log("❌ Unexpected: nerve should be quasi-category");
  QuasiCategory.printMissingHorns2(N, 3);
}

console.log("\n" + "-".repeat(60));

console.log("\n2. BROKEN SIMPLICIAL SET");

// Break the nerve: remove the edge e(1,6) to violate Λ^2_1 fillers
const broken: QuasiCategory.SSetUpTo3 = {
  V: N.V,
  E: N.E.filter(e => e.key!=="e(1,6)"),
  T2: N.T2.filter(t => !(t.e02==="e(1,6)" || (t.e01==="e(1,2)" && t.e12==="e(2,6)"))),
  T3: N.T3?.filter(T => ![T.d0,T.d1,T.d2,T.d3].some(face => 
    face==="t(1,2,6)" || face==="t(1,3,6)" || face==="t(1,1,6)"))
};

console.log("Broken nerve (removed edge 1→6 and related simplices):");
console.log("  Vertices:", broken.V.length);
console.log("  Edges:", broken.E.length, "(was", N.E.length, ")");
console.log("  Triangles:", broken.T2.length, "(was", N.T2.length, ")");
console.log("  Tetrahedra:", broken.T3?.length || 0, "(was", N.T3?.length || 0, ")");

const rep2 = QuasiCategory.isQuasiCategory(broken, 3);
console.log("\nQuasi-category analysis:");
QuasiCategory.printQCReport(rep2);

if (!rep2.isQuasiCategory) {
  console.log("✅ Expected! Broken simplicial set fails quasi-category test");
  QuasiCategory.printMissingHorns2(broken, 3);
} else {
  console.log("❌ Unexpected: broken set should fail quasi-category test");
}

console.log("\n" + "-".repeat(60));

console.log("\n3. SIMPLE TRIANGLE");

// Simple triangle with all edges and the 2-simplex
const triangle: QuasiCategory.SSetUpTo3 = {
  V: ["A", "B", "C"],
  E: [
    { key: "AB", src: "A", dst: "B" },
    { key: "BC", src: "B", dst: "C" },
    { key: "AC", src: "A", dst: "C" }
  ],
  T2: [
    { key: "ABC", e01: "AB", e12: "BC", e02: "AC" }
  ],
  T3: [] // no 3-simplices
};

console.log("Triangle ABC with filled 2-simplex:");
console.log("  Vertices:", triangle.V);
console.log("  Edges:", triangle.E.map(e => `${e.src}→${e.dst}`));
console.log("  Triangles:", triangle.T2.map(t => t.key));

const rep3 = QuasiCategory.isQuasiCategory(triangle, 3);
console.log("\nQuasi-category analysis:");
QuasiCategory.printQCReport(rep3);

console.log("\n" + "=".repeat(80));
console.log("QUASI-CATEGORY FEATURES DEMONSTRATED:");
console.log("✓ Inner horn Λ²₁ enumeration and checking");
console.log("✓ Inner horn Λ³₁, Λ³₂ enumeration and checking");
console.log("✓ isQuasiCategory() comprehensive testing function");
console.log("✓ Nerve construction for finite posets/categories");
console.log("✓ Automatic verification: nerves pass quasi-category tests");
console.log("✓ Broken examples: missing fillers detected correctly");
console.log("=".repeat(80));

console.log("\n🎯 HIGHER-CATEGORY PLUMBING:");
console.log("• Λⁱⁿ inner horns generalize Λ¹² fillers to arbitrary dimensions");
console.log("• Quasi-category = simplicial set with all inner horn fillers");
console.log("• Nerves of categories automatically satisfy quasi-category axioms");
console.log("• Practical gateway to (∞,1)-category theory and homotopy");
console.log("• Finite search algorithms for horn filling verification");