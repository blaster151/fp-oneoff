import { describe, it, expect } from "vitest";
import { Z2, Z3 } from "../util/FiniteGroups";
import { endMonoid, unitsAsAutos } from "../endo/End";
import { autGroup } from "../automorphisms/Aut";

describe("End(G) and Units = Aut(G)", () => {
  it("Z2: End has 2 maps (id, collapse); Units has 1 (id)", () => {
    const E = endMonoid(Z2);
    expect(E.elems.length).toBe(2);
    const U = unitsAsAutos(Z2);
    expect(U.length).toBe(1);
  });

  it("Z3: Units count equals |Aut(Z3)|=2", () => {
    const U = unitsAsAutos(Z3);
    const A = autGroup(Z3);
    expect(U.length).toBe(A.elems.length);
  });
});