// test-quasicat-direct.ts
// Direct test of quasi-category demo functionality

import { QuasiCategory } from "../types/index.js";

console.log("=== Testing Quasi-Category Demo ===");

try {
  QuasiCategory.demo();
  console.log("✅ Demo completed successfully");
} catch (error) {
  console.log("❌ Demo failed:", error);
  console.log("Stack:", (error as Error).stack);
}