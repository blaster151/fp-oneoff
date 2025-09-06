import { expect } from "vitest";
import { hom } from "../../../structures/group/Hom.js";
import { firstIsomorphismData } from "../FirstIso";
import { modHom, Zmod } from "../examples/cyclic";

describe("First Isomorphism Theorem (finite sanity: Z→Z_n)", () => {
  it("Z/≈_qn  ≅  im(qn) = Z_n", () => {
    const n = 6;
    const { Z, Zn, qn } = modHom(n);
    const f = hom(Z, Zn, qn);

    const { quotient: Q, phi, respectsOp } = firstIsomorphismData(f);

    // finite support for Z: small window around 0
    const support = Array.from({ length: 5*n+1 }, (_, k) => k - 3*n);

    // surjectivity onto image: every h∈Z_n has preimage [k]
    for (let h = 0; h < n; h++) {
      const found = support.find(k => Zn.eq(qn(k), h));
      expect(found).not.toBeUndefined();
      const coset = Q.norm(found!);
      // Φ([k]) = qn(k) = h
      expect(Zn.eq(phi(coset), h)).toBe(true);
    }

    // hom law for a bunch of samples
    for (let a = -5; a <= 5; a++) for (let b = -5; b <= 5; b++) {
      expect(respectsOp(Q.norm(a), Q.norm(b))).toBe(true);
    }
  });
});