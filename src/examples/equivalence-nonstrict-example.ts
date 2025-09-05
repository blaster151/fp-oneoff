/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// equivalence-nonstrict-example.ts
import {
  SmallCategory, Functor, NatIso,
  checkNatIso, checkAdjointEquivalence
} from "../types/catkit-equivalence";

// A: three-object groupoid with a0 <-> a1, and a2 isolated
type AObj = "a0"|"a1"|"a2";
type AM = {tag:"id", o:AObj} | {tag:"s"} | {tag:"t"}; // s:a0->a1, t:a1->a0

const A: SmallCategory<AObj,AM> & {objects:AObj[]; morphisms:AM[]} = {
  objects:["a0","a1","a2"],
  morphisms:[{tag:"id",o:"a0"},{tag:"id",o:"a1"},{tag:"id",o:"a2"},{tag:"s"},{tag:"t"}],
  id:(o)=>({tag:"id",o}),
  src:(m)=> m.tag==="id" ? m.o : (m.tag==="s" ? "a0" : "a1"),
  dst:(m)=> m.tag==="id" ? m.o : (m.tag==="s" ? "a1" : "a0"),
  compose:(g,f)=>{
    if (A.dst(f)!==A.src(g)) throw new Error("A comp");
    if (f.tag==="id") return g;
    if (g.tag==="id") return f;
    if (g.tag==="s" && f.tag==="t") return {tag:"id",o:"a1"};
    if (g.tag==="t" && f.tag==="s") return {tag:"id",o:"a0"};
    throw new Error("bad comp");
  }
};

// B: similar groupoid with bX <-> bY and bZ isolated
type BObj = "bX"|"bY"|"bZ";
type BM = {tag:"idX"}|{tag:"idY"}|{tag:"idZ"}|{tag:"sigma"}|{tag:"tau"};

const B: SmallCategory<BObj,BM> & {objects:BObj[]; morphisms:BM[]} = {
  objects:["bX","bY","bZ"],
  morphisms:[{tag:"idX"},{tag:"idY"},{tag:"idZ"},{tag:"sigma"},{tag:"tau"}],
  id:(o)=> o==="bX"?{tag:"idX"}:o==="bY"?{tag:"idY"}:{tag:"idZ"},
  src:(m)=> m.tag==="idX"?"bX":m.tag==="idY"?"bY":m.tag==="idZ"?"bZ":(m.tag==="sigma"?"bX":"bY"),
  dst:(m)=> m.tag==="idX"?"bX":m.tag==="idY"?"bY":m.tag==="idZ"?"bZ":(m.tag==="sigma"?"bY":"bX"),
  compose:(g,f)=>{
    if (B.dst(f)!==B.src(g)) throw new Error("B comp");
    if (f.tag==="idX"||f.tag==="idY"||f.tag==="idZ") return g;
    if (g.tag==="idX"||g.tag==="idY"||g.tag==="idZ") return f;
    if (g.tag==="sigma" && f.tag==="tau") return {tag:"idY"};
    if (g.tag==="tau"   && f.tag==="sigma") return {tag:"idX"};
    throw new Error("bad comp");
  }
};

// Non-strict equivalence: F maps a0->bX, a1->bY, a2->bZ; G maps bX->a1, bY->a0, bZ->a2 (swapped pair)
const F: Functor<AObj,AM,BObj,BM> = {
  Fobj:(a)=> a==="a0"?"bX":a==="a1"?"bY":"bZ",
  Fmor:(m)=> m.tag==="id" ? (m.o==="a0"?{tag:"idX"}:m.o==="a1"?{tag:"idY"}:{tag:"idZ"}) : (m.tag==="s"?{tag:"sigma"}:{tag:"tau"})
};
const G: Functor<BObj,BM,AObj,AM> = {
  Fobj:(b)=> b==="bX"?"a1":b==="bY"?"a0":"a2",
  Fmor:(m)=> m.tag==="idX"?{tag:"id",o:"a1"}:m.tag==="idY"?{tag:"id",o:"a0"}:m.tag==="idZ"?{tag:"id",o:"a2"}:(m.tag==="sigma"?{tag:"t"}:{tag:"s"})
};

// Unit η_a : a → G(F(a))
const unit: NatIso<AObj,AM,AObj,AM> = {
  F: { Fobj:(a)=>a, Fmor:(m)=>m },
  G: { Fobj:(a)=> G.Fobj(F.Fobj(a)), Fmor:(m)=> G.Fmor(F.Fmor(m)) },
  at:(a)=> a==="a0"? {tag:"s"} : a==="a1"? {tag:"t"} : {tag:"id",o:"a2"},
  invAt:(a)=> a==="a0"? {tag:"t"} : a==="a1"? {tag:"s"} : {tag:"id",o:"a2"},
};
// Counit ε_b : F(G(b)) → b
const counit: NatIso<BObj,BM,BObj,BM> = {
  F: { Fobj:(b)=> F.Fobj(G.Fobj(b)), Fmor:(m)=> F.Fmor(G.Fmor(m)) },
  G: { Fobj:(b)=> b, Fmor:(m)=> m },
  at:(b)=> b==="bX"? {tag:"tau"} : b==="bY"? {tag:"sigma"} : {tag:"idZ"},
  invAt:(b)=> b==="bX"? {tag:"sigma"} : b==="bY"? {tag:"tau"} : {tag:"idZ"},
};

console.log("🎯 Non-Strict Equivalence Demo");
console.log("==============================\n");

console.log("Testing non-strict natural isomorphisms:");
console.log("[unit iso ok?]", checkNatIso(A,A,unit));
console.log("[counit iso ok?]", checkNatIso(B,B,counit));

const E: {A: typeof A, B: typeof B, F: typeof F, G: typeof G, unit: typeof unit, counit: typeof counit} = { A, B, F, G, unit, counit };
console.log("[adjoint equivalence ok?]", checkAdjointEquivalence(E));

console.log("\n🔍 What makes this non-strict:");
console.log("• F maps a0→bX, a1→bY, a2→bZ");
console.log("• G maps bX→a1, bY→a0, bZ→a2 (swapped the pair!)");
console.log("• So G∘F maps a0→a1, a1→a0, a2→a2 (not identity!)");
console.log("• Unit η: a0→a1 (via s), a1→a0 (via t), a2→a2 (via id)");
console.log("• Counit ε: bX→bY (via tau), bY→bX (via sigma), bZ→bZ (via id)");
console.log("\nThis shows that equivalences can have nontrivial unit/counit! 🚀");
