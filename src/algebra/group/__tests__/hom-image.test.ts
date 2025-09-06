import { Cyclic } from "../Group";
import { hom, analyzeHom } from "../Hom";

describe("image subgroup from group hom", () => {
  const Z4 = Cyclic(4);
  const Z2 = Cyclic(2);

  test("mod 2 hom has image subgroup {0,1} in Z2", () => {
    const q = hom(Z4, Z2, x => x % 2, "mod2");
    const img = q.witnesses?.imageSubgroup;
    expect(img?.elems.sort()).toEqual([0,1]);
    expect(img?.name).toBe("im(mod2)");
  });

  test("trivial hom has image {0}", () => {
    const t = hom(Z4, Z2, _x => 0, "trivial");
    expect(t.witnesses?.imageSubgroup?.elems).toEqual([0]);
    expect(t.witnesses?.imageSubgroup?.name).toBe("im(trivial)");
  });

  test("identity hom has full image", () => {
    const id = hom(Z2, Z2, x => x, "id");
    expect(id.witnesses?.imageSubgroup?.elems.sort()).toEqual([0,1]);
    expect(id.witnesses?.imageSubgroup?.name).toBe("im(id)");
  });

  test("image subgroup is actually a subgroup", () => {
    const q = hom(Z4, Z2, x => x % 2, "mod2");
    const img = q.witnesses?.imageSubgroup;
    
    // Check closure under operation
    for (const a of img!.elems) {
      for (const b of img!.elems) {
        const ab = img!.op(a, b);
        expect(img!.elems.some(x => img!.eq ? img!.eq(x, ab) : x === ab)).toBe(true);
      }
    }
    
    // Check identity is present
    expect(img!.elems.some(x => img!.eq ? img!.eq(x, img!.id) : x === img!.id)).toBe(true);
    
    // Check inverses are present
    for (const a of img!.elems) {
      const invA = img!.inv(a);
      expect(img!.elems.some(x => img!.eq ? img!.eq(x, invA) : x === invA)).toBe(true);
    }
  });
});