import { describe, it, expect } from "vitest";
import { Z2, Z8 } from "../util/FiniteGroups";
import { subgroupFromPredicate } from "../Subgroup";
import { isNormalSubgroup, quotientGroup } from "../builders/Quotient";
import { isIsomorphism } from "../Isomorphism";
import { GroupHom } from "../GrpCat";

describe("Quotient Z8 / (even)  ≅  Z2", () => {
  const G = Z8;
  const even = (x: number) => x % 2 === 0;
  const N = subgroupFromPredicate(G, even);

  it("N is normal", () => {
    expect(isNormalSubgroup(G, N)).toBe(true); // abelian, so all subgroups normal
  });

  it("quotient size and ops", () => {
    const Q = quotientGroup(G, N);
    expect(Q.elems.length).toBe(2);

    // pick reps 0 and 1 (any two distinct reps of different cosets will do)
    const c0 = Q.elems.find(x => G.eq(x.rep, 0))!;
    const c1 = Q.elems.find(x => G.eq(x.rep, 1))!;
    // (1)+ (1) = (0) mod 2 lifted
    const s = Q.op(c1, c1);
    expect(Q.eq(s, c0)).toBe(true);
  });

  it("explicit isomorphism Q → Z2 via parity of representatives", () => {
    const Q = quotientGroup(G, N);
    const H = Z2;

    const phi: GroupHom<{ rep: number }, number> = {
      source: Q,
      target: H,
      f: (c) => c.rep % 2 // well-defined because cosets respect parity
    };

    expect(isIsomorphism(Q, H, phi.f)).toBeTruthy();
  });
});