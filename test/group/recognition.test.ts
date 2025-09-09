import { describe, it, expect } from "vitest";
import { Group, GroupHom } from "../../src/algebra/group/FirstIso";
import { isInjective, isSurjective, isBijective, isMonomorphism, isEpimorphism } from "../../src/algebra/group/recognition";

const C3: Group<number> = {
  eq: (a,b) => (a%3)===(b%3),
  op: (a,b) => (a+b)%3,
  e: 0,
  inv: a => (3-(a%3))%3,
  elements: [0,1,2],
};
const C3toC3_double: GroupHom<number,number> = {
  src: C3, dst: C3,
  map: (a: any) => (2*a)%3,
  respectsOp: () => true,
};
const C3toTrivial: GroupHom<number,number> = {
  src: C3, dst: { ...C3, elements: [0] },
  map: (_: any) => 0,
  respectsOp: () => true,
};

describe("recognition helpers (finite)", () => {
  it("injective/surjective/bijective", () => {
    expect(isInjective(C3toC3_double)).toBe(true);
    expect(isSurjective(C3toC3_double)).toBe(true);
    expect(isBijective(C3toC3_double)).toBe(true);

    expect(isInjective(C3toTrivial)).toBe(false);
    expect(isSurjective(C3toTrivial)).toBe(true); // onto trivial group
    expect(isBijective(C3toTrivial)).toBe(false);
  });

  it("mono/epi equivalences (finite groups)", () => {
    expect(isMonomorphism(C3toC3_double)).toBe(true);
    expect(isEpimorphism(C3toC3_double)).toBe(true);

    expect(isMonomorphism(C3toTrivial)).toBe(false);
    expect(isEpimorphism(C3toTrivial)).toBe(true);
  });
});