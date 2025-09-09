import { expect } from "vitest";
import { GroupHom } from "../Hom";
import { kernelIsNormal } from "../FirstIso";
import { modHom, Zmod } from "../examples/cyclic";
import { hom } from "../Hom";

describe("Kernel of a group hom is a normal subgroup", () => {
  it("kernel(q_n : Z→Z_n) = nℤ and is normal", () => {
    const { Z, Zn, qn } = modHom(5);
    const f = hom(Z, Zn, qn);

    // Kernel predicate: multiples of 5
    const ker = kernelIsNormal(f);
    const inKer = (k: number) => ker.carrier(k);

    expect(inKer(0)).toBe(true);
    expect(inKer(5)).toBe(true);
    expect(inKer(-10)).toBe(true);
    expect(inKer(3)).toBe(false);
    expect(inKer(12)).toBe(false);

    // Subgroup closure sanity
    expect(inKer(Z.op(5, 10))).toBe(true);     // 15
    expect(inKer(Z.inv(5))).toBe(true);        // -5

    // Normality: g n g^{-1} ∈ ker for arbitrary g,n
    const g = 7, n = 10; // n∈ker (multiple of 5)
    expect(ker.carrier(Z.op(g, Z.op(n, Z.inv(g))))).toBe(true);
  });

  it("kernel(id_Zn) is {0} and normal", () => {
    const Zn = Zmod(7);
    const id = new GroupHom(Zn, Zn, x => x);
    const ker = id.kernel();
    for (let a = 0; a < 7; a++) {
      expect(ker.carrier(a)).toBe(a === 0);
    }
    // normality check on small sample
    for (let g = 0; g < 7; g++) {
      for (let n = 0; n < 7; n++) {
        if (ker.carrier(n)) {
          expect(ker.carrier(Zn.op(g, Zn.op(n, Zn.inv(g))))).toBe(true);
        }
      }
    }
  });
});