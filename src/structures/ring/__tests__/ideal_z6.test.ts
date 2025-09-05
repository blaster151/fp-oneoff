import { describe, it, expect } from "vitest";
import { ZnRing } from "../Ring";
import { idealGeneratedBy, isIdeal, quotientRing, isPrimeIdealComm, isMaximalIdealComm, isFieldComm } from "../Ideal";

describe("Ideals in Z6", () => {
  const Z6 = ZnRing(6);

  it("I=(3) is an ideal; Z6/I ≅ Z3 (field), hence maximal and prime", () => {
    const I = idealGeneratedBy(Z6, [3]);
    expect(isIdeal(I)).toBe(true);

    const { ring:Q, proj } = quotientRing(Z6, I);
    // Z6/(3) has 3 elements: [0],[1],[2]
    expect(Q.elems.length).toBe(3);
    expect(isFieldComm(Q)).toBe(true);
    expect(isMaximalIdealComm(I)).toBe(true);
    expect(isPrimeIdealComm(I)).toBe(true);

    // sample operation check: [2]+[2]=[4]=[1] in Z6/(3)
    const two = proj(2), four = proj(4), one = proj(1);
    expect(Q.eq(Q.add(two,two), four)).toBe(true);
    expect(Q.eq(four, one)).toBe(true);
  });

  it("J=(2) gives Z6/(2) ≅ Z2 (also a field, maximal & prime)", () => {
    const J = idealGeneratedBy(Z6, [2]);
    const { ring:Q2 } = quotientRing(Z6, J);
    expect(Q2.elems.length).toBe(2);
    expect(isFieldComm(Q2)).toBe(true);
    expect(isMaximalIdealComm(J)).toBe(true);
    expect(isPrimeIdealComm(J)).toBe(true);
  });
});