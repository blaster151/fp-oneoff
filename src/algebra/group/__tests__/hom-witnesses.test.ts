import { describe, it, expect } from "vitest";
import { Cyclic, Product } from "../Group";
import { hom, analyzeHom } from "../Hom";

describe("Group homomorphism witnesses (mono/epi/iso)", () => {
  const C2 = Cyclic(2);
  const C4 = Cyclic(4);
  const C5 = Cyclic(5);
  const C2xC2 = Product(C2, C2);

  test("isomorphism: C2 ≅ {+1,-1} under multiplication (via table match with C2)", () => {
    // we simply produce the identity table C2 -> C2; it's an iso
    const f = hom(C2, C2, x => x, "id");
    expect(f.witnesses?.isHom).toBe(true);
    expect(f.witnesses?.isIso).toBe(true);
    expect(f.witnesses?.leftInverse).toBeTruthy();
    expect(f.witnesses?.rightInverse).toBeTruthy();
  });

  test("automorphisms of C5: x ↦ kx (mod 5) with gcd(k,5)=1 are isos", () => {
    const ks = [1,2,3,4];
    for (const k of ks) {
      const f = hom(C5, C5, x => (k * x) % 5, `k=${k}`);
      expect(f.witnesses?.isIso).toBe(true);
    }
  });

  test("mono but not epi: inclusion C2 → C4 sending 1↦2 (injective; not surjective)", () => {
    const inc = hom(C2, C4, x => (2 * x) % 4, "incl");
    expect(inc.witnesses?.isHom).toBe(true);
    expect(inc.witnesses?.isMono).toBe(true);
    expect(inc.witnesses?.isEpi).toBe(false);
    expect(inc.witnesses?.isIso).toBe(false);
  });

  test("epi but not mono: quotient C4 → C2 (mod 2)", () => {
    const q = hom(C4, C2, x => x % 2, "quot");
    expect(q.witnesses?.isHom).toBe(true);
    expect(q.witnesses?.isEpi).toBe(true);
    expect(q.witnesses?.isMono).toBe(false);
    expect(q.witnesses?.isIso).toBe(false);
  });

  test("C2×C2 ≅ Klein four via identity; sanity check iso detection", () => {
    const id = hom(C2xC2, C2xC2, ([a,b]) => [a,b], "id");
    expect(id.witnesses?.isIso).toBe(true);
  });

  test("image subgroup materialization: C4 → C2 (mod 2)", () => {
    const f = hom(C4, C2, x => x % 2, "mod2");
    expect(f.witnesses?.imageSubgroup).toBeDefined();
    expect(f.witnesses?.imageSubgroup?.elems).toEqual([0, 1]);
    expect(f.witnesses?.imageSubgroup?.name).toBe("im(mod2)");
    expect(f.witnesses?.imageSubgroup?.id).toBe(0);
  });

  test("image subgroup for isomorphism: C2 → C2 identity", () => {
    const f = hom(C2, C2, x => x, "id");
    expect(f.witnesses?.imageSubgroup).toBeDefined();
    expect(f.witnesses?.imageSubgroup?.elems).toEqual([0, 1]);
    expect(f.witnesses?.imageSubgroup?.name).toBe("im(id)");
  });

  test("image subgroup for injection: C2 → C4", () => {
    const f = hom(C2, C4, x => (2 * x) % 4, "incl");
    expect(f.witnesses?.imageSubgroup).toBeDefined();
    expect(f.witnesses?.imageSubgroup?.elems).toEqual([0, 2]);
    expect(f.witnesses?.imageSubgroup?.name).toBe("im(incl)");
  });

  test("kernel subgroup materialization: C4 → C2 (mod 2)", () => {
    const f = hom(C4, C2, x => x % 2, "mod2");
    expect(f.witnesses?.kernelSubgroup).toBeDefined();
    expect(f.witnesses?.kernelSubgroup?.elems).toEqual([0, 2]);
    expect(f.witnesses?.kernelSubgroup?.name).toBe("ker(mod2)");
    expect(f.witnesses?.kernelSubgroup?.id).toBe(0);
  });

  test("kernel subgroup for isomorphism: C2 → C2 identity", () => {
    const f = hom(C2, C2, x => x, "id");
    expect(f.witnesses?.kernelSubgroup).toBeDefined();
    expect(f.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    expect(f.witnesses?.kernelSubgroup?.name).toBe("ker(id)");
  });

  test("kernel subgroup for injection: C2 → C4", () => {
    const f = hom(C2, C4, x => (2 * x) % 4, "incl");
    expect(f.witnesses?.kernelSubgroup).toBeDefined();
    expect(f.witnesses?.kernelSubgroup?.elems).toEqual([0]);
    expect(f.witnesses?.kernelSubgroup?.name).toBe("ker(incl)");
  });

  test("kernel subgroup for trivial homomorphism", () => {
    const f = hom(C4, C2, _x => 0, "trivial");
    expect(f.witnesses?.kernelSubgroup).toBeDefined();
    expect(f.witnesses?.kernelSubgroup?.elems).toEqual([0, 1, 2, 3]);
    expect(f.witnesses?.kernelSubgroup?.name).toBe("ker(trivial)");
  });
});