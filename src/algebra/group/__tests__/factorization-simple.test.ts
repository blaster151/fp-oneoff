import { strict as A } from "assert";
import { Eq } from "../../../types/eq.js";
import { groupHom } from "../Hom";
import { analyzeGroupHom } from "../analyzeHom";
import { ZmodAdd } from "../examples";

const eqZ4: Eq<number> = { eq: (a,b)=> (a%4)===(b%4) };

describe("Factorization with Eq (Simple)", () => {
  it("image and kernel helpers work with existing infrastructure", () => {
    const Z8 = ZmodAdd(8);
    const Z4 = ZmodAdd(4);
    
    // Create homomorphism using existing infrastructure
    const f = analyzeGroupHom(groupHom(Z8, Z4, x => x % 4, "mod4"));
    
    // Test image subgroup
    const img = f.witnesses?.imageSubgroup;
    A.ok(img);
    A.equal(img!.elems.length, 4);
    
    // Test kernel subgroup  
    const ker = f.witnesses?.kernelSubgroup;
    A.ok(ker);
    A.equal(ker!.elems.length, 2);
    A.ok(ker!.elems.includes(0));
    A.ok(ker!.elems.includes(4));
  });

  it("Eq abstraction works for equality checks", () => {
    const eq = eqZ4.eq;
    
    // Test that our Eq abstraction works
    A.ok(eq(0, 4));  // 0 ≡ 4 (mod 4)
    A.ok(eq(1, 5));  // 1 ≡ 5 (mod 4)
    A.ok(eq(2, 6));  // 2 ≡ 6 (mod 4)
    A.ok(eq(3, 7));  // 3 ≡ 7 (mod 4)
    
    A.ok(!eq(0, 1)); // 0 ≢ 1 (mod 4)
    A.ok(!eq(1, 2)); // 1 ≢ 2 (mod 4)
  });
});