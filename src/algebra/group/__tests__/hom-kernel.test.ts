import { Cyclic } from "../Group";
import { hom, analyzeHom } from "../Hom";

describe("kernel of a group hom", () => {
  const Z4 = Cyclic(4);
  const Z2 = Cyclic(2);

  test("mod 2 hom has kernel {0,2}", () => {
    const q = hom(Z4, Z2, x => x % 2, "mod2");
    expect(q.witnesses?.kernelSubgroup?.elems.sort()).toEqual([0,2]);
    expect(q.witnesses?.kernelSubgroup?.name).toBe("ker(mod2)");
  });

  test("trivial hom has kernel all of Z4", () => {
    const t = hom(Z4, Z2, _x => 0, "trivial");
    expect(t.witnesses?.kernelSubgroup?.elems.sort()).toEqual([0,1,2,3]);
    expect(t.witnesses?.kernelSubgroup?.name).toBe("ker(trivial)");
  });

  test("identity hom has kernel {0}", () => {
    const id = hom(Z4, Z4, x => x, "id");
    expect(id.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    expect(id.witnesses?.kernelSubgroup?.name).toBe("ker(id)");
  });

  test("kernel subgroup is actually a subgroup", () => {
    const q = hom(Z4, Z2, x => x % 2, "mod2");
    const ker = q.witnesses?.kernelSubgroup;
    
    // Check closure under operation
    for (const a of ker!.elems) {
      for (const b of ker!.elems) {
        const ab = ker!.op(a, b);
        expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, ab) : x === ab)).toBe(true);
      }
    }
    
    // Check identity is present
    expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, ker!.id) : x === ker!.id)).toBe(true);
    
    // Check inverses are present
    for (const a of ker!.elems) {
      const invA = ker!.inv(a);
      expect(ker!.elems.some(x => ker!.eq ? ker!.eq(x, invA) : x === invA)).toBe(true);
    }
  });

  test("injectivity characterization: f is injective iff ker(f) = {e}", () => {
    // Identity homomorphism should be injective with trivial kernel
    const id = hom(Z2, Z2, x => x, "id");
    expect(id.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    expect(id.witnesses?.isMono).toBe(true);
    
    // Mod 2 homomorphism should not be injective with non-trivial kernel
    const q = hom(Z4, Z2, x => x % 2, "mod2");
    expect(q.witnesses?.kernelSubgroup?.elems.length).toBeGreaterThan(1);
    expect(q.witnesses?.isMono).toBe(false);
  });
});