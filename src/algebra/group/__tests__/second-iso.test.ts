import { ZmodAdd } from "../examples";
import { makeSubgroup } from "../SubgroupOps";
import { secondIsomorphism } from "../SecondIso";

describe("Second Isomorphism Theorem on Z6 (abelian, so all normal)", () => {
  test("A = ⟨2⟩, N = ⟨3⟩ in Z6", () => {
    const Z6 = ZmodAdd(6);
    const A = makeSubgroup(Z6, [0,2,4], "⟨2⟩");
    const N = makeSubgroup(Z6, [0,3],   "⟨3⟩");

    const res = secondIsomorphism(Z6, A, N);

    // Sizes: A/(A∩N) has 3 elements; (AN)/N has 3 elements too.
    expect(res.iso.source.elems.length).toBe(3);
    expect(res.iso.target.elems.length).toBe(3);
    expect(res.iso.leftInverse).toBe(true);
    expect(res.iso.rightInverse).toBe(true);
  });
});