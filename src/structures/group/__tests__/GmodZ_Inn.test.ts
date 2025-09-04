import { describe, it, expect } from "vitest";
import { Z2, Z3 } from "../util/FiniteGroups";
import { GmodZ_iso_Inn } from "../theorems/GmodZ_Inn";

describe("G/Z(G) ≅ Inn(G)", () => {
  it("abelian groups: Z(G)=G, so G/Z(G) is trivial and Inn(G) is trivial", () => {
    for (const G of [Z2, Z3]) {
      const { Z, Q, isIso } = GmodZ_iso_Inn(G);
      expect(Z.elems.length).toBe(G.elems.length);
      expect(Q.elems.length).toBe(1);
      expect(isIso).toBe(true);
    }
  });
});