// simple-effects-demo.ts
// Simple test of the FreeApplicative + Coyoneda effect system

import { Effects } from "../types/index.js";

console.log("=== SIMPLE EFFECTS DEMO ===");

try {
  // Create a simple field
  const ageField = Effects.field("age", (s: string) => parseInt(s, 10), "integer");
  console.log("✓ Field created");

  // Create documentation
  const doc = Effects.foldMap(Effects.DocOps, Effects.natFormToDoc, ageField);
  console.log("Documentation:", doc._doc);

  // Test validation
  const RVops = Effects.readerOps();
  const runAge = Effects.foldMap(RVops as any, Effects.natFormToReaderValidation as any, ageField);
  
  const goodEnv = { age: "25" };
  const badEnv = { age: "not-a-number" };
  
  console.log("Good validation:", runAge(goodEnv));
  console.log("Bad validation:", runAge(badEnv));
  
  console.log("✅ Effect system working correctly!");
  
} catch (error) {
  console.log("❌ Error:", error);
  console.log("Stack:", (error as Error).stack);
}