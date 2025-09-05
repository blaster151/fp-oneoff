import { describe, it, expect } from "vitest";
import "../packs";                // side-effect: registers packs
import { runAll, allLawful } from "../registry";

describe("All law packs", () => {
  it("every registered pack satisfies its laws", () => {
    const report = runAll();
    const failures = report.filter(r => !r.ok);
    if (failures.length) {
      // Pretty-print failures with minimal counterexamples if present
      const msg = failures.map(f => {
        const lines = [`✗ ${f.tag}`];
        for (const fail of f.failures || []) {
          lines.push(`  - ${fail.name}${fail.witness ? `  (witness: ${JSON.stringify(fail.witness)})` : ""}`);
        }
        return lines.join("\n");
      }).join("\n");
      // Surface a single assertion, but keep the details:
      // eslint-disable-next-line no-console
      console.error("\nLaw failures:\n" + msg + "\n");
    }
    expect(failures.length, "Some law packs failed; see console for witnesses.").toBe(0);
  });

  it("sanity: at least one pack is registered", () => {
    expect(allLawful().length).toBeGreaterThan(0);
  });
});