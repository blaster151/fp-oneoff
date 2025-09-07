import { Zmod, groupHom } from "../../helpers/groups";
import { kernel } from "../../../src/algebra/group/Kernels";

describe("Kernel as equalizer in Grp", () => {
  it("categorical kernel property", () => {
    const G = Zmod(6), H = Zmod(3);
    const f = groupHom(G, H, x => x % 3);
    const { K, include, isKernel } = kernel(f);

    // Kernel should contain elements that map to identity in H
    expect(K.elems).toContain(0);
    expect(K.elems).toContain(3);
    expect(K.elems?.length).toBe(2);

    // check inclusion: f∘i maps kernel elements to identity
    if (K.elems) {
      for (const a of K.elems) {
        expect(f.run(include.run(a))).toBe(0);
      }
    }

    // universal property: any g:K→G with f∘g = const_e factors uniquely through K
    const g = include; // trivial example where g is the inclusion itself
    const { mediating, unique } = isKernel(K, g);
    
    if (!mediating || !unique) {
      throw new Error("kernel factoring failed");
    }
    expect(unique(mediating)).toBe(true);
  });

  it("kernel preserves group structure", () => {
    const G = Zmod(4), H = Zmod(2);
    const f = groupHom(G, H, x => x % 2);
    const { K, include } = kernel(f);

    // Kernel should be {0, 2} - the even elements
    expect(K.elems).toContain(0);
    expect(K.elems).toContain(2);
    expect(K.elems?.length).toBe(2);

    // Check that kernel is closed under group operation
    if (K.elems) {
      for (const a of K.elems) {
        for (const b of K.elems) {
          const product = K.op(a, b);
          expect(K.elems.includes(product)).toBe(true);
        }
      }
    }

    // Check inclusion is a homomorphism
    expect(include.preservesOp(0, 2)).toBe(true);
    expect(include.preservesId()).toBe(true);
  });
});