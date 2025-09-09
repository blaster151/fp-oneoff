import { expect } from "vitest";
import { kernel, imagePredicate, hom } from "../../src/algebra/group/Hom";
import { modHom, Zmod } from "../../src/algebra/group/examples/cyclic";

describe("Kernel of a group hom is a normal subgroup", () => {
  it("kernel(q_n : Z→Z_n) = nℤ and is normal", () => {
    const { Z, Zn, qn } = modHom(5);
    
    // Create homomorphism using consolidated approach
    const f = hom(Z, Zn, qn, "mod5");

    // Kernel predicate: multiples of 5
    const ker = kernel(f);
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
    
    // Test normality more comprehensively
    for (let testG = 1; testG <= 20; testG++) {
      for (let testN = 5; testN <= 50; testN += 5) { // multiples of 5
        expect(ker.carrier(Z.op(testG, Z.op(testN, Z.inv(testG))))).toBe(true);
      }
    }
  });

  it("kernel(id_Zn) is {0} and normal", () => {
    const Zn = Zmod(7);
    
    // Create identity homomorphism using consolidated approach
    const id = hom(Zn, Zn, x => x, "id");
    const ker = kernel(id);
    for (let a = 0; a < 7; a++) {
      expect(ker.carrier(a)).toBe(a === 0);
    }
    // Normality check: for all g ∈ Z_7, n ∈ ker(id), we have g n g^{-1} ∈ ker(id)
    for (let g = 0; g < 7; g++) {
      for (let n = 0; n < 7; n++) {
        if (ker.carrier(n)) { // n ∈ ker(id) ⟺ n = 0
          expect(ker.carrier(Zn.op(g, Zn.op(n, Zn.inv(g))))).toBe(true);
        }
      }
    }
    
    // Verify that non-kernel elements don't satisfy the kernel predicate
    for (let n = 1; n < 7; n++) {
      expect(ker.carrier(n)).toBe(false);
    }
  });
});