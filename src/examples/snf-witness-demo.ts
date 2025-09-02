// snf-witness-demo.ts
// Demonstration of SNF certificate witnesses for homology verification

import { 
  checkSNFCertificate, verifySNFProperties, createExampleSNFCertificates,
  demonstrateSNFWitnesses, SNFCertificate
} from "../types/snf-witness.js";

console.log("=".repeat(80));
console.log("🔍 SMITH NORMAL FORM WITNESS DEMONSTRATION 🔍");
console.log("=".repeat(80));

export function snfWitnessDemo() {
  console.log("\n1. 📐 BASIC SNF CERTIFICATE VERIFICATION");
  
  // Test a simple valid certificate
  const U = [[1, 0], [0, 1]];
  const V = [[1, 0], [0, 1]];
  const A = [[3, 6], [0, 9]];
  const D = [[3, 0], [0, 9]];
  
  console.log("Testing valid SNF certificate:");
  console.log(`  Original matrix A: [[${A[0]!.join(', ')}], [${A[1]!.join(', ')}]]`);
  console.log(`  Diagonal form D: [[${D[0]!.join(', ')}], [${D[1]!.join(', ')}]]`);
  console.log(`  U matrix: [[${U[0]!.join(', ')}], [${U[1]!.join(', ')}]]`);
  console.log(`  V matrix: [[${V[0]!.join(', ')}], [${V[1]!.join(', ')}]]`);
  
  const validResult = checkSNFCertificate(U, A, V, D);
  console.log(`\nCertificate verification: ${validResult.ok ? '✅' : '❌'}`);
  
  if (!validResult.ok) {
    console.log(`  Failure reason: ${validResult.reason}`);
    console.log(`  Details:`, validResult.detail);
  }
  
  console.log("\n2. ❌ INVALID CERTIFICATE WITNESSES");
  
  // Test invalid product
  const D_wrong = [[2, 0], [0, 7]]; // Wrong diagonal values
  const invalidProduct = checkSNFCertificate(U, A, V, D_wrong);
  
  console.log("Testing invalid product (U*A*V ≠ D):");
  console.log(`  Wrong diagonal: [[${D_wrong[0]!.join(', ')}], [${D_wrong[1]!.join(', ')}]]`);
  console.log(`  Result: ${invalidProduct.ok ? '✅' : '❌'}`);
  
  if (!invalidProduct.ok) {
    console.log(`  Failure reason: ${invalidProduct.reason}`);
    if (invalidProduct.detail?.computed) {
      const comp = invalidProduct.detail.computed;
      console.log(`  Computed U*A*V: [[${comp[0].join(', ')}], [${comp[1].join(', ')}]]`);
    }
  }
  
  // Test non-diagonal matrix
  const D_nondiag = [[3, 1], [0, 9]]; // Off-diagonal element
  const nonDiagonal = checkSNFCertificate(U, A, V, D_nondiag);
  
  console.log("\nTesting non-diagonal matrix:");
  console.log(`  Non-diagonal D: [[${D_nondiag[0]!.join(', ')}], [${D_nondiag[1]!.join(', ')}]]`);
  console.log(`  Result: ${nonDiagonal.ok ? '✅' : '❌'}`);
  
  if (!nonDiagonal.ok) {
    console.log(`  Failure reason: ${nonDiagonal.reason}`);
    console.log(`  Violations:`, nonDiagonal.detail);
  }
  
  // Test divisibility chain violation
  const D_divisibility = [[6, 0], [0, 4]]; // 4 does not divide 6
  const divisibilityTest = checkSNFCertificate(U, [[6, 0], [0, 4]], V, D_divisibility);
  
  console.log("\nTesting divisibility chain violation:");
  console.log(`  Bad divisibility D: [[${D_divisibility[0]!.join(', ')}], [${D_divisibility[1]!.join(', ')}]]`);
  console.log(`  Result: ${divisibilityTest.ok ? '✅' : '❌'}`);
  
  if (!divisibilityTest.ok) {
    console.log(`  Failure reason: ${divisibilityTest.reason}`);
    console.log(`  Violations:`, divisibilityTest.detail);
  }
  
  console.log("\n3. 📊 COMPREHENSIVE SNF VERIFICATION");
  
  const examples = createExampleSNFCertificates();
  
  console.log("Testing example certificates:");
  
  for (const [name, cert] of Object.entries(examples)) {
    const verification = verifySNFProperties(cert);
    
    console.log(`\n${name.toUpperCase()} certificate:`);
    console.log(`  Matrix A: ${cert.A.length}×${cert.A[0]?.length} matrix`);
    console.log(`  Certificate valid: ${verification.certificate.ok ? '✅' : '❌'}`);
    console.log(`  Rank: ${verification.rank}`);
    console.log(`  Invariant factors: [${verification.invariantFactors.join(', ')}]`);
    console.log(`  Unimodular U: ${verification.unimodularU ? '✅' : '❌'}`);
    console.log(`  Unimodular V: ${verification.unimodularV ? '✅' : '❌'}`);
  }
  
  console.log("\n4. 🎯 HOMOLOGY INTEGRATION");
  
  console.log("SNF witnesses enable:");
  console.log("  • Verified homology computation with certificates");
  console.log("  • Rank computation with constructive proofs");
  console.log("  • Invariant factor extraction with validation");
  console.log("  • Matrix factorization debugging with counterexamples");
  console.log("  • Educational homology with step-by-step verification");
  
  console.log("\n5. 🔬 MATHEMATICAL APPLICATIONS");
  
  console.log("SNF certificate witnesses provide:");
  console.log("  ✓ Constructive proof that U*A*V = D");
  console.log("  ✓ Diagonal structure verification with violation details");
  console.log("  ✓ Divisibility chain checking with counterexamples");
  console.log("  ✓ Matrix dimension validation with mismatch reporting");
  console.log("  ✓ Rank and invariant factor computation with certificates");
  console.log("  ✓ Integration with homology computation for verified results");
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 MODULE 5 COMPLETE: SNF/HOMOLOGY WITNESS SYSTEM:");
  console.log("✓ Matrix factorization certificates with detailed verification");
  console.log("✓ Diagonal structure checking with violation reporting");
  console.log("✓ Divisibility chain verification with counterexamples");
  console.log("✓ Homology computation with constructive certificates");
  console.log("✓ Educational matrix algebra with step-by-step witnesses");
  console.log("=".repeat(80));
}

// Run built-in demonstration
demonstrateSNFWitnesses();

// Run our comprehensive demo
snfWitnessDemo();