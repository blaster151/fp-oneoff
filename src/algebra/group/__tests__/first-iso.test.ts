import { describe, it, expect } from "vitest";
import { GroupHom } from "../structures";
import { firstIsomorphismData } from "../FirstIso";
import { modHom, Zmod } from "../examples/cyclic";

describe("First Isomorphism Theorem (finite sanity: Z→Z_n)", () => {
  it("Z/≈_qn  ≅  im(qn) = Z_n", () => {
    const n = 6;
    const { Z, Zn, qn } = modHom(n);
    const f: GroupHom<number, number> = {
      source: Z,
      target: Zn,
      map: qn,
      name: `q_${n}: Z → Z_${n}`
    };

    const { quotient: Q, phi, respectsOp, checkIsomorphism } = firstIsomorphismData(f);

    // finite support for Z: small window around 0
    const support = Array.from({ length: 5*n+1 }, (_, k) => k - 3*n);

    // surjectivity onto image: every h∈Z_n has preimage [k]
    for (let h = 0; h < n; h++) {
      const found = support.find(k => Zn.eq!(qn(k), h));
      expect(found).not.toBeUndefined();
      const coset = Q.norm(found!);
      // Φ([k]) = qn(k) = h
      expect(Zn.eq!(phi(coset), h)).toBe(true);
    }

    // hom law for a bunch of samples
    for (let a = -5; a <= 5; a++) {
      for (let b = -5; b <= 5; b++) {
        expect(respectsOp(Q.norm(a), Q.norm(b))).toBe(true);
      }
    }

    // Check that the canonical map is an isomorphism
    const isoCheck = checkIsomorphism(support);
    expect(isoCheck.bijective).toBe(true);
    expect(isoCheck.injective).toBe(true);
    expect(isoCheck.surjective).toBe(true);

    // Verify quotient group has correct size
    expect(Q.Group.elems).toHaveLength(n);
  });

  it("Z/≈_q4  ≅  Z_4", () => {
    const n = 4;
    const { Z, Zn, qn } = modHom(n);
    const f: GroupHom<number, number> = {
      source: Z,
      target: Zn,
      map: qn,
      name: `q_${n}: Z → Z_${n}`
    };

    const { quotient: Q, phi, checkIsomorphism } = firstIsomorphismData(f);
    const support = Z.elems;

    // The quotient should have exactly 4 elements
    expect(Q.Group.elems).toHaveLength(4);

    // Each coset should map to the correct element in Z_4
    for (const coset of Q.Group.elems) {
      const image = phi(coset);
      expect(Zn.elems).toContain(image);
    }

    // Verify isomorphism
    const isoCheck = checkIsomorphism(support);
    expect(isoCheck.bijective).toBe(true);
  });

  it("Congruence relation properties", () => {
    const n = 3;
    const { Z, Zn, qn } = modHom(n);
    const f: GroupHom<number, number> = {
      source: Z,
      target: Zn,
      map: qn
    };

    const { cong } = firstIsomorphismData(f);

    // Test reflexivity: x ≈ x
    expect(cong.eqv(5, 5)).toBe(true);
    expect(cong.eqv(-2, -2)).toBe(true);

    // Test symmetry: if x ≈ y then y ≈ x
    expect(cong.eqv(7, 1)).toBe(true); // 7 ≡ 1 (mod 3)
    expect(cong.eqv(1, 7)).toBe(true);

    // Test transitivity: if x ≈ y and y ≈ z then x ≈ z
    expect(cong.eqv(10, 4)).toBe(true); // 10 ≡ 4 ≡ 1 (mod 3)
    expect(cong.eqv(4, 1)).toBe(true);
    expect(cong.eqv(10, 1)).toBe(true);

    // Test compatibility: if x≈x' and y≈y' then x◦y ≈ x'◦y'
    expect(cong.comp(7, 1, 8, 2)).toBe(true); // 7≈1, 8≈2, and 7+8=15≈0, 1+2=3≈0
  });
});