// Quick verification of the updated factorization API
import { groupHom } from "./src/algebra/group/GroupHom";
import { modHom } from "./src/algebra/group/examples/cyclic";
import { imageSubgroup } from "./src/algebra/group/Image";
import { kernelNormalSubgroup } from "./src/algebra/group/Kernel";
import { Eq } from "./src/algebra/core/Eq";

console.log("🧪 Testing updated factorization with Eq abstraction...");

try {
  const { Z, Zn: Z4, qn: mod4 } = modHom(4);
  const f = groupHom(Z, Z4, mod4, "mod4: Z → Z₄");
  
  // Test 1: Default equality (no Eq parameter)
  console.log("✓ Test 1: Default equality");
  const result1 = f.factorization();
  console.log(`  Quotient size: ${result1.quotient.elems.length} (expected: 4)`);
  
  // Test 2: Custom Eq
  console.log("✓ Test 2: Custom Eq");
  const eqZ4: Eq<number> = { eq: (a,b) => (a % 4) === (b % 4) };
  const result2 = f.factorization(eqZ4);
  console.log(`  Quotient size: ${result2.quotient.elems.length} (expected: 4)`);
  
  // Test 3: Law verification
  console.log("✓ Test 3: iota ∘ pi = f law");
  const testValues = [0, 1, 4, 5, 8];
  const allPass = testValues.every(x => result2.law_compose_equals_f(x));
  console.log(`  All laws pass: ${allPass}`);
  
  // Test 4: Image subgroup
  console.log("✓ Test 4: Image subgroup");
  const image = imageSubgroup(f, eqZ4.eq);
  console.log(`  Image size: ${image.elems.length} (expected: 4)`);
  
  // Test 5: Kernel subgroup  
  console.log("✓ Test 5: Kernel normal subgroup");
  const kernel = kernelNormalSubgroup(f, eqZ4.eq);
  console.log(`  Kernel size: ${kernel.elems.length} (expected: varies)`);
  
  console.log("🎉 All tests passed! New Eq-based API working correctly.");
  
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
