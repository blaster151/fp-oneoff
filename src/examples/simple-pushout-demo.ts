// simple-pushout-demo.ts
// Simple test of quiver pushout functionality

import { QuiverPushout } from "../types/index.js";

console.log("=== SIMPLE QUIVER PUSHOUT DEMO ===");

try {
  // Create simple schemas
  const schema1 = QuiverPushout.makeSchema("schema1", 
    ["User", "Post"], 
    [{ src: "User", dst: "Post", label: "authored" }]
  );
  
  const schema2 = QuiverPushout.makeSchema("schema2",
    ["User", "Comment"],
    [{ src: "User", dst: "Comment", label: "wrote" }]
  );
  
  console.log("Schema 1:");
  QuiverPushout.printQuiver(schema1);
  
  console.log("\nSchema 2:");
  QuiverPushout.printQuiver(schema2);
  
  // Merge schemas
  const merged = QuiverPushout.mergeSchemas(schema1, schema2);
  
  console.log("\nMerged schema:");
  QuiverPushout.printQuiver(merged.pushout);
  QuiverPushout.printAudit(merged.audit);
  
  console.log("\n✅ Quiver pushout working correctly!");
  
} catch (error) {
  console.log("❌ Error:", error);
  console.log("Stack:", (error as Error).stack);
}