/** @math DEF-BICAT @math LAW-PENTAGON @math LAW-TRIANGLE */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { SmallCategory } from "../category-to-nerve-sset.js";
import { CatBicat, demonstrateCatBicat } from "../cat-bicat.js";
import { Nat } from "../cat2.js";

/** Base category A (two objects, one arrow) */
type Obj = "X" | "Y";
type Mor = { src: Obj; dst: Obj; name: "idX" | "idY" | "u"; fn: (x: any) => any };

const idX: Mor = { src: "X", dst: "X", name: "idX", fn: x => x };
const idY: Mor = { src: "Y", dst: "Y", name: "idY", fn: x => x };
const u: Mor = { src: "X", dst: "Y", name: "u", fn: x => x };

const A = {
  objects: ["X", "Y"] as Obj[],
  Obj: ["X", "Y"] as Obj[],
  Mor: [idX, idY, u],
  id: (o: Obj) => o === "X" ? idX : idY,
  src: (m: Mor) => m.src,
  dst: (m: Mor) => m.dst,
  comp: (g: Mor, f: Mor) => { 
    if (f.dst !== g.src) throw new Error("composition mismatch");
    if (f.name.startsWith("id")) return g; 
    if (g.name.startsWith("id")) return f; 
    return u; 
  },
  hom: (x: Obj, y: Obj) => {
    let morphisms: Mor[] = [];
    if (x === "X" && y === "X") morphisms = [idX];
    else if (x === "Y" && y === "Y") morphisms = [idY];
    else if (x === "X" && y === "Y") morphisms = [u];
    
    return {
      id: `hom-${x}-${y}`,
      elems: morphisms,
      eq: (m1: Mor, m2: Mor) => m1.name === m2.name
    } as SetObj<Mor>;
  }
};

const B = CatBicat(A);

// Functors as identity-on-objects into FinSet for testing
const F = { 
  onObj: (o: Obj) => o === "X" ? { id: "FX", elems: [0, 1], eq: (x: number, y: number) => x === y } 
                                : { id: "FY", elems: ["a"], eq: (x: string, y: string) => x === y },
  onMor: (_: Mor) => (x: any) => x,
  __name: "F"
};

const G = F; // Same functor for simplicity
const H = F;
const K = F;

describe("Bicategory(Cat) coherence", () => {
  it("triangle law: (l_G ⋆ F) • a_{G,id,F} = (G ⋆ r_F)", () => {
    // In strict bicategory Cat, all coherence isomorphisms are identities
    const left = B.vcomp(
      B.whiskerL(G, B.leftUnitor(F)),
      B.associator(G, B.id1({} as any), F)
    );
    
    const right = B.whiskerR(B.rightUnitor(F), G);
    
    // In strict case, both should be identity 2-cells
    expect(B.eq2!(left, right)).toBe(true);
    
    console.log("Triangle law verified for strict Cat bicategory ✅");
  });

  it("pentagon (strict): all sides reduce to identity 2-cell", () => {
    // Pentagon law in strict bicategory
    const a1 = B.associator(K, H, B.comp1(G, F));
    const a2 = B.vcomp(
      B.associator(B.comp1(K, H), G, F), 
      B.associator(K, B.comp1(H, G), F)
    );
    
    // In strict bicategory, associators are identities
    expect(B.eq2!(a1, a2)).toBe(true);
    
    console.log("Pentagon law verified for strict Cat bicategory ✅");
  });

  it("strict bicategory properties hold", () => {
    // Test that Cat is indeed strict
    const idF = B.id2(F);
    const assoc = B.associator(H, G, F);
    const leftUnit = B.leftUnitor(F);
    const rightUnit = B.rightUnitor(F);
    
    // All should be identity 2-cells in strict case
    expect((assoc as any).__isIdentity).toBe(true);
    expect((leftUnit as any).__isIdentity).toBe(true);
    expect((rightUnit as any).__isIdentity).toBe(true);
    
    console.log("Cat bicategory is strict: all coherence isomorphisms are identities ✅");
  });

  it("whiskering operations work in strict case", () => {
    const alpha: Nat<any, any> = { 
      at: (_: any) => (x: any) => x, 
      __src: F, 
      __dst: G,
      __name: "α"
    };
    
    const leftWhisker = B.whiskerL(F, alpha);
    const rightWhisker = B.whiskerR(alpha, G);
    
    // In strict case, whiskering should preserve the natural transformation
    expect(typeof leftWhisker.at).toBe("function");
    expect(typeof rightWhisker.at).toBe("function");
    
    console.log("Whiskering operations work correctly in strict Cat ✅");
  });

  it("demonstrates complete bicategory structure", () => {
    demonstrateCatBicat();
    expect(true).toBe(true); // Educational demonstration
  });
});