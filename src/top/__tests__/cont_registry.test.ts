import { describe, it, expect } from "vitest";
import "../cont_packs";                   // registers default entries
import { runContAll, allCont } from "../ContRegistry";

describe("Continuous-map registry", () => {
  it("all registered maps are continuous", () => {
    const report = runContAll();
    const failures = report.filter(r => !r.ok);
    if (failures.length) {
      // eslint-disable-next-line no-console
      console.error("Continuity failures:", failures);
    }
    expect(failures.length).toBe(0);
  });

  it("sanity: has entries", () => {
    expect(allCont().length).toBeGreaterThan(0);
  });
});