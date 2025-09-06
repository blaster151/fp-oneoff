import { ZmodAdd } from "../examples";
import { hom as groupHom } from "../../../structures/group/Hom.js";
import { analyzeGroupHom } from "../analyzeHom";

describe("kernel of a group hom", () => {
  const Z4 = ZmodAdd(4);
  const Z2 = ZmodAdd(2);

  test("mod 2 hom has kernel {0,2}", () => {
    const q = analyzeGroupHom(groupHom(Z4, Z2, x => x % 2, "mod2"));
    expect(q.witnesses?.kernelSubgroup?.elems.sort()).toEqual([0,2]);
    expect(q.witnesses?.kernelSubgroup?.name).toBe("ker(mod2)");
  });

  test("trivial hom has kernel all of Z4", () => {
    const t = analyzeGroupHom(groupHom(Z4, Z2, _x => 0, "trivial"));
    expect(t.witnesses?.kernelSubgroup?.elems.sort()).toEqual([0,1,2,3]);
    expect(t.witnesses?.kernelSubgroup?.name).toBe("ker(trivial)");
  });

  test("identity hom has kernel {0}", () => {
    const id = analyzeGroupHom(groupHom(Z4, Z4, x => x, "id"));
    expect(id.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    expect(id.witnesses?.kernelSubgroup?.name).toBe("ker(id)");
  });

  test("kernel subgroup is actually a subgroup", () => {
    const q = analyzeGroupHom(groupHom(Z4, Z2, x => x % 2, "mod2"));
    const ker = q.witnesses?.kernelSubgroup;
    
    // Check closure under operation
    for (const a of ker!.elems) {
      for (const b of ker!.elems) {
        const ab = ker!.op(a, b);
        expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, ab) : x === ab)).toBe(true);
      }
    }
    
    // Check identity is present (should be 0 for Z4)
    expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, 0) : x === 0)).toBe(true);
    
    // Check inverses are present
    for (const a of ker!.elems) {
      const invA = ker!.inv(a);
      expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, invA) : x === invA)).toBe(true);
    }
  });

  test("injectivity characterization: f is injective iff ker(f) = {e}", () => {
    // Identity homomorphism should be injective with trivial kernel
    const id = analyzeGroupHom(groupHom(Z2, Z2, x => x, "id"));
    expect(id.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    
    // Mod 2 homomorphism should not be injective with non-trivial kernel
    const q = analyzeGroupHom(groupHom(Z4, Z2, x => x % 2, "mod2"));
    expect(q.witnesses?.kernelSubgroup?.elems.length).toBeGreaterThan(1);
  });
});