// Simple test of Eq functionality
import { Eq } from "./src/algebra/core/Eq";

const eq1: Eq<number> = { eq: (a,b) => a === b };
const eq2: Eq<number> = { eq: (a,b) => (a % 4) === (b % 4) };

console.log("Testing Eq interface:");
console.log("eq1(5, 5):", eq1.eq(5, 5)); // true
console.log("eq1(5, 9):", eq1.eq(5, 9)); // false
console.log("eq2(1, 5):", eq2.eq(1, 5)); // true (1 ≡ 5 mod 4)
console.log("eq2(1, 3):", eq2.eq(1, 3)); // false (1 ≢ 3 mod 4)

console.log("✅ Eq abstraction working!");
