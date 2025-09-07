import { Zn } from "../../src/algebra/groups/finite";
import { Hom } from "../../src/algebra/groups/hom";
import { firstIsoWitness } from "../../src/algebra/groups/firstIso";
import { assertIsIso } from "../../scripts/guards/iso-guard";

describe("Isomorphism Guard (CI-style verification)", () => {
  it("passes for valid isomorphism", () => {
    const G = Zn(4), H = Zn(2);
    const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 2 };
    const w = firstIsoWitness(f);
    
    // This should not throw
    expect(() => assertIsIso(w)).not.toThrow();
  });

  it("fails for non-isomorphism", () => {
    const G = Zn(8), H = Zn(2);
    const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 2 };
    const w = firstIsoWitness(f);
    
    // This should pass because Z8 -> Z2 by mod 2 IS an isomorphism via quotient
    expect(() => assertIsIso(w)).not.toThrow();
  });

  it("demonstrates guard catching well-definedness failures", () => {
    // Use a function that's not even a homomorphism
    const G = Zn(4), H = Zn(2);
    const f: Hom<number, number> = { src: G, dst: H, map: (x) => x < 2 ? x : 1 - (x % 2) }; // not a hom
    
    // This should fail at well-definedness check (phi not constant on cosets)
    expect(() => {
      firstIsoWitness(f);
    }).toThrow(/phi not well-defined/);
  });
});