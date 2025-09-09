import { describe, it, expect } from "vitest";
import { Z2, Z8 } from "../util/FiniteGroups";
import { subgroupFromPredicate } from "../Subgroup";
import { isNormalSubgroup, quotientGroup } from "../builders/Quotient";
import { isIsomorphism } from "../Isomorphism";
import { GroupHom } from "../GrpCat";
import { secondIsomorphismTheorem, thirdIsomorphismTheorem } from "../../../algebra/group/Hom";

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

  it("Second Isomorphism Theorem: A={0,4}, N={0,2,4,6}", () => {
    // A = {0,4} (subgroup of order 2)
    const A_elements = [0, 4];
    // N = {0,2,4,6} (normal subgroup of order 4) 
    const N_elements = [0, 2, 4, 6];
    
    const secondIso = secondIsomorphismTheorem(G, A_elements, N_elements, "Z8 Second Iso");
    
    // Verify witness data
    expect(secondIso.witnesses?.secondIsoData).toBeDefined();
    const data = secondIso.witnesses!.secondIsoData!;
    
    // A·N should be all of N (since A ⊆ N in this case)
    expect(data.product.elems.sort()).toEqual([0, 2, 4, 6]);
    
    // A∩N should be A itself (since A ⊆ N)
    expect(data.intersection.elems.sort()).toEqual([0, 4]);
    
    // Verify subgroup properties
    expect(data.subgroup.elems.sort()).toEqual([0, 4]);
    expect(data.normalSubgroup.elems.sort()).toEqual([0, 2, 4, 6]);
  });

  it("Third Isomorphism Theorem: K={0,4}, N={0,2,4,6}", () => {
    // K = {0,4} (normal subgroup of order 2)
    const K_elements = [0, 4];
    // N = {0,2,4,6} (normal subgroup of order 4, K ⊆ N)
    const N_elements = [0, 2, 4, 6];
    
    const thirdIso = thirdIsomorphismTheorem(G, K_elements, N_elements, "Z8 Third Iso");
    
    // Verify witness data
    expect(thirdIso.witnesses?.thirdIsoData).toBeDefined();
    const data = thirdIso.witnesses!.thirdIsoData!;
    
    // Verify subgroup properties
    expect(data.innerNormal.elems.sort()).toEqual([0, 4]);
    expect(data.outerNormal.elems.sort()).toEqual([0, 2, 4, 6]);
    
    // Verify K ⊆ N
    expect(data.innerNormal.elems.every(k => 
      data.outerNormal.elems.some(n => G.eq(k, n))
    )).toBe(true);
  });
});