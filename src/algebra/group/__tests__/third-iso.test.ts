import { ZmodAdd } from "../examples";
import { makeSubgroup } from "../SubgroupOps";
import { thirdIsomorphism } from "../ThirdIso";

describe("Third Isomorphism Theorem on Z12 (abelian)", () => {
  test("K = ⟨6⟩ ⊆ N = ⟨3⟩ in Z12", () => {
    const Z12 = ZmodAdd(12);
    const K = makeSubgroup(Z12, [0,6],           "⟨6⟩");          // order 2
    const N = makeSubgroup(Z12, [0,3,6,9],       "⟨3⟩");          // order 4

    const res = thirdIsomorphism(Z12, N, K);

    // Sizes: (G/K)/(N/K) has |G/K| / |N/K| = 6/2 = 3; G/N has 12/4 = 3
    expect(res.iso.source.elems.length).toBe(3);
    expect(res.iso.target.elems.length).toBe(3);
    expect(res.iso.leftInverse).toBe(true);
    expect(res.iso.rightInverse).toBe(true);
  });
});