import { describe, it, expect } from "vitest";
import { groupHom as createGroupHom } from "../../src/algebra/group/GroupHom";
import { modHom } from "../../src/algebra/group/examples/cyclic";
import { Eq } from "../../src/algebra/core/Eq";

describe("Factorization with Eq", () => {
  it("respects iota∘pi = f with custom equality", () => {
    const { Z, Zn: Z4, qn: mod4 } = modHom(4);
    const f = createGroupHom(Z, Z4, mod4);
    
    // Custom equality for Z4 using modular arithmetic
    const eqZ4: Eq<number> = { eq: (a,b) => (a % 4) === (b % 4) };
    
    const { quotient, pi, iota, law_compose_equals_f } = f.factorization(eqZ4);
    
    // Test the law on several elements
    const testElements = [0, 1, 4, 5, 8, -1, -4];
    for (const g of testElements) {
      expect(law_compose_equals_f(g)).toBe(true);
    }
    
    // Quotient should have 4 elements (size of image)
    expect(quotient.elems).toHaveLength(4);
  });

  it("works with default target equality when no Eq provided", () => {
    const { Z, Zn: Z3, qn: mod3 } = modHom(3);
    const f = createGroupHom(Z, Z3, mod3);
    
    // Use default equality (no Eq parameter)
    const { quotient, pi, iota, law_compose_equals_f } = f.factorization();
    
    // Test the law
    for (const g of [0, 1, 2, 3, 6, 9]) {
      expect(law_compose_equals_f(g)).toBe(true);
    }
    
    expect(quotient.elems).toHaveLength(3);
  });

  it("demonstrates equivalence classes with custom Eq", () => {
    const { Z, Zn: Z6, qn: mod6 } = modHom(6);
    const f = createGroupHom(Z, Z6, mod6);
    
    const eqZ6: Eq<number> = { eq: (a,b) => (a % 6) === (b % 6) };
    const { pi } = f.factorization(eqZ6);
    
    // Elements that are equivalent mod 6 should map to same coset
    const coset1 = pi(1);
    const coset7 = pi(7); // 7 ≡ 1 (mod 6)
    const coset13 = pi(13); // 13 ≡ 1 (mod 6)
    
    expect(f.target.eq(coset1.rep, coset7.rep) || 
           f.target.eq(mod6(coset1.rep), mod6(coset7.rep))).toBe(true);
    expect(f.target.eq(coset1.rep, coset13.rep) || 
           f.target.eq(mod6(coset1.rep), mod6(coset13.rep))).toBe(true);
  });
});
