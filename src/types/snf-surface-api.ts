// snf-surface-api.ts
// Clean façade API for SNF verification with witness-based failure reporting
// Provides user-friendly interface for homology computations

import { smithNormalForm } from './catkit-homology.js';
import { LawCheck, lawCheck, lawCheckSuccess } from './witnesses.js';

/************ Matrix Types and Utilities ************/

export type Matrix = number[][];

/** SNF verification witness for matrix computation failures */
export interface SNFVerificationWitness {
  loc: [number, number];  // Position [i,j] where mismatch occurs
  got: number;           // Actual value at U*A*V[i][j]
  expected: number;      // Expected value at D[i][j]
  matrixSizes: {
    U: [number, number];
    A: [number, number];
    V: [number, number];
    D: [number, number];
  };
}

/** Diagonal explanation for homology interpretation */
export interface DiagonalExplanation {
  rank: number;                    // Number of free generators (nonzero diagonal entries)
  torsionFactors: number[];       // Torsion elements (absolute values of nonzero, non-unit entries)
  freeRank: number;               // Same as rank, but clearer naming
  hasTorsion: boolean;            // Whether there are torsion elements
  prettyForm: string;             // Human-readable group description
  betti: number;                  // Betti number (rank)
}

/************ Core API Functions ************/

/** Matrix utilities */
export function matrixShape(A: Matrix): [number, number] {
  return [A.length, A[0]?.length ?? 0];
}

export function matrixZeros(r: number, c: number): Matrix {
  return Array.from({ length: r }, () => Array(c).fill(0));
}

export function matrixMultiply(A: Matrix, B: Matrix): Matrix {
  const [rA, cA] = matrixShape(A);
  const [rB, cB] = matrixShape(B);
  
  if (cA !== rB) {
    throw new Error(`Matrix multiplication shape mismatch: ${rA}×${cA} * ${rB}×${cB}`);
  }
  
  const C: Matrix = Array.from({ length: rA }, () => Array(cB).fill(0));
  
  for (let i = 0; i < rA; i++) {
    for (let k = 0; k < cA; k++) {
      const aik = A[i]![k]!;
      if (aik === 0) continue;
      for (let j = 0; j < cB; j++) {
        C[i]![j]! += aik * B[k]![j]!;
      }
    }
  }
  
  return C;
}

export function matricesEqual(A: Matrix, B: Matrix): boolean {
  const [rA, cA] = matrixShape(A);
  const [rB, cB] = matrixShape(B);
  
  if (rA !== rB || cA !== cB) return false;
  
  for (let i = 0; i < rA; i++) {
    for (let j = 0; j < cA; j++) {
      if (A[i]![j] !== B[i]![j]) return false;
    }
  }
  
  return true;
}

function findFirstDifference(A: Matrix, B: Matrix): SNFVerificationWitness | null {
  const [rA, cA] = matrixShape(A);
  const [rB, cB] = matrixShape(B);
  
  if (rA !== rB || cA !== cB) {
    return {
      loc: [-1, -1],
      got: rA * cA,
      expected: rB * cB,
      matrixSizes: {
        U: matrixShape(A),
        A: [0, 0],
        V: [0, 0],
        D: matrixShape(B)
      }
    };
  }
  
  for (let i = 0; i < rA; i++) {
    for (let j = 0; j < cA; j++) {
      if (A[i]![j] !== B[i]![j]) {
        return {
          loc: [i, j],
          got: A[i]![j]!,
          expected: B[i]![j]!,
          matrixSizes: {
            U: [0, 0], // Will be filled by caller
            A: [0, 0],
            V: [0, 0],
            D: matrixShape(B)
          }
        };
      }
    }
  }
  
  return null;
}

/************ Main API Functions ************/

/** 
 * Verify SNF decomposition: U*A*V = D
 * Returns success or witness with pinpoint matrix difference
 */
export function verifySNF(
  A: Matrix,
  U: Matrix, 
  V: Matrix, 
  D: Matrix
): LawCheck<SNFVerificationWitness> {
  try {
    // Compute U*A*V
    const UA = matrixMultiply(U, A);
    const UAV = matrixMultiply(UA, V);
    
    // Check if UAV = D
    if (matricesEqual(UAV, D)) {
      return lawCheckSuccess("SNF verification successful: U*A*V = D");
    }
    
    // Find first difference for witness
    const diff = findFirstDifference(UAV, D);
    
    if (diff) {
      const witness: SNFVerificationWitness = {
        ...diff,
        matrixSizes: {
          U: matrixShape(U),
          A: matrixShape(A),
          V: matrixShape(V),
          D: matrixShape(D)
        }
      };
      
      return lawCheck(false, witness, 
        `SNF verification failed: U*A*V ≠ D at position [${diff.loc[0]}, ${diff.loc[1]}]`
      );
    }
    
    return lawCheck(false, {
      loc: [-1, -1],
      got: NaN,
      expected: NaN,
      matrixSizes: {
        U: matrixShape(U),
        A: matrixShape(A), 
        V: matrixShape(V),
        D: matrixShape(D)
      }
    }, "SNF verification failed: unknown matrix computation error");
    
  } catch (error) {
    return lawCheck(false, {
      loc: [-1, -1],
      got: NaN,
      expected: NaN,
      matrixSizes: {
        U: matrixShape(U),
        A: matrixShape(A), 
        V: matrixShape(V),
        D: matrixShape(D)
      }
    }, `SNF verification error: ${error}`);
  }
}

/**
 * Explain diagonal matrix in terms of rank, torsion, and homological meaning
 */
export function explainDiagonal(D: Matrix): DiagonalExplanation {
  const [rows, cols] = matrixShape(D);
  const n = Math.min(rows, cols);
  
  // Extract diagonal entries
  const diagonal: number[] = [];
  for (let i = 0; i < n; i++) {
    diagonal.push(D[i]![i] ?? 0);
  }
  
  // Calculate rank (number of nonzero entries)
  const nonzeroDiagonal = diagonal.filter(d => d !== 0);
  const rank = nonzeroDiagonal.length;
  
  // Calculate torsion factors (absolute values of non-unit entries)
  const torsionFactors = nonzeroDiagonal
    .filter(d => Math.abs(d) > 1)
    .map(d => Math.abs(d))
    .sort((a, b) => a - b);
  
  const hasTorsion = torsionFactors.length > 0;
  
  // Create pretty form
  const parts: string[] = [];
  if (rank === 1) parts.push("ℤ");
  if (rank > 1) parts.push(`ℤ^${rank}`);
  for (const factor of torsionFactors) {
    parts.push(`ℤ/${factor}`);
  }
  const prettyForm = parts.length > 0 ? parts.join(" ⊕ ") : "0";
  
  return {
    rank,
    torsionFactors,
    freeRank: rank,
    hasTorsion,
    prettyForm,
    betti: rank
  };
}

/************ Convenience Functions ************/

/**
 * Compute and verify SNF in one step
 */
export function computeAndVerifySNF(A: Matrix): {
  snf: { U: Matrix; D: Matrix; V: Matrix };
  verification: LawCheck<SNFVerificationWitness>;
  explanation: DiagonalExplanation;
} {
  const { U, D, V } = smithNormalForm(A);
  const verification = verifySNF(A, U, V, D);
  const explanation = explainDiagonal(D);
  
  return { snf: { U, D, V }, verification, explanation };
}

/**
 * Pretty print SNF verification result
 */
export function printSNFVerification(
  name: string,
  verification: LawCheck<SNFVerificationWitness>
): void {
  if (verification.ok) {
    console.log(`${name}: ✅ ${verification.note}`);
  } else if (verification.witness) {
    const w = verification.witness;
    console.log(`${name}: ❌ FAIL at [${w.loc[0]}, ${w.loc[1]}] got ${w.got} expected ${w.expected}`);
    console.log(`  Matrix sizes: U(${w.matrixSizes.U[0]}×${w.matrixSizes.U[1]}) A(${w.matrixSizes.A[0]}×${w.matrixSizes.A[1]}) V(${w.matrixSizes.V[0]}×${w.matrixSizes.V[1]}) D(${w.matrixSizes.D[0]}×${w.matrixSizes.D[1]})`);
  } else {
    console.log(`${name}: ❌ ${verification.note}`);
  }
}

/**
 * Pretty print diagonal explanation
 */
export function printDiagonalExplanation(
  name: string,
  explanation: DiagonalExplanation
): void {
  console.log(`${name}: ${explanation.prettyForm}`);
  console.log(`  Rank: ${explanation.rank}, Betti: ${explanation.betti}`);
  
  if (explanation.hasTorsion) {
    console.log(`  Torsion: ${explanation.torsionFactors.join(", ")}`);
  } else {
    console.log(`  Torsion: none (free group)`);
  }
}

/************ Homology-Specific Helpers ************/

/**
 * Compute homology rank from chain complex via SNF
 * H_n rank = (dim C_n - rank ∂_n) - rank ∂_{n+1}
 */
export function homologyRankFromSNF(
  chainDimension: number,
  boundaryMatrix: Matrix,
  nextBoundaryMatrix: Matrix
): number {
  const boundaryRank = explainDiagonal(boundaryMatrix).rank;
  const nextBoundaryRank = explainDiagonal(nextBoundaryMatrix).rank;
  
  const homologyRank = (chainDimension - boundaryRank) - nextBoundaryRank;
  return Math.max(homologyRank, 0);
}

/**
 * Compute homology group explanation from boundary matrix
 * For cases where the previous boundary is zero
 */
export function homologyFromBoundary(
  chainDimension: number,
  boundaryMatrix: Matrix
): DiagonalExplanation {
  const boundaryExplanation = explainDiagonal(boundaryMatrix);
  const homologyRank = chainDimension - boundaryExplanation.rank;
  
  // Torsion in H_{n-1} comes from non-unit diagonal entries of ∂_n
  const torsionFactors = boundaryExplanation.torsionFactors;
  
  return {
    rank: homologyRank,
    torsionFactors,
    freeRank: homologyRank,
    hasTorsion: torsionFactors.length > 0,
    prettyForm: explainDiagonal([[homologyRank]]).prettyForm + 
      (torsionFactors.length > 0 ? ` ⊕ ${torsionFactors.map(t => `ℤ/${t}`).join(" ⊕ ")}` : ""),
    betti: homologyRank
  };
}

/************ Demonstration Utilities ************/

/**
 * Create a deliberately broken SNF for testing failure cases
 */
export function createBrokenSNF(): {
  A: Matrix;
  U: Matrix;
  V: Matrix;
  D: Matrix;
} {
  // Create matrices where U*A*V ≠ D to test failure reporting
  const A: Matrix = [[1, 2], [3, 4]];
  const U: Matrix = [[1, 0], [0, 1]]; // Identity
  const V: Matrix = [[1, 0], [0, 1]]; // Identity
  const D: Matrix = [[1, 2], [3, 5]]; // Wrong entry at [1,1]: should be 4, not 5
  
  return { A, U, V, D };
}

/**
 * Demonstrate the surface API with both success and failure cases
 */
export function demonstrateSNFSurfaceAPI(): void {
  console.log("=".repeat(80));
  console.log("SNF SURFACE API DEMONSTRATION");
  console.log("=".repeat(80));
  
  console.log("\n1. SUCCESSFUL SNF VERIFICATION");
  
  // Test with a correct SNF (trivial case)
  const trivialA: Matrix = [[2, 0], [0, 3]];
  const trivialResult = computeAndVerifySNF(trivialA);
  
  printSNFVerification("Trivial diagonal matrix", trivialResult.verification);
  printDiagonalExplanation("Diagonal explanation", trivialResult.explanation);
  
  console.log("\n2. FAILED SNF VERIFICATION WITH PINPOINT DIFF");
  
  // Test with broken SNF
  const broken = createBrokenSNF();
  const brokenVerification = verifySNF(broken.A, broken.U, broken.V, broken.D);
  
  printSNFVerification("Broken SNF test", brokenVerification);
  
  console.log("\n3. DIAGONAL EXPLANATIONS");
  
  // Various diagonal examples
  const examples = [
    { name: "Free rank 2", matrix: [[1, 0], [0, 1]] },
    { name: "Rank 1 with Z/2 torsion", matrix: [[1, 0], [0, 2]] },
    { name: "Rank 0 with Z/3 torsion", matrix: [[3, 0], [0, 0]] },
    { name: "Mixed: rank 1 + Z/2 + Z/4", matrix: [[1, 0, 0], [0, 2, 0], [0, 0, 4]] }
  ];
  
  for (const example of examples) {
    const explanation = explainDiagonal(example.matrix);
    console.log(`\n${example.name}:`);
    console.log(`  Diagonal: [${example.matrix.map(row => row[0]).join(", ")}]`);
    printDiagonalExplanation("Homology", explanation);
  }
  
  console.log("\n4. HOMOLOGY COMPUTATION EXAMPLE");
  
  // Torus example using the new API
  console.log("\nTorus T² using surface API:");
  
  // Chain complex: C₂ --∂₂--> C₁ --∂₁--> C₀
  const d2: Matrix = [[0, 0]];   // ∂₂: C₂ → C₁ (trivial)
  const d1: Matrix = [[0], [0]]; // ∂₁: C₁ → C₀ (trivial)
  
  const snf2 = computeAndVerifySNF(d2);
  const snf1 = computeAndVerifySNF(d1);
  
  printSNFVerification("∂₂ verification", snf2.verification);
  printSNFVerification("∂₁ verification", snf1.verification);
  
  // Compute homology ranks
  const H2_rank = homologyRankFromSNF(1, d2, [[]]); // C₂ dim=1, no ∂₃
  const H1_rank = homologyRankFromSNF(2, d1, d2);   // C₁ dim=2
  const H0_rank = homologyRankFromSNF(1, [[]], d1); // C₀ dim=1, no ∂₀
  
  console.log("\nTorus homology:");
  console.log(`  H₂: ${explainDiagonal([[H2_rank]]).prettyForm}`);
  console.log(`  H₁: ${explainDiagonal([[H1_rank, 0]]).prettyForm}`);
  console.log(`  H₀: ${explainDiagonal([[H0_rank]]).prettyForm}`);
  
  console.log("\n5. FAILURE CASE DEMONSTRATION");
  
  // Create a matrix that should be SNF but isn't
  const badMatrix: Matrix = [[1, 2], [0, 3]]; // Not in SNF form (has 2 in [0,1])
  const identity: Matrix = [[1, 0], [0, 1]];
  
  const badVerification = verifySNF(badMatrix, identity, identity, badMatrix);
  console.log("\nTesting non-SNF matrix as if it were SNF:");
  printSNFVerification("Bad SNF claim", badVerification);
  
  // The verification should succeed because U*A*V = I*A*I = A = D
  // But let's test with wrong D
  const wrongD: Matrix = [[1, 0], [0, 3]]; // Different from badMatrix
  const wrongVerification = verifySNF(badMatrix, identity, identity, wrongD);
  console.log("\nTesting with wrong D matrix:");
  printSNFVerification("Wrong D matrix", wrongVerification);
}

/************ Integration with Existing Homology Code ************/

/**
 * Enhanced homology computation with surface API
 */
export function computeHomologyWithVerification(
  chainComplex: { dimensions: number[]; boundaries: Matrix[] }
): {
  homologyGroups: DiagonalExplanation[];
  verifications: LawCheck<SNFVerificationWitness>[];
  summary: string;
} {
  const homologyGroups: DiagonalExplanation[] = [];
  const verifications: LawCheck<SNFVerificationWitness>[] = [];
  
  // Compute SNF for each boundary matrix
  for (let i = 0; i < chainComplex.boundaries.length; i++) {
    const boundary = chainComplex.boundaries[i]!;
    const result = computeAndVerifySNF(boundary);
    
    verifications.push(result.verification);
    
    if (result.verification.ok) {
      const nextBoundary = chainComplex.boundaries[i + 1] || [[]];
      const homologyRank = homologyRankFromSNF(
        chainComplex.dimensions[i] || 0,
        boundary,
        nextBoundary
      );
      
      homologyGroups.push(explainDiagonal([[homologyRank]]));
    } else {
      // Use error placeholder
      homologyGroups.push({
        rank: 0,
        torsionFactors: [],
        freeRank: 0,
        hasTorsion: false,
        prettyForm: "ERROR",
        betti: 0
      });
    }
  }
  
  // Create summary
  const allVerified = verifications.every(v => v.ok);
  const summary = allVerified 
    ? `All ${verifications.length} boundary matrices verified successfully`
    : `${verifications.filter(v => !v.ok).length} verification failures detected`;
  
  return { homologyGroups, verifications, summary };
}

/************ Export for Integration ************/

export { smithNormalForm };

// Re-export for convenience
export type { LawCheck };