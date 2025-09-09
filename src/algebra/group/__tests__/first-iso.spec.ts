import { ZmodAdd } from "../examples";
import { groupHom } from "../HomUtils";
import { analyzeGroupHom } from "../analyzeHom";
import { firstIsomorphism } from "../FirstIso";

describe("First Isomorphism Theorem (finite examples)", () => {
  test("Z4 --mod2--> Z2  ⇒  Z4/ker ≅ im ≅ Z2", () => {
    const Z4 = ZmodAdd(4);
    const Z2 = ZmodAdd(2);
    const f = analyzeGroupHom(groupHom(Z4, Z2, x => x % 2, "mod2"));

    const iso = firstIsomorphism(f);
    expect(iso.leftInverse).toBe(true);
    expect(iso.rightInverse).toBe(true);
    // sizes: |Z4/ker| = |im f| = 2
    expect(iso.source.elems.length).toBe(2);
    expect(iso.target.elems.length).toBe(2);
  });

  test("Z6 --mod3--> Z3  ⇒  Z6/ker ≅ im ≅ Z3", () => {
    const Z6 = ZmodAdd(6);
    const Z3 = ZmodAdd(3);
    const f = analyzeGroupHom(groupHom(Z6, Z3, x => x % 3, "mod3"));

    const iso = firstIsomorphism(f);
    expect(iso.leftInverse).toBe(true);
    expect(iso.rightInverse).toBe(true);
    expect(iso.source.elems.length).toBe(3);
    expect(iso.target.elems.length).toBe(3);
  });
});