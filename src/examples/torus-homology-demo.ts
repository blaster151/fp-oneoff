// examples/torus-homology-demo.ts
//
// Demo: certified homology via Smith Normal Form.
//
// What you'll see when you run this:
//  - SNF certificates verified (U*A*V === D) with a pinpoint diff if it fails
//  - Homology ranks for T^2 (H0=Z, H1=Z^2, H2=Z)
//  - (Optional) RP^2 example showing torsion Z/2 in H1
//
// Run (pick one):
//   pnpm ts-node examples/torus-homology-demo.ts
//   npx tsx examples/torus-homology-demo.ts
//   ts-node examples/torus-homology-demo.ts

// ---- Adjust this import to match your library location if needed ----
import { smithNormalForm } from "../types/catkit-homology.js";

// ---------- tiny integer-matrix helpers (pure TS) ----------
type Mat = number[][];
const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => Array(c).fill(0));
const shape = (A: Mat) => [A.length, A[0]?.length ?? 0] as const;
const mul = (A: Mat, B: Mat): Mat => {
  const [rA, cA] = shape(A), [rB, cB] = shape(B);
  if (cA !== rB) throw new Error(`mul shape mismatch: ${rA}x${cA} * ${rB}x${cB}`);
  const C = zeros(rA, cB);
  for (let i = 0; i < rA; i++) {
    for (let k = 0; k < cA; k++) {
      const aik = A[i]![k]!;
      if (aik === 0) continue;
      for (let j = 0; j < cB; j++) C[i]![j]! += aik * B[k]![j]!;
    }
  }
  return C;
};
const equalMat = (A: Mat, B: Mat) => {
  const [rA, cA] = shape(A), [rB, cB] = shape(B);
  if (rA !== rB || cA !== cB) return false;
  for (let i = 0; i < rA; i++) for (let j = 0; j < cA; j++) if (A[i]![j] !== B[i]![j]) return false;
  return true;
};
const firstDiff = (A: Mat, B: Mat) => {
  const [rA, cA] = shape(A), [rB, cB] = shape(B);
  if (rA !== rB || cA !== cB) return { loc: [-1, -1], got: NaN, expected: NaN };
  for (let i = 0; i < rA; i++) for (let j = 0; j < cA; j++) if (A[i]![j] !== B[i]![j]) return { loc: [i, j], got: A[i]![j], expected: B[i]![j] };
  return { loc: [-1, -1], got: NaN, expected: NaN };
};
const rankOverZFromSNF = (D: Mat) => {
  // rank = count of nonzero diagonal entries in SNF
  const n = Math.min(D.length, D[0]?.length ?? 0);
  let r = 0;
  for (let i = 0; i < n; i++) if (D[i]![i] !== 0) r++;
  return r;
};
const diagonalInvariants = (D: Mat) => {
  const n = Math.min(D.length, D[0]?.length ?? 0);
  const diag: number[] = [];
  for (let i = 0; i < n; i++) diag.push(D[i]![i]!);
  return diag.filter((d) => d !== 0);
};
const prettyGroup = (freeRank: number, torsion: number[] = []) => {
  const parts: string[] = [];
  if (freeRank === 1) parts.push("Z");
  if (freeRank > 1) parts.push(`Z^${freeRank}`);
  for (const d of torsion) parts.push(`Z/${d}`);
  return parts.length ? parts.join(" ⊕ ") : "0";
};
const verifySNF = (U: Mat, A: Mat, V: Mat, D: Mat) => {
  const UAV = mul(mul(U, A), V);
  if (equalMat(UAV, D)) return { ok: true as const };
  const { loc, got, expected } = firstDiff(UAV, D);
  return { ok: false as const, loc, got, expected };
};

// ---------- Homology ranks from chain complex via SNF ----------
// Chain complex ... → C_{n+1} --d_{n+1}→ C_n --d_n→ C_{n-1} → ...
// Over Z with free, finite ranks: rank H_n = (dim C_n - rank d_n) - rank d_{n+1}
const homologyRanksFromSNF = (dimCn: number, Dn: Mat, Dnp1: Mat) => {
  const rank_dn = rankOverZFromSNF(Dn);
  const rank_dnp1 = rankOverZFromSNF(Dnp1);
  const beta_n = (dimCn - rank_dn) - rank_dnp1;
  return Math.max(beta_n, 0);
};

// (Optional) For pedagogical cases where d_{n-1} = 0, torsion(H_{n-1}) is exactly
// the set of non-unit diagonal entries of SNF(d_n). (E.g., RP^2 example below.)
const torsionInHnm1_whenPrevBoundaryIsZero = (Dn: Mat) =>
  diagonalInvariants(Dn).filter((d) => Math.abs(d) > 1).map((d) => Math.abs(d));

// ---------- Example 1: Torus T^2 ----------
function torusExample() {
  console.log("=".repeat(60));
  console.log("TORUS T^2 HOMOLOGY COMPUTATION");
  console.log("=".repeat(60));
  
  // CW model: 1 vertex v, 2 edges a,b, 1 face c with boundary aba^{-1}b^{-1}.
  // In homology, ∂₂(c)=0 in C₁, ∂₁(a)=∂₁(b)=0 in C₀.
  // Matrices over Z:
  const d2: Mat = [[0, 0]];   // shape 1x2  (C2 -> C1)
  const d1: Mat = [[0], [0]]; // shape 2x1  (C1 -> C0)

  console.log("\nChain complex matrices:");
  console.log("∂₂ (C₂ → C₁):", d2);
  console.log("∂₁ (C₁ → C₀):", d1);

  const { U: U2, D: D2, V: V2 } = smithNormalForm(d2);
  const { U: U1, D: D1, V: V1 } = smithNormalForm(d1);

  const cert2 = verifySNF(U2, d2, V2, D2);
  const cert1 = verifySNF(U1, d1, V1, D1);

  console.log("\n=== Torus T^2: SNF certificates ===");
  console.log("∂2 certificate:", cert2.ok ? "✅ OK" : `❌ FAIL at ${cert2.loc} got ${cert2.got} expected ${cert2.expected}`);
  console.log("∂1 certificate:", cert1.ok ? "✅ OK" : `❌ FAIL at ${cert1.loc} got ${cert1.got} expected ${cert1.expected}`);

  console.log("\nSmith Normal Forms:");
  console.log("SNF(∂₂) =", D2);
  console.log("SNF(∂₁) =", D1);

  // dims: C2=1, C1=2, C0=1
  const H2_rank = homologyRanksFromSNF(1, D2, zeros(0, 0)); // d3 is 0
  const H1_rank = homologyRanksFromSNF(2, D1, D2);
  const H0_rank = homologyRanksFromSNF(1, zeros(1, 1), D1); // d0=0, but we don't use it

  console.log("\n=== Torus T^2: Homology (ranks) ===");
  console.log(`H₂ rank: ${H2_rank}`);
  console.log(`H₁ rank: ${H1_rank}`);
  console.log(`H₀ rank: ${H0_rank}`);

  console.log("\nPretty form:");
  console.log("H₂ ≅", prettyGroup(H2_rank));
  console.log("H₁ ≅", prettyGroup(H1_rank));
  console.log("H₀ ≅", prettyGroup(H0_rank));
  
  console.log("\n🎯 TORUS TOPOLOGY:");
  console.log("• T² = S¹ × S¹ has fundamental group Z²");
  console.log("• H₁(T²) ≅ Z² reflects the two independent loops");
  console.log("• H₂(T²) ≅ Z comes from the 2-dimensional surface");
  console.log("• Total Betti numbers: β₀=1, β₁=2, β₂=1");
}

// ---------- Example 2 (optional): RP^2 showing torsion ----------
function rp2Example() {
  console.log("\n" + "=".repeat(60));
  console.log("REAL PROJECTIVE PLANE RP² HOMOLOGY");
  console.log("=".repeat(60));
  
  // Minimal CW: C2=Z[c], C1=Z[a], C0=Z[v]
  // The 2-cell attaches by degree-2 map on the 1-skeleton → ∂₂ = [2], ∂₁ = [0].
  const d2: Mat = [[2]]; // C2 -> C1
  const d1: Mat = [[0]]; // C1 -> C0

  console.log("\nChain complex matrices:");
  console.log("∂₂ (C₂ → C₁):", d2);
  console.log("∂₁ (C₁ → C₀):", d1);

  const { U: U2, D: D2, V: V2 } = smithNormalForm(d2);
  const { U: U1, D: D1, V: V1 } = smithNormalForm(d1);

  const cert2 = verifySNF(U2, d2, V2, D2);
  const cert1 = verifySNF(U1, d1, V1, D1);

  console.log("\n=== RP^2: SNF certificates ===");
  console.log("∂2 certificate:", cert2.ok ? "✅ OK" : `❌ FAIL at ${cert2.loc} got ${cert2.got} expected ${cert2.expected}`);
  console.log("∂1 certificate:", cert1.ok ? "✅ OK" : `❌ FAIL at ${cert1.loc} got ${cert1.got} expected ${cert1.expected}`);

  console.log("\nSmith Normal Forms:");
  console.log("SNF(∂₂) =", D2);
  console.log("SNF(∂₁) =", D1);

  // dims: C2=1, C1=1, C0=1
  const H2_rank = homologyRanksFromSNF(1, D2, zeros(0, 0)); // no d3
  const H1_rank = homologyRanksFromSNF(1, D1, D2);
  const H0_rank = homologyRanksFromSNF(1, zeros(1, 1), D1);

  // Torsion in H1 comes from non-unit invariant factors of ∂2 since ∂1 = 0 here.
  const H1_torsion = torsionInHnm1_whenPrevBoundaryIsZero(D2);

  console.log("\n=== RP^2: Homology (ranks + torsion) ===");
  console.log(`H₂ ≅ ${prettyGroup(H2_rank)}`);
  console.log(`H₁ ≅ ${prettyGroup(H1_rank, H1_torsion)}   (torsion factors from SNF(∂2): ${H1_torsion.join(", ") || "none"})`);
  console.log(`H₀ ≅ ${prettyGroup(H0_rank)}`);
  
  console.log("\n🎯 RP² TOPOLOGY:");
  console.log("• RP² is the quotient of S² by antipodal identification");
  console.log("• H₁(RP²) ≅ Z/2 shows the non-orientable twist");
  console.log("• The torsion Z/2 comes from the degree-2 boundary map");
  console.log("• Total Betti numbers: β₀=1, β₁=0, β₂=0 (but H₁ has torsion!)");
}

export function demonstrateTorusHomology(): void {
  console.log("=".repeat(80));
  console.log("CERTIFIED HOMOLOGY VIA SMITH NORMAL FORM");
  console.log("=".repeat(80));
  
  console.log("\nThis demo showcases:");
  console.log("• Smith Normal Form computation with certificates");
  console.log("• Homology rank computation for classic surfaces");
  console.log("• Torsion detection in non-orientable manifolds");
  console.log("• Verification that U*A*V = D exactly");
  
  torusExample();
  rp2Example();
  
  console.log("\n" + "=".repeat(80));
  console.log("HOMOLOGY COMPUTATION FEATURES:");
  console.log("✓ Certified Smith Normal Form with runtime verification");
  console.log("✓ Exact integer arithmetic for homology ranks");
  console.log("✓ Torsion detection for non-orientable surfaces");
  console.log("✓ Classical examples: Torus T² and Projective Plane RP²");
  console.log("✓ Mathematical rigor with algorithmic verification");
  console.log("=".repeat(80));
  
  console.log("\n📚 MATHEMATICAL BACKGROUND:");
  console.log("• Chain complexes encode topological information");
  console.log("• Smith Normal Form diagonalizes integer matrices");
  console.log("• Homology groups measure 'holes' in different dimensions");
  console.log("• Torsion elements capture twisting and non-orientability");
  console.log("• Betti numbers count free generators in each dimension");
}

// Run demo if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('torus-homology-demo')) {
  demonstrateTorusHomology();
}