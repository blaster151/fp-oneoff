/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// equivalence-example.ts
import {
  SmallCategory, Functor, NatIso, AdjointEquivalence,
  composeFunctors, checkNatIso, checkAdjointEquivalence
} from "../types/catkit-equivalence";

// ---------- A small groupoid A: two isomorphic objects a0 <-> a1 ----------
type AObj = "a0" | "a1";
type AM   = { tag:"id", o:AObj } | { tag:"s" } | { tag:"t" }; // s:a0->a1, t:a1->a0, with s∘t=id1 and t∘s=id0

const A: SmallCategory<AObj,AM> & { objects:AObj[]; morphisms:AM[] } = {
  objects: ["a0","a1"],
  morphisms: [{tag:"id",o:"a0"},{tag:"id",o:"a1"},{tag:"s"},{tag:"t"}],
  id: (o)=>({tag:"id",o}),
  src: (m)=> m.tag==="id" ? m.o : (m.tag==="s" ? "a0" : "a1"),
  dst: (m)=> m.tag==="id" ? m.o : (m.tag==="s" ? "a1" : "a0"),
  comp: (g,f) => {
    // type check
    if (A.dst(f)!==A.src(g)) throw new Error("A: bad comp");
    // identities
    if (f.tag==="id") return g;
    if (g.tag==="id") return f;
    // s∘t=id1, t∘s=id0, others undefined by typing already handled
    if (g.tag==="s" && f.tag==="t") return {tag:"id", o:"a1"};
    if (g.tag==="t" && f.tag==="s") return {tag:"id", o:"a0"};
    throw new Error("A: invalid non-identity composition");
  }
};

// ---------- Another copy B with renamed generators ----------
type BObj = "bX" | "bY";
type BM   = { tag:"idX" } | { tag:"idY" } | { tag:"sigma" } | { tag:"tau" };

const B: SmallCategory<BObj,BM> & { objects:BObj[]; morphisms:BM[] } = {
  objects: ["bX","bY"],
  morphisms: [{tag:"idX"},{tag:"idY"},{tag:"sigma"},{tag:"tau"}],
  id: (o)=> o==="bX" ? {tag:"idX"} : {tag:"idY"},
  src: (m)=> m.tag==="idX" ? "bX" : (m.tag==="idY" ? "bY" : (m.tag==="sigma" ? "bX" : "bY")),
  dst: (m)=> m.tag==="idX" ? "bX" : (m.tag==="idY" ? "bY" : (m.tag==="sigma" ? "bY" : "bX")),
  comp: (g,f) => {
    if (B.dst(f)!==B.src(g)) throw new Error("B: bad comp");
    if (f.tag==="idX"||f.tag==="idY") return g;
    if (g.tag==="idX"||g.tag==="idY") return f;
    if (g.tag==="sigma" && f.tag==="tau") return {tag:"idY"};
    if (g.tag==="tau"   && f.tag==="sigma") return {tag:"idX"};
    throw new Error("B: invalid non-identity composition");
  }
};

// ---------- Equivalence data: F:A->B and G:B->A are strict inverses on the nose ----------
const F: Functor<AObj,AM,BObj,BM> = {
  Fobj: (a)=> a==="a0" ? "bX" : "bY",
  Fmor: (m)=> m.tag==="id" ? (m.o==="a0" ? {tag:"idX"} : {tag:"idY"}) : (m.tag==="s" ? {tag:"sigma"} : {tag:"tau"})
};
const G: Functor<BObj,BM,AObj,AM> = {
  Fobj: (b)=> b==="bX" ? "a0" : "a1",
  Fmor: (m)=> m.tag==="idX" ? {tag:"id",o:"a0"} :
             m.tag==="idY" ? {tag:"id",o:"a1"} :
             m.tag==="sigma" ? {tag:"s"} : {tag:"t"}
};

// Because G∘F = Id_A and F∘G = Id_B strictly, we can take unit/counit components = identities.
const GF = composeFunctors(A,B,A,F,G);
const FG = composeFunctors(B,A,B,G,F);

const unit: NatIso<AObj,AM,AObj,AM> = {
  F: { Fobj:(a)=>a, Fmor:(m)=>m },     // Id_A
  G: GF,                               // G∘F
  at:   (a)=> A.id(a),                 // η_a = id_a
  invAt:(a)=> A.id(a)                  // η_a^{-1} = id_a
};
const counit: NatIso<BObj,BM,BObj,BM> = {
  F: FG,                               // F∘G
  G: { Fobj:(b)=>b, Fmor:(m)=>m },     // Id_B
  at:   (b)=> B.id(b),                 // ε_b = id_b
  invAt:(b)=> B.id(b)                  // ε_b^{-1} = id_b
};

console.log("🎯 Basic Equivalences Demo");
console.log("==========================\n");

console.log("Testing natural isomorphisms:");
console.log("[NatIso] unit natural iso ok?", checkNatIso(A,A,unit));
console.log("[NatIso] counit natural iso ok?", checkNatIso(B,B,counit));

const E: AdjointEquivalence<AObj,AM,BObj,BM> = { A,B,F,G,unit,counit };
console.log("[AdjointEquivalence] triangles ok?", checkAdjointEquivalence(E));

// ---------- Test simple functor transport via equivalence ----------
console.log("\n🔍 Testing functor transport via equivalence:");
const s_in_A: AM = {tag:"s"}; // a0 -> a1
const image_in_B = F.Fmor(s_in_A); // F(s) should be sigma : bX -> bY
const back_in_A = G.Fmor(image_in_B); // G(sigma) should be related to s
console.log("[Transport] F(s) =", image_in_B);
console.log("[Transport] G(F(s)) =", back_in_A);
console.log("[Transport] This demonstrates how morphisms transport via the equivalence");

console.log("\n🎉 Basic equivalence checks passed!");
console.log("\nWhat we demonstrated:");
console.log("• Two isomorphic categories A and B with explicit functors F and G");
console.log("• Natural isomorphisms η: Id_A ⇒ G∘F and ε: F∘G ⇒ Id_B");
console.log("• Adjoint equivalence with triangle law verification");
console.log("• Functor transport: how morphisms F(s) and G(s) correspond via the equivalence");
console.log("\nThis shows how equivalences let you 'treat A as B' in a principled way! 🚀");
