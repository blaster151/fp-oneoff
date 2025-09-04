import { describe, it, expect } from "vitest";
import { Z2, Zn } from "../util/FiniteGroups";
import { tupleScheme } from "../pairing/PairingScheme";
import { productGroup } from "../builders/Product";
import { autGroup } from "../automorphisms/Aut";

/** Sanity: |Aut(Z2)|=1, |Aut(Z5)|=4 (units mod 5), |Aut(V4)|=6 (GL(2,2)). */
describe("Aut(G) sizes for small groups", () => {
  it("Z2", () => {
    const A = autGroup(Z2);
    expect(A.elems.length).toBe(1);
  });

  it("Z5", () => {
    const A = autGroup(Zn(5));
    expect(A.elems.length).toBe(4);
  });

  it("V4 = Z2 × Z2", () => {
    const V4 = productGroup(Z2, Z2, tupleScheme<number, number>());
    const A = autGroup(V4);
    expect(A.elems.length).toBe(6);
  });
});