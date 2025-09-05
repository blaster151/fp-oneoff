import { describe, it, expect } from "vitest";
import { Z2, Z8 } from "../util/FiniteGroups";
import { GroupHom } from "../GrpCat";
import { firstIsomorphism } from "../theorems/FirstIso";
import { subgroupFromPredicate } from "../Subgroup";
import { quotientGroup } from "../builders/Quotient";

describe("First Isomorphism Theorem: parity hom Z8 → Z2", () => {
  const f: GroupHom<number, number> = { source: Z8, target: Z2, f: (n) => n % 2 };

  it("G/ker f ≅ im f (and im f = Z2)", () => {
    const { quotient: Q, img: Im, phi, isIso } = firstIsomorphism(f);
    expect(Im.elems.length).toBe(2);
    expect(isIso).toBe(true);

    // Cross-check with explicit G/N where N = even subgroup
    const even = subgroupFromPredicate(Z8, (n) => n % 2 === 0);
    const Q2 = quotientGroup(Z8, even);
    expect(Q.elems.length).toBe(Q2.elems.length);

    // phi maps coset of 1 to 1 in Z2 (mod 2)
    const oneCoset = Q.elems.find(x => Z8.eq(x.rep, 1))!;
    expect(Im.eq(phi.f(oneCoset), 1)).toBe(true);
  });
});