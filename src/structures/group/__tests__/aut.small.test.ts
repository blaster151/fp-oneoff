import { describe, it, expect } from "vitest";
import { Zn } from "../Group";
import { automorphismsBruteforce } from "../Isomorphism";

describe("Automorphisms (small brute force)", () => {
  it("Aut(Z3) has φ(3)=2 elements", () => {
    const Z3 = Zn(3);
    const autos = automorphismsBruteforce(Z3);
    expect(autos.length).toBe(2);
    // closed under composition
    for (const a of autos) for (const b of autos) {
      const comp = (x:number) => a.f(b.f(x));
      const found = autos.some(h => Z3.elems.every(x => Z3.eq(h.f(x), comp(x))));
      expect(found).toBe(true);
    }
  });

  it("Aut(Z4) has φ(4)=2 elements", () => {
    const Z4 = Zn(4);
    const autos = automorphismsBruteforce(Z4);
    expect(autos.length).toBe(2);
  });
});