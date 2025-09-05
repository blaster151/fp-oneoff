import { describe, it, expect } from "vitest";
import { crtIsomorphism, crtForZn, primePowerFactorization } from "../CRT";
import { ZnRing } from "../Ring";

describe("CRT on Z/n: explicit iso with idempotents", () => {
  it("Z/6 ≅ Z/2 × Z/3", () => {
    const { phi, psi } = crtIsomorphism([2,3]);
    for (let x=0;x<6;x++){
      const back = psi(phi(x));
      expect(back).toBe(x);
    }
    // surjectivity onto product (tiny check)
    const seen = new Set<string>();
    for (let a=0;a<2;a++) for (let b=0;b<3;b++){
      const x = psi([a,b]);
      const pair = phi(x);
      expect(pair[0]).toBe(a);
      expect(pair[1]).toBe(b);
      seen.add(`${a},${b}`);
    }
    expect(seen.size).toBe(6);
  });

  it("prime power factorization covers examples", () => {
    const f = primePowerFactorization(60); // 2^2 * 3 * 5
    const sizes = f.map(x=>x.m).sort((a,b)=>a-b).join(",");
    expect(sizes).toBe("3,4,5");
  });

  it("generic crtForZn works for n=12 (4×3)", () => {
    const { phi, psi } = crtForZn(12);
    for (let x=0;x<12;x++) expect(psi(phi(x))).toBe(x);
  });
});