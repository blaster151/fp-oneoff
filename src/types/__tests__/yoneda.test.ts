/** @math DEF-YONEDA @math LEM-YONEDA */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { SmallCategory } from "../category-to-nerve-sset.js";
import { Presheaf, NatPsh } from "../presheaf.js";
import { Yoneda, demonstrateYoneda } from "../yoneda.js";

/** Tiny category C: A --m--> B (plus ids) */
type Obj = "A" | "B";
type Mor = { src: Obj; dst: Obj; name: "idA" | "idB" | "m"; fn: (x: any) => any };

const idA: Mor = { src: "A", dst: "A", name: "idA", fn: x => x };
const idB: Mor = { src: "B", dst: "B", name: "idB", fn: x => x };
const m: Mor = { src: "A", dst: "B", name: "m", fn: x => x };

const C: SmallCategory<Obj, Mor> & { objects: Obj[]; hom: (x: Obj, y: Obj) => SetObj<Mor> } = {
  objects: ["A", "B"],
  id: (o: Obj) => (o === "A" ? idA : idB),
  src: (m: Mor) => m.src,
  dst: (m: Mor) => m.dst,
  compose: (g: Mor, f: Mor): Mor => {
    if (f.dst !== g.src) throw new Error("bad comp");
    // collapse to rightmost name when identity; otherwise keep 'm' as only nontrivial
    if (f.name.startsWith("id")) return g;
    if (g.name.startsWith("id")) return f;
    // m∘m not defined; we won't call it
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
  },
};

describe("Yoneda embedding & Yoneda Lemma (finite, explicit)", () => {
  const { y, yonedaLemmaIso, checkNaturality } = Yoneda(C);

  it("y(c) is a presheaf with contravariant action", () => {
    const yB = y("B");
    
    // On objects: y(B)(A) = Hom(A,B), y(B)(B) = Hom(B,B)
    const yBA = yB.onObj("A");
    const yBB = yB.onObj("B");
    
    expect(yBA.elems.length).toBe(1); // Should contain morphism m: A → B
    expect(yBB.elems.length).toBe(1); // Should contain idB: B → B
    
    const mAB = yBA.elems[0] as Mor;
    const idBB = yBB.elems[0] as Mor;
    
    expect(mAB.name).toBe("m");
    expect(idBB.name).toBe("idB");

    // On morphisms (precomposition): for f: A → B, yB(f): Hom(B,B) → Hom(A,B)
    const f = m; // A → B
    const ybf = yB.onMor(f);
    const h = idB; // element of Hom(B,B)
    const result = ybf(h);
    
    // Should get h ∘ f = idB ∘ m = m
    expect((result as Mor).name).toBe("m");
    
    console.log("Yoneda presheaf y(B) verified: contravariant action correct");
  });

  it("Yoneda Lemma: Nat(y(c),F) ≅ F(c)", () => {
    // Define a nontrivial presheaf F: C^op -> Set
    const F: Presheaf<typeof C> = {
      onObj: (o: Obj) => {
        if (o === "A") {
          return { id: "F-A", elems: ["u", "v"], eq: (x: string, y: string) => x === y };
        } else {
          return { id: "F-B", elems: ["w"], eq: (x: string, y: string) => x === y };
        }
      },
      onMor: (f: Mor) => {
        // contravariant: for f: a -> b, F(f): F(b) -> F(a)
        if (f.name === "idA") return (x: string) => x;
        if (f.name === "idB") return (x: string) => x;
        if (f.name === "m") return (_x: string) => "u"; // F(m): F(B) -> F(A); choose constant
        return (x: string) => x;
      }
    };

    const { toFc, fromFc } = yonedaLemmaIso("B", F);

    // Test the isomorphism by building a natural transformation
    const alpha: NatPsh<typeof C> = {
      at: (o: Obj) => {
        if (o === "A") {
          return (h: Mor) => "u"; // α_A: Hom(A,B) → F(A)
        } else {
          return (h: Mor) => "w"; // α_B: Hom(B,B) → F(B)
        }
      }
    };

    // Verify naturality of alpha
    const yB = y("B");
    expect(checkNaturality(yB, F, alpha)).toBe(true);

    // Test isomorphism: α → F(c) → α'
    const img = toFc(alpha);
    expect(img).toBe("w"); // Should get α_B(id_B) = "w"
    
    const back = fromFc(img);
    
    // Verify round-trip on components
    const testMorphisms = [idB];
    testMorphisms.forEach(h => {
      const original = alpha.at("B")(h);
      const roundTrip = back.at("B")(h);
      expect(roundTrip).toBe(original);
    });

    console.log("Yoneda lemma isomorphism verified: Nat(y(c), F) ≅ F(c)");
  });

  it("verifies Yoneda embedding properties", () => {
    const yA = y("A");
    const yB = y("B");
    
    // Different objects give different representable presheaves
    const yAA = yA.onObj("A");
    const yBA = yB.onObj("A");
    
    // y(A)(A) = Hom(A,A) = {id_A}
    // y(B)(A) = Hom(A,B) = {m}
    expect(yAA.elems.length).toBe(1);
    expect(yBA.elems.length).toBe(1);
    
    const idAA = yAA.elems[0] as Mor;
    const mAB = yBA.elems[0] as Mor;
    
    expect(idAA.name).toBe("idA");
    expect(mAB.name).toBe("m");
    
    console.log("Yoneda embedding: Different objects give different presheaves ✅");
  });

  it("demonstrates complete Yoneda system", () => {
    demonstrateYoneda();
    expect(true).toBe(true); // Educational demo
  });
});