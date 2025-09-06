import { strict as A } from "assert";
import { imageSubgroup } from "../Image";
import { kernelNormalSubgroup } from "../Kernel";
import { groupHom } from "../Hom";
import { analyzeGroupHom } from "../analyzeHom";
import { Cyclic } from "../Group";

describe("Image and Kernel Helpers (Simple)", () => {
  it("image subgroup contains all images", () => {
    const Z8 = Cyclic(8);
    const Z4 = Cyclic(4);
    
    // Create homomorphism using existing infrastructure
    const f = analyzeGroupHom(groupHom(Z8, Z4, x => x % 4, "mod4"));
    
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
    const Z8 = Cyclic(8);
    const Z4 = Cyclic(4);
    
    // Create homomorphism using existing infrastructure
    const f = analyzeGroupHom(groupHom(Z8, Z4, x => x % 4, "mod4"));
    
    const eqH = (a: number, b: number) => (a % 4) === (b % 4);
    const ker = kernelNormalSubgroup(f, eqH);
    
    // Kernel should contain {0,4} (multiples of 4 in Z8)
    A.equal(ker.elems.length, 2);
    A.ok(ker.elems.includes(0));
    A.ok(ker.elems.includes(4));
  });
});