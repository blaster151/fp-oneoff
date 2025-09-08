import { strict as A } from "assert";
import { hom } from "../Hom";
import { imageSubgroup } from "../Image";
import { kernelNormalSubgroup } from "../Kernel";
import { modHom, Zmod } from "../examples/cyclic";

describe("Image and Kernel Helpers", () => {
  it("image subgroup contains all images", () => {
    const { Z, Zn, qn } = modHom(4);
    const f = hom(Z, Zn, qn);
    
    const eqH = (a: number, b: number) => (a % 4) === (b % 4);
    const im = imageSubgroup(f, eqH);
    
    // Image should contain {0,1,2,3} (all elements of Z4)
    A.equal(im.elems.length, 4);
    
    // Check that all elements are in the image
    for (let i = 0; i < 4; i++) {
      A.ok(im.elems.some(x => eqH(x, i)));
    }
  });

  it("kernel normal subgroup contains multiples of 4", () => {
    const { Z, Zn, qn } = modHom(4);
    const f = hom(Z, Zn, qn);
    
    const eqH = (a: number, b: number) => (a % 4) === (b % 4);
    const ker = kernelNormalSubgroup(f, eqH);
    
    // Test on a finite window
    const testWindow = Array.from({ length: 13 }, (_, i) => i - 6);
    for (const g of testWindow) {
      const inKernel = ker.elems.some(x => x === g);
      const shouldBeInKernel = (g % 4) === 0;
      A.equal(inKernel, shouldBeInKernel);
    }
  });
});