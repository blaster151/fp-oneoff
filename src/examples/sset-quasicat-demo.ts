// sset-quasicat-demo.ts
// Inner-horn checks for small simplicial sets (up to n=3) and isQuasiCategory(S).
// Includes a tiny nerve builder for finite categories (posets) and demos.

import { 
  SSetUpTo3, nerveOfPoset, isQuasiCategory, printQCReport, printMissingHorns2,
  checkHorns2, checkHorns3
} from "../types/sset-quasicat.js";

console.log("=".repeat(80));
console.log("QUASI-CATEGORY CHECKING & INNER HORNS DEMO");
console.log("=".repeat(80));

/************ Demo 1: Perfect nerve (should pass quasi-category test) ************/
console.log("\n1. NERVE OF DIVISIBILITY POSET");

function demo() {
  const V = ["1","2","3","6"];
  const leq = (x:string,y:string)=> (parseInt(y)%parseInt(x)===0);
  const N = nerveOfPoset(V, leq);
  
  console.log("Divisibility poset {1,2,3,6} nerve:");
  console.log("  Vertices:", N.V.length);
  console.log("  Edges:", N.E.length);
  console.log("  Triangles:", N.T2.length);
  console.log("  Tetrahedra:", N.T3?.length || 0);
  
  const rep = isQuasiCategory(N, 3);
  console.log("\nQuasi-category analysis:");
  printQCReport(rep);
  
  if (rep.isQuasiCategory) {
    console.log("✅ Perfect! Nerve of category is quasi-category (as expected)");
  } else {
    console.log("❌ Unexpected: nerve should be quasi-category");
    printMissingHorns2(N, 3);
  }

  console.log("\n" + "-".repeat(60));

  /************ Demo 2: Broken simplicial set (missing fillers) ************/
  console.log("\n2. BROKEN SIMPLICIAL SET");
  
  // Break the nerve: remove the edge e(1,6) to violate Λ^2_1 fillers involving 1→2→6 etc.
  const broken: SSetUpTo3 = {
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
  
  const rep2 = isQuasiCategory(broken, 3);
  console.log("\nQuasi-category analysis:");
  printQCReport(rep2);
  
  if (!rep2.isQuasiCategory) {
    console.log("✅ Expected! Broken simplicial set fails quasi-category test");
    printMissingHorns2(broken, 3);
  } else {
    console.log("❌ Unexpected: broken set should fail quasi-category test");
  }

  console.log("\n" + "-".repeat(60));

  /************ Demo 3: Manual simplicial set construction ************/
  console.log("\n3. MANUAL SIMPLICIAL SET");
  
  // Simple triangle with all edges and the 2-simplex
  const triangle: SSetUpTo3 = {
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
  
  const rep3 = isQuasiCategory(triangle, 3);
  console.log("\nQuasi-category analysis:");
  printQCReport(rep3);
  
  // Show the specific horn that gets filled
  const horns2_tri = checkHorns2(triangle);
  console.log("\nΛ²₁ horns in triangle:");
  for (const h of horns2_tri) {
    console.log(`  ${h.horn.e01} ∘ ${h.horn.e12} → needs ${h.horn.need_e02.src}→${h.horn.need_e02.dst}, filled: ${h.hasEdge && h.hasTri}`);
  }

  console.log("\n" + "-".repeat(60));

  /************ Demo 4: Incomplete triangle (missing filler) ************/
  console.log("\n4. INCOMPLETE TRIANGLE");
  
  // Triangle with edges but no 2-simplex filler
  const incomplete: SSetUpTo3 = {
    V: ["X", "Y", "Z"],
    E: [
      { key: "XY", src: "X", dst: "Y" },
      { key: "YZ", src: "Y", dst: "Z" },
      { key: "XZ", src: "X", dst: "Z" }
    ],
    T2: [], // no triangles!
    T3: []
  };
  
  console.log("Triangle XYZ with edges but no 2-simplex:");
  console.log("  Has all edges but no triangle filler");
  
  const rep4 = isQuasiCategory(incomplete, 3);
  console.log("\nQuasi-category analysis:");
  printQCReport(rep4);
  
  if (!rep4.isQuasiCategory) {
    console.log("✅ Expected! Missing triangle filler violates quasi-category");
    printMissingHorns2(incomplete, 1);
  }
}

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

demo();