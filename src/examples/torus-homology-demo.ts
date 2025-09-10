// src/examples/torus-homology-demo.ts
// ---------------------------------------------------------------------------
// Torus homology demo (self-contained)
//
// - No external imports
// - Minimal integer-matrix helpers (Matrixh, mul, ranks over Q)
// - Computes cellular homology of T^2 from standard CW structure:
//     C2 = Z, C1 = Z^2, C0 = Z
//     ∂2 = 0 (1×2 zero), ∂1 = 0 (2×1 zero)
//   ⇒ H2 ≅ Z, H1 ≅ Z^2, H0 ≅ Z
// ---------------------------------------------------------------------------

// Lightweight "matrix handle" with a callable constructor and a couple helpers.
type Matrixh = number[][];

interface MatrixhCtor {
  (rows: number[][]): Matrixh;     // allow Matrixh([[...], ...])
  abs(A: Matrixh): Matrixh;        // elementwise absolute value
  min(A: Matrixh): number;         // global min entry
  max(A: Matrixh): number;         // global max entry
}

const Matrixh: MatrixhCtor = ((rows: number[][]) => rows) as MatrixhCtor;
Matrixh.abs = (A) => A.map(r => r.map(Math.abs));
Matrixh.min = (A) => Math.min(...A.flat());
Matrixh.max = (A) => Math.max(...A.flat());

function shape(A: Matrixh): [number, number] {
  const m = A.length;
  const n = m ? (A[0]?.length ?? 0) : 0;
  return [m, n];
}

// Plain matrix multiply over integers (A: m×k, B: k×n) → m×n.
function mul(A: Matrixh, B: Matrixh): Matrixh {
  const [m, k] = shape(A);
  const [k2, n] = shape(B);
  if (k !== k2) throw new Error(`mul: inner dims mismatch (${k} vs ${k2})`);
  const C: Matrixh = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let t = 0; t < k; t++) {
      const a = A[i][t] || 0;
      if (a === 0) continue;
      for (let j = 0; j < n; j++) C[i][j] += a * (B[t][j] || 0);
    }
  }
  return C;
}

// Rank over Q via Gaussian elimination (sufficient here; torsion not needed for T^2).
function rankOverQ(A: Matrixh): number {
  const M = A.map(row => row.map(x => x)); // copy
  const [m, n] = shape(M);
  let r = 0, c = 0;
  while (r < m && c < n) {
    // Find pivot in column c at or below row r
    let piv = r;
    for (let i = r; i < m; i++) {
      if (Math.abs(M[i][c] || 0) > Math.abs(M[piv][c] || 0)) piv = i;
    }
    if ((M[piv][c] || 0) === 0) { c++; continue; }
    // Swap rows r and piv
    if (piv !== r) [M[r], M[piv]] = [M[piv], M[r]];
    // Normalize row r (over Q)
    const pivVal = M[r][c];
    for (let j = c; j < n; j++) M[r][j] = (M[r][j] || 0) / pivVal;
    // Eliminate below
    for (let i = r + 1; i < m; i++) {
      const factor = M[i][c] || 0;
      if (factor === 0) continue;
      for (let j = c; j < n; j++) M[i][j] = (M[i][j] || 0) - factor * M[r][j];
    }
    r++; c++;
  }
  return r;
}

// Pretty-print helpers
function fmtMat(A: Matrixh): string {
  if (A.length === 0) return "[]";
  const cols = Math.max(0, ...A.map(r => r.length));
  const widths = Array.from({ length: cols }, (_, j) =>
    Math.max(1, ...A.map(r => (r[j] ?? 0).toString().length))
  );
  return A.map(r =>
    "[ " + r.map((x, j) => (x ?? 0).toString().padStart(widths[j]!)).join(" ") + " ]"
  ).join("\n");
}

function assertZero(B: Matrixh, name: string) {
  const nz = B.flat().some(x => x !== 0);
  if (nz) throw new Error(`${name} should be the zero matrix`);
}

/**
 * Compute homology ranks for a chain complex
 *   C2 --d2--> C1 --d1--> C0
 * over Z by using ranks over Q (free parts only).
 */
function homologyRanks(
  d2: Matrixh, // size: dim(C1) × dim(C2)
  d1: Matrixh, // size: dim(C0) × dim(C1)
  dimC2: number,
  dimC1: number,
  dimC0: number
): { H2: number; H1: number; H0: number } {
  const rk_d2 = rankOverQ(d2);
  const rk_d1 = rankOverQ(d1);
  const ker_d2 = dimC2 - rk_d2; // rank ker ∂2 : C2 → C1
  const ker_d1 = dimC1 - rk_d1; // rank ker ∂1 : C1 → C0
  const im_d2 = rk_d2;          // over Q, rank(im ∂2) = rank(∂2)
  const im_d1 = rk_d1;

  // H2 = ker ∂2 / im ∂3  (im ∂3 = 0 here)
  const H2 = ker_d2;
  // H1 = ker ∂1 / im ∂2
  const H1 = ker_d1 - im_d2;
  // H0 = ker ∂0 / im ∂1, but ker ∂0 = C0 (no ∂0); hence rank = dimC0 - rk(∂1)
  const H0 = dimC0 - im_d1;

  return { H2, H1, H0 };
}

// Demo: torus T^2 with standard CW structure
export function demo() {
  console.log("=".repeat(80));
  console.log("TORUS HOMOLOGY DEMO (self-contained)");
  console.log("=".repeat(80));

  // C2 = Z (1 2-cell), C1 = Z^2 (two 1-cells a,b), C0 = Z (one 0-cell)
  const dimC2 = 1, dimC1 = 2, dimC0 = 1;

  // Cellular boundary maps for T^2:
  // ∂2: Z -> Z^2 is 0 (the attaching map [a,b] abelianizes to 0)
  // ∂1: Z^2 -> Z is 0 (both 1-cells loop at the unique 0-cell)
  const d2: Matrixh = Matrixh([
    [0], // row for a
    [0], // row for b
  ]); // shape 2×1

  const d1: Matrixh = Matrixh([
    [0, 0], // single row into the single 0-cell
  ]); // shape 1×2

  console.log("\nBoundary matrices (cellular):");
  console.log("∂2 : C2→C1 (2×1)\n" + fmtMat(d2));
  console.log("∂1 : C1→C0 (1×2)\n" + fmtMat(d1));

  // Sanity: ∂1 ∘ ∂2 = 0
  const zeroCheck = mul(d1, d2);
  assertZero(zeroCheck, "∂1 ∘ ∂2");

  const ranks = homologyRanks(d2, d1, dimC2, dimC1, dimC0);

  console.log("\nHomology ranks (free parts over Z):");
  console.log(`H2(T^2) ≅ Z^${ranks.H2}`);
  console.log(`H1(T^2) ≅ Z^${ranks.H1}`);
  console.log(`H0(T^2) ≅ Z^${ranks.H0}`);

  console.log("\nConclusion (expected):");
  console.log("  H2(T^2) ≅ Z");
  console.log("  H1(T^2) ≅ Z ⊕ Z");
  console.log("  H0(T^2) ≅ Z");

  console.log("\nNotes:");
  console.log("• This demo uses ranks over Q; torsion detection would require Smith Normal Form.");
  console.log("• For the torus, torsion is absent, so ranks fully describe the homology.");
  console.log("• All helpers in this file are demo-only and isolated from the library build.");

  console.log("\n" + "=".repeat(80));
}

// Run when executed directly (e.g., ts-node src/examples/torus-homology-demo.ts)
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("torus-homology-demo")) {
  demo();
}
