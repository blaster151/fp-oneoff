// test-quasicat-basic.ts
// Minimal test of quasi-category functionality

console.log("Testing basic quasi-category imports...");

try {
  const { QuasiCategory } = await import("../types/index.js");
  console.log("✓ Import successful");
  
  // Test simple triangle
  const triangle: QuasiCategory.SSetUpTo3 = {
    V: ["A", "B", "C"],
    E: [
      { key: "AB", src: "A", dst: "B" },
      { key: "BC", src: "B", dst: "C" },
      { key: "AC", src: "A", dst: "C" }
    ],
    T2: [
      { key: "ABC", e01: "AB", e12: "BC", e02: "AC" }
    ]
  };
  
  console.log("✓ Triangle created");
  
  const report = QuasiCategory.isQuasiCategory(triangle, 2);
  console.log("✓ Quasi-category check completed");
  console.log("Report:", report);
  
} catch (error) {
  console.log("❌ Error:", error);
}