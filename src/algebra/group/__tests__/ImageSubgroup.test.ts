import { describe, it, expect } from "vitest";
import { Cyclic, Product } from "../Group";
import { hom } from "../Hom";
import { imageSubgroup, verifyImageSubgroup, imageSize, isSurjective, makeSurjective } from "../ImageSubgroup";

describe("Image Subgroup (Theorem 6)", () => {
  const Z4 = Cyclic(4);
  const Z2 = Cyclic(2);
  const Z3 = Cyclic(3);
  const Z6 = Cyclic(6);

  test("image of identity homomorphism is the whole group", () => {
    const id = hom(Z4, Z4, x => x, "id");
    const img = imageSubgroup(id);
    
    expect(img.image.elems.length).toBe(4);
    expect(verifyImageSubgroup(img)).toBe(true);
    expect(isSurjective(id)).toBe(true);
  });

  test("image of mod 2 map Z4 → Z2", () => {
    const mod2 = hom(Z4, Z2, x => x % 2, "mod2");
    const img = imageSubgroup(mod2);
    
    // The image should be all of Z2 since mod2 is surjective
    expect(img.image.elems.length).toBe(2);
    expect(img.image.elems).toEqual([0, 1]);
    expect(verifyImageSubgroup(img)).toBe(true);
    expect(isSurjective(mod2)).toBe(true);
  });

  test("image of inclusion Z2 → Z4", () => {
    // Proper inclusion: 0 → 0, 1 → 2 (so that 1+1=0 in Z2 maps to 2+2=0 in Z4)
    const incl = hom(Z2, Z4, x => x === 0 ? 0 : 2, "incl");
    const img = imageSubgroup(incl);
    
    // The image should be {0, 2} in Z4
    expect(img.image.elems.length).toBe(2);
    expect(img.image.elems).toEqual([0, 2]);
    expect(verifyImageSubgroup(img)).toBe(true);
    expect(isSurjective(incl)).toBe(false);
  });

  test("image of constant map (trivial subgroup)", () => {
    const const0 = hom(Z4, Z4, _x => 0, "const0");
    const img = imageSubgroup(const0);
    
    // The image should be the trivial subgroup {0}
    expect(img.image.elems.length).toBe(1);
    expect(img.image.elems).toEqual([0]);
    expect(verifyImageSubgroup(img)).toBe(true);
    expect(isSurjective(const0)).toBe(false);
  });

  test("image of product group projection", () => {
    const Z2xZ3 = Product(Z2, Z3);
    const proj1 = hom(Z2xZ3, Z2, ([a, _b]) => a, "π₁");
    const img = imageSubgroup(proj1);
    
    // The image should be all of Z2
    expect(img.image.elems.length).toBe(2);
    expect(img.image.elems).toEqual([0, 1]);
    expect(verifyImageSubgroup(img)).toBe(true);
    expect(isSurjective(proj1)).toBe(true);
  });

  test("makeSurjective creates surjective homomorphism", () => {
    const incl = hom(Z2, Z4, x => x === 0 ? 0 : 2, "incl");
    const surj = makeSurjective(incl);
    
    expect(surj.target.elems.length).toBe(2);
    expect(isSurjective(surj)).toBe(true);
    expect(verifyImageSubgroup(imageSubgroup(surj))).toBe(true);
  });

  test("image subgroup properties", () => {
    const f = hom(Z6, Z3, x => x % 3, "mod3");
    const img = imageSubgroup(f);
    
    // Check that the image is a valid subgroup
    expect(verifyImageSubgroup(img)).toBe(true);
    
    // Check that inclusion is a homomorphism
    expect(img.inclusion.source).toBe(img.image);
    expect(img.inclusion.target).toBe(img.target);
    
    // Check that the image contains the identity
    const eqH = img.target.eq ?? ((x, y) => Object.is(x, y));
    expect(img.image.elems.some(a => eqH(a, img.target.id))).toBe(true);
  });

  test("image size calculation", () => {
    const f1 = hom(Z4, Z2, x => x % 2, "mod2");
    const f2 = hom(Z2, Z4, x => x, "incl");
    const f3 = hom(Z4, Z4, _x => 0, "const0");
    
    expect(imageSize(f1)).toBe(2);
    expect(imageSize(f2)).toBe(2);
    expect(imageSize(f3)).toBe(1);
  });
});