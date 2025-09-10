import { describe, it, expect } from "vitest";
import { groupHom } from "../GroupHom";
import { modHom } from "../examples/cyclic";

describe("First Isomorphism Theorem (finite sanity: Z→Z_n)", () => {
  it("Z/≈_qn  ≅  im(qn) = Z_n", () => {
    const n = 6;
    const { Z, Zn, qn } = modHom(n);
    const f = groupHom(Z, Zn, qn, `q_${n}: Z → Z_${n}`);

    const { quotient: Q, pi, iota, law_compose_equals_f } = f.factorization();

    // finite support for Z: small window around 0
    const support = Array.from({ length: 5*n+1 }, (_, k) => k - 3*n);

    // Witness: iota ∘ pi = f (law_compose_equals_f)
    for (const k of support.slice(0, 10)) { // test first 10
      expect(law_compose_equals_f(k)).toBe(true);
    }

    // surjectivity onto image: every h∈Z_n has preimage [k]
    for (let h = 0; h < n; h++) {
      const found = support.find(k => Zn.eq(qn(k), h));
      expect(found).not.toBeUndefined();
      const coset = pi(found!);
      // iota([k]) = qn(k) = h
      expect(Zn.eq(iota(coset), h)).toBe(true);
    }

    // operation respects cosets: π(a*b) = π(a)*π(b)
    for (const a of support.slice(0, 5)) {
      for (const b of support.slice(0, 5)) {
        const lhs = pi(Z.op(a, b));
        const rhs = Q.op(pi(a), pi(b));
        expect(Q.eq(lhs, rhs)).toBe(true);
      }
    }

    // quotient has expected size: |G/≈| = |im(f)| = n
    expect(Q.elems).toHaveLength(n);
  });

  it("Z→Z_3 quotient isomorphic to image", () => {
    const n = 3;
    const { Z, Zn, qn } = modHom(n);
    const f = groupHom(Z, Zn, qn);

    const { quotient: Q, pi, iota } = f.factorization();

    // Check quotient size matches image size
    expect(Q.elems).toHaveLength(n);
    
    // Check that iota is injective on the quotient
    for (const c1 of Q.elems) {
      for (const c2 of Q.elems) {
        if (Zn.eq(iota(c1), iota(c2))) {
          expect(Q.eq(c1, c2)).toBe(true);
        }
      }
    }
  });

  it("kernel-pair congruence collapses equivalent elements", () => {
    const n = 4;
    const { Z, Zn, qn } = modHom(n);
    const f = groupHom(Z, Zn, qn);
    
    const { pi } = f.factorization();

    // Elements that map to the same value should be in the same coset
    const a1 = 1, a2 = 5; // both map to 1 mod 4
    const coset1 = pi(a1);
    const coset2 = pi(a2);
    
    expect(f.target.eq(qn(a1), qn(a2))).toBe(true); // Same image
    expect(f.target.eq(coset1.rep, coset2.rep) || 
           f.target.eq(qn(coset1.rep), qn(coset2.rep))).toBe(true); // Same coset class
  });
});