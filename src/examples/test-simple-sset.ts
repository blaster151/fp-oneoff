// test-simple-sset.ts
// Simple test of the sset functionality

import { QuasiCategory } from "../types/index.js";

console.log("=== Simple SSet Test ===");

try {
  // Create simple triangle
  const triangle = QuasiCategory.makeSSet(
    ["A", "B", "C"],
    [
      {src: "A", dst: "B"},
      {src: "B", dst: "C"}, 
      {src: "A", dst: "C"}
    ],
    [
      {verts: ["A", "B", "C"] as [string, string, string]}
    ]
  );
  
  console.log("✓ Triangle created");
  console.log("Vertices:", triangle.V);
  console.log("Edges:", triangle.E.length);
  console.log("Triangles:", triangle.T2.length);
  
  const report = QuasiCategory.isQuasiCategory(triangle, 2);
  console.log("✓ Quasi-category check completed");
  QuasiCategory.printQCReport(report);
  
} catch (error) {
  console.log("❌ Error:", error);
  console.log("Stack:", (error as Error).stack);
}