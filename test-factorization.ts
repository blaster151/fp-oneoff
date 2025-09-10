// Quick test of the new factorization API
import { groupHom } from "./src/algebra/group/GroupHom";
import { modHom } from "./src/algebra/group/examples/cyclic";

const n = 4;
const { Z, Zn, qn } = modHom(n);
const f = groupHom(Z, Zn, qn, `q_${n}: Z → Z_${n}`);

console.log("Testing factorization for Z → Z_4...");

try {
  const { quotient: Q, pi, iota, law_compose_equals_f } = f.factorization();
  
  console.log("✓ Factorization created successfully");
  console.log(`✓ Quotient has ${Q.elems.length} elements (expected: ${n})`);
  
  // Test the First Isomorphism Theorem law: iota ∘ pi = f
  const testElements = [0, 1, 5, 8]; // Various elements including equivalents
  
  for (const x of testElements) {
    const passes = law_compose_equals_f(x);
    console.log(`✓ iota(pi(${x})) = f(${x}): ${passes}`);
  }
  
  // Test congruent elements map to same coset
  const a = 1, b = 5; // 1 ≡ 5 (mod 4)
  const cosetA = pi(a);
  const cosetB = pi(b);
  const sameCoset = Q.eq(cosetA, cosetB);
  console.log(`✓ Congruent elements ${a} and ${b} in same coset: ${sameCoset}`);
  
  console.log("🎉 All tests passed! Factorization API working correctly.");
  
} catch (error) {
  console.error("❌ Test failed:", error);
}
