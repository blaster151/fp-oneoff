import { ZmodAdd } from "../examples";
import { makeSubgroup } from "../SubgroupOps";
import { inclusion as inclusionHom } from "../../../structures/group/Isomorphism.js";
import { analyzeGroupHom } from "../analyzeHom";

describe("Theorem 7: Subgroups as Images of Homomorphisms", () => {
  test("Inclusion hom image = subgroup", () => {
    const Z6 = ZmodAdd(6);
    const S = makeSubgroup(Z6, [0,3], "⟨3⟩");
    const incl = inclusionHom(Z6, S);
    const analyzed = analyzeGroupHom(incl);
    expect(analyzed.witnesses!.imageSubgroup!.elems.sort()).toEqual(S.elems.sort());
  });

  test("Multiple subgroups as inclusion images", () => {
    const Z8 = ZmodAdd(8);
    
    // Test ⟨2⟩ = {0,2,4,6}
    const S1 = makeSubgroup(Z8, [0,2,4,6], "⟨2⟩");
    const incl1 = inclusionHom(Z8, S1);
    const analyzed1 = analyzeGroupHom(incl1);
    expect(analyzed1.witnesses!.imageSubgroup!.elems.sort()).toEqual(S1.elems.sort());
    
    // Test ⟨4⟩ = {0,4}
    const S2 = makeSubgroup(Z8, [0,4], "⟨4⟩");
    const incl2 = inclusionHom(Z8, S2);
    const analyzed2 = analyzeGroupHom(incl2);
    expect(analyzed2.witnesses!.imageSubgroup!.elems.sort()).toEqual(S2.elems.sort());
  });

  test("Trivial subgroup as inclusion image", () => {
    const Z4 = ZmodAdd(4);
    const trivial = makeSubgroup(Z4, [0], "{0}");
    const incl = inclusionHom(Z4, trivial);
    const analyzed = analyzeGroupHom(incl);
    expect(analyzed.witnesses!.imageSubgroup!.elems).toEqual([0]);
  });

  test("Full group as inclusion image", () => {
    const Z3 = ZmodAdd(3);
    const full = makeSubgroup(Z3, [0,1,2], "Z3");
    const incl = inclusionHom(Z3, full);
    const analyzed = analyzeGroupHom(incl);
    expect(analyzed.witnesses!.imageSubgroup!.elems.sort()).toEqual(full.elems.sort());
  });
});