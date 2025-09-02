// homology-presentation-demo.ts
import { Homology } from "../types/index.js";

type HomologyQuiver = Homology.HomologyQuiver;
type SSet02 = Homology.SSet02;

// Quiver: square with a diagonal (still one fundamental loop)
const Q: HomologyQuiver = {
  objects: ["A","B","C","D"],
  edges: [
    {src:"A", dst:"B", label:"ab"},
    {src:"B", dst:"C", label:"bc"},
    {src:"C", dst:"D", label:"cd"},
    {src:"D", dst:"A", label:"da"},
    {src:"A", dst:"C", label:"ac"} // diagonal
  ]
};

console.log("=== HOMOLOGY PRESENTATION DEMO ===");
console.log("Quiver: Square ABCD with diagonal A→C");

// Betti over Q:
const HQ = Homology.computeHomology01(Q, {maxPathLen:2});
console.log("β0,β1 over ℚ:", HQ.betti0, HQ.betti1);

// Integral homology + presentation + chosen generators
const HZ = Homology.computeHomology01_Z(Q, {maxPathLen:2});
console.log("H1 over ℤ:", `ℤ^${HZ.H1.rank}`,
            HZ.H1.torsion.length? (" ⊕ " + HZ.H1.torsion.map(d=>`ℤ/${d}`).join(" ⊕ ")):"");
console.log("Presentation generators:", HZ.presentation.generators);
console.log("Relations:", HZ.presentation.relations);

// Print chosen generators (free + torsion) as readable loops
console.log("\n--- H₁ Generators ---");
for(const g of HZ.presentation.freeGenerators){
  console.log(`[free] ${g.name} =`, Homology.prettyChain(g.coeffs));
}
for(const t of HZ.presentation.torsionGenerators){
  console.log(`[torsion order ${t.order}] ${t.name} =`, Homology.prettyChain(t.coeffs));
}

// SNF certificate: check d1
console.log("\n--- Smith Normal Form Certificate ---");
const d1_data = Homology.boundary1(Q, {maxPathLen:2});
const d1 = d1_data.mat;
const snf1 = Homology.smithNormalForm(d1);
const cert1 = Homology.certifySNF(d1, snf1.U, snf1.D, snf1.V);
console.log("SNF certificate for ∂₁: U*A*V === D ?", cert1.ok);
console.log("SNF diagonal shape:", snf1.D.length, "×", snf1.D[0]?.length || 0);

// Show some diagonal entries
const diag = [];
for(let i = 0; i < Math.min(snf1.D.length, snf1.D[0]?.length || 0); i++) {
  const val = snf1.D[i]?.[i] || 0;
  if(val !== 0) diag.push(val);
}
console.log("SNF diagonal (non-zero):", diag);

console.log("\n--- Simplicial Set with Oriented 2-Simplices ---");
// SSet with oriented 2-simplices: fill triangle with explicit orientation
const S: SSet02 = {
  V: ["v0","v1","v2"],
  E: [
    { key:"e01", faces:["v0","v1"] },
    { key:"e12", faces:["v1","v2"] },
    { key:"e02", faces:["v0","v2"] }
  ],
  T: [
    { key:"t012", faces:["e02","e12","e01"], signs:[+1,+1,-1] } // explicit orientation
  ]
};

const HS = Homology.H01_fromSSet_Z(S);
console.log("Filled triangle H₀:", `ℤ^${HS.H0.rank}`, HS.H0.torsion.length ? `⊕ torsion` : "");
console.log("Filled triangle H₁:", `ℤ^${HS.H1.rank}`, HS.H1.torsion.length ? `⊕ ${HS.H1.torsion.map(d=>`ℤ/${d}`).join(" ⊕ ")}` : "");

// Inner horn check
const holes = Homology.missingInnerHorns2(S);
console.log("Missing inner 2-horns (Λ²₁):", holes.length, "holes");

console.log("\n--- Advanced Features Demonstrated ---");
console.log("✓ Hardened Smith Normal Form with unimodular certificates");
console.log("✓ H₁ presentation: generators + relations + torsion structure");
console.log("✓ Flexible SimplicialSet loader with oriented 2-simplices");
console.log("✓ Inner-horn completeness checking for quasi-category structure");
console.log("✓ Full divisibility normal form: D[i] | D[i+1]");

console.log("\n=== Integration with Category Theory ===");
console.log("This demonstrates the bridge:");
console.log("Categories → Nerves → Chain Complexes → Smith Normal Form → H₁ Presentation");
console.log("Perfect for analyzing topological properties of:");
console.log("• Workflow graphs • Process categories • Compositional systems");