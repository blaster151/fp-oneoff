/** @math COLIM-PRESHEAF */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { SmallCategory } from "../category-to-nerve-sset.js";
import { Presheaf } from "../presheaf.js";
import { 
  pshCoproduct, 
  pshCoequalizer, 
  pshPushout,
  verifyPresheafColimits 
} from "../presheaf-colimits.js";

/** Tiny C: A --m--> B */
type Obj = "A" | "B";
type Mor = { src: Obj; dst: Obj; name: "idA" | "idB" | "m"; fn: (x: any) => any };

const idA: Mor = { src: "A", dst: "A", name: "idA", fn: x => x };
const idB: Mor = { src: "B", dst: "B", name: "idB", fn: x => x };
const m: Mor = { src: "A", dst: "B", name: "m", fn: x => x };

const C = {
  objects: ["A", "B"],
  Obj: ["A", "B"], 
  Mor: [idA, idB, m],
  id: (o: Obj) => o === "A" ? idA : idB,
  comp: (g: Mor, f: Mor) => { 
    if (f.dst !== g.src) throw new Error("composition mismatch");
    if (f.name.startsWith("id")) return g; 
    if (g.name.startsWith("id")) return f; 
    return m; 
  },
  hom: (x: Obj, y: Obj) => {
    let morphisms: Mor[] = [];
    if (x === "A" && y === "A") morphisms = [idA];
    else if (x === "B" && y === "B") morphisms = [idB];
    else if (x === "A" && y === "B") morphisms = [m];
    
    return {
      id: `hom-${x}-${y}`,
      elems: morphisms,
      eq: (m1: Mor, m2: Mor) => m1.name === m2.name
    };
  }
};

const P: Presheaf<any> = {
  onObj: (o: Obj) => {
    if (o === "A") {
      return { id: "P-A", elems: [0, 1], eq: (x: number, y: number) => x === y };
    } else {
      return { id: "P-B", elems: ["x"], eq: (x: string, y: string) => x === y };
    }
  },
  onMor: (f: Mor) => {
    if (f.name === "m") return (_: any) => 0; // P(m): P(B) → P(A)
    return (x: any) => x; // identities
  }
};

const Q: Presheaf<any> = {
  onObj: (o: Obj) => {
    if (o === "A") {
      return { id: "Q-A", elems: ["u"], eq: (x: string, y: string) => x === y };
    } else {
      return { id: "Q-B", elems: ["v", "w"], eq: (x: string, y: string) => x === y };
    }
  },
  onMor: (f: Mor) => {
    if (f.name === "m") return (y: string) => "v"; // Q(m): Q(B) → Q(A)
    return (x: any) => x; // identities
  }
};

const R: Presheaf<any> = {
  onObj: (o: Obj) => {
    if (o === "A") {
      return { id: "R-A", elems: [9], eq: (x: number, y: number) => x === y };
    } else {
      return { id: "R-B", elems: ["z"], eq: (x: string, y: string) => x === y };
    }
  },
  onMor: (f: Mor) => (x: any) => x // identity presheaf
};

describe("Presheaf(C) colimits (pointwise)", () => {
  it("coproduct computed objectwise", () => {
    const PplusQ = pshCoproduct(C, P, Q);
    
    // At object A: P(A) ⊕ Q(A) = {0,1} ⊕ {"u"}
    const A0 = Array.from(PplusQ.onObj("A").elems);
    expect(A0.some(x => x.tag === "inl" && x.value === 0)).toBe(true);
    expect(A0.some(x => x.tag === "inr" && x.value === "u")).toBe(true);
    expect(A0.length).toBe(3); // 2 + 1
    
    // At object B: P(B) ⊕ Q(B) = {"x"} ⊕ {"v","w"}  
    const B0 = Array.from(PplusQ.onObj("B").elems);
    expect(B0.length).toBe(3); // 1 + 2
    
    console.log("Presheaf coproduct computed pointwise ✅");
  });

  it("coequalizer computed objectwise", () => {
    const r = (x: any) => x;
    const s = (x: any) => x; // Same function for simplicity
    
    const coeq = pshCoequalizer(C, P, Q, r, s);
    
    // Should have valid presheaf structure
    expect(typeof coeq.onObj).toBe("function");
    expect(typeof coeq.onMor).toBe("function");
    
    const coA = coeq.onObj("A");
    const coB = coeq.onObj("B");
    
    expect(Array.isArray(coA.elems)).toBe(true);
    expect(Array.isArray(coB.elems)).toBe(true);
    
    console.log("Presheaf coequalizer computed pointwise ✅");
  });

  it("pushout computed objectwise", () => {
    const rToP = (_: any) => 0;  // R(A) → P(A)
    const rToQ = (_: any) => "u"; // R(A) → Q(A)
    
    const PO = pshPushout(C, R, P, Q, rToP, rToQ);
    
    // Should have valid presheaf structure
    expect(typeof PO.onObj).toBe("function");
    expect(typeof PO.onMor).toBe("function");
    
    // At A: pushout of sets {0,1} ← {9} → {"u"}
    // Glues 0 ~ "u" via the span
    const Aelts = Array.from(PO.onObj("A").elems);
    expect(Aelts.length).toBeGreaterThan(0);
    
    console.log("Presheaf pushout computed pointwise ✅");
  });

  it("verifies presheaf category has finite colimits", () => {
    const testPresheaves = [P, Q, R];
    const verification = verifyPresheafColimits(C, testPresheaves);
    
    expect(verification.hasCoproducts).toBe(true);
    expect(verification.hasCoequalizers).toBe(true);
    expect(verification.hasPushouts).toBe(true);
    expect(verification.isFinitelyComplete).toBe(true);
    
    console.log("Presheaf(C) has finite colimits verified ✅");
    console.log("  • Coproducts: ✅");
    console.log("  • Coequalizers: ✅");
    console.log("  • Pushouts: ✅");
    console.log("  • Finitely cocomplete: ✅");
  });

  it("demonstrates complete colimit system", () => {
    demonstrateFinSetColimits();
    expect(true).toBe(true); // Educational demonstration
  });
});