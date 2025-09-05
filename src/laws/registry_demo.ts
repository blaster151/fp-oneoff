import { allLawful, runAll, clearLawful } from "./registry";
import "./packs"; // side-effect: registers packs

console.log("🔬 Law Registry Demo\n");

// Show all registered packs
console.log("📋 Registered Law Packs:");
const packs = allLawful();
packs.forEach((pack, i) => {
  console.log(`  ${i + 1}. ${pack.tag}`);
});
console.log(`\nTotal: ${packs.length} packs\n`);

// Run all laws
console.log("🧪 Running All Laws:");
const report = runAll();

// Show results
report.forEach((result, i) => {
  const status = result.ok ? "✅ PASS" : "❌ FAIL";
  console.log(`  ${i + 1}. ${result.tag}: ${status}`);
  
  if (!result.ok && result.failures) {
    result.failures.forEach(failure => {
      console.log(`     - ${failure.name}${failure.witness ? ` (witness: ${JSON.stringify(failure.witness)})` : ""}`);
    });
  }
});

// Summary
const passed = report.filter(r => r.ok).length;
const failed = report.filter(r => !r.ok).length;
console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);

// Demo: Clear and re-register
console.log("\n🔄 Demo: Clear and re-register");
clearLawful();
console.log(`After clear: ${allLawful().length} packs`);

// Note: In a real application, you would re-import modules to re-register packs
console.log("Note: Re-importing modules would re-register packs");

console.log("\n=== Registry Demo Complete ===");