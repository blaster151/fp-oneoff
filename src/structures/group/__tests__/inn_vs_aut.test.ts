import { describe, it, expect } from "vitest";
import { Zn } from "../util/FiniteGroups";
import { autGroup } from "../automorphisms/Aut";
import { innGroup } from "../automorphisms/Inner";
import { productGroup } from "../builders/Product";
import { Z2 } from "../util/FiniteGroups";
import { tupleScheme } from "../pairing/PairingScheme";

describe("Inn(G) vs Aut(G)", () => {
  it("abelian: Inn(Z5) is trivial, Aut(Z5) has 4 elements", () => {
    const Inn = innGroup(Zn(5));
    const Aut = autGroup(Zn(5));
    expect(Inn.elems.length).toBe(1);
    expect(Aut.elems.length).toBe(4);
  });

  it("V4 abelian ⇒ Inn(V4) trivial, Aut(V4) has 6", () => {
    const V4 = productGroup(Z2, Z2, tupleScheme<number, number>());
    const Inn = innGroup(V4);
    const Aut = autGroup(V4);
    expect(Inn.elems.length).toBe(1);
    expect(Aut.elems.length).toBe(6);
  });
});