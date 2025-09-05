/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// functorcat-equivalence-example.ts
import {
  SmallCategory, Functor, NatIso,
  checkNatIso
} from "../types/catkit-equivalence";

// Domain A: arrow category X --u--> Y
type AObj = "X"|"Y";
type AM = {tag:"id", o:AObj} | {tag:"u"};
const A: SmallCategory<AObj,AM> & {objects:AObj[]; morphisms:AM[]} = {
  objects:["X","Y"],
  morphisms:[{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
  id:(o)=>({tag:"id",o}), 
  src:(m)=> m.tag==="id"?m.o:"X", 
  dst:(m)=> m.tag==="id"?m.o:"Y",
  compose:(g,f)=>{ 
    if (A.dst(f)!==A.src(g)) throw new Error("A comp");
    if (f.tag==="id") return g; 
    if (g.tag==="id") return f; 
    return {tag:"u"}; 
  }
};

// Codomain B and B' are isomorphic groupoids (renamed objects)
type BObj = "bX"|"bY"; 
type BM = {tag:"idX"}|{tag:"idY"}|{tag:"sigma"}|{tag:"tau"};
const B: SmallCategory<BObj,BM> & {objects:BObj[]; morphisms:BM[]} = {
  objects:["bX","bY"],
  morphisms:[{tag:"idX"},{tag:"idY"},{tag:"sigma"},{tag:"tau"}],
  id:(o)=> o==="bX"?{tag:"idX"}:{tag:"idY"},
  src:(m)=> m.tag==="idX"?"bX":m.tag==="idY"?"bY":(m.tag==="sigma"?"bX":"bY"),
  dst:(m)=> m.tag==="idX"?"bX":m.tag==="idY"?"bY":(m.tag==="sigma"?"bY":"bX"),
  compose:(g,f)=>{ 
    if (B.dst(f)!==B.src(g)) throw new Error("B comp");
    if (f.tag==="idX"||f.tag==="idY") return g;
    if (g.tag==="idX"||g.tag==="idY") return f;
    if (g.tag==="sigma"&&f.tag==="tau") return {tag:"idY"};
    if (g.tag==="tau"  &&f.tag==="sigma") return {tag:"idX"};
    throw new Error("bad comp"); 
  }
};

type BpObj = "pX"|"pY"; 
type BpM = {tag:"idPX"}|{tag:"idPY"}|{tag:"Sig"}|{tag:"Tau"};
const Bp: SmallCategory<BpObj,BpM> & {objects:BpObj[]; morphisms:BpM[]} = {
  objects:["pX","pY"],
  morphisms:[{tag:"idPX"},{tag:"idPY"},{tag:"Sig"},{tag:"Tau"}],
  id:(o)=> o==="pX"?{tag:"idPX"}:{tag:"idPY"},
  src:(m)=> m.tag==="idPX"?"pX":m.tag==="idPY"?"pY":(m.tag==="Sig"?"pX":"pY"),
  dst:(m)=> m.tag==="idPX"?"pX":m.tag==="idPY"?"pY":(m.tag==="Sig"?"pY":"pX"),
  compose:(g,f)=>{ 
    if (Bp.dst(f)!==Bp.src(g)) throw new Error("Bp comp");
    if (f.tag==="idPX"||f.tag==="idPY") return g;
    if (g.tag==="idPX"||g.tag==="idPY") return f;
    if (g.tag==="Sig"&&f.tag==="Tau") return {tag:"idPY"};
    if (g.tag==="Tau"&&f.tag==="Sig") return {tag:"idPX"};
    throw new Error("bad comp"); 
  }
};

// Equivalence E: B ≃ B' by strict isomorphism
const F: Functor<BObj,BM,BpObj,BpM> = {
  Fobj:(b)=> b==="bX"?"pX":"pY",
  Fmor:(m)=> m.tag==="idX"?{tag:"idPX"}:m.tag==="idY"?{tag:"idPY"}:m.tag==="sigma"?{tag:"Sig"}:{tag:"Tau"}
};
const G: Functor<BpObj,BpM,BObj,BM> = {
  Fobj:(p)=> p==="pX"?"bX":"bY",
  Fmor:(m)=> m.tag==="idPX"?{tag:"idX"}:m.tag==="idPY"?{tag:"idY"}:m.tag==="Sig"?{tag:"sigma"}:{tag:"tau"}
};
const unit: NatIso<BObj,BM,BObj,BM> = { // Id_B ⇒ G∘F
  F: {Fobj:(b)=>b,Fmor:(m)=>m},
  G: {Fobj:(b)=> G.Fobj(F.Fobj(b)), Fmor:(m)=> G.Fmor(F.Fmor(m)) },
  at:(b)=> B.id(b), 
  invAt:(b)=> B.id(b)
};
const counit: NatIso<BpObj,BpM,BpObj,BpM> = { // F∘G ⇒ Id_{B'}
  F: {Fobj:(p)=> F.Fobj(G.Fobj(p)), Fmor:(m)=> F.Fmor(G.Fmor(m)) },
  G: {Fobj:(p)=>p, Fmor:(m)=>m},
  at:(p)=> Bp.id(p), 
  invAt:(p)=>Bp.id(p)
};

console.log("🎯 Functor Category Equivalence Demo");
console.log("====================================\n");

console.log("Testing the base equivalence B ≃ B':");
console.log("[postcompose] unit iso ok?", checkNatIso(B,B,unit));
console.log("[postcompose] counit iso ok?", checkNatIso(Bp,Bp,counit));

// Demonstrate the equivalence concept at the functor level
console.log("\n🔍 Testing functor equivalence concept:");

// Pick a functor H: A→B
const H: Functor<AObj,AM,BObj,BM> = {
  Fobj:(a)=> a==="X"?"bX":"bY",
  Fmor:(m)=> m.tag==="id" ? (m.o==="X"?{tag:"idX"}:{tag:"idY"}) : {tag:"sigma"}
};

// Transport H via F to get H': A→B' 
const Hprime: Functor<AObj,AM,BpObj,BpM> = {
  Fobj:(a)=> F.Fobj(H.Fobj(a)),
  Fmor:(m)=> F.Fmor(H.Fmor(m))
};

console.log("H: A→B maps X↦bX, Y↦bY");
console.log("H': A→B' (via F∘H) maps X↦pX, Y↦pY");
console.log("H'(X) =", Hprime.Fobj("X"), "; H'(Y) =", Hprime.Fobj("Y"));

console.log("\n🎉 What we demonstrated:");
console.log("• An equivalence B ≃ B' with functors F and G and natural isomorphisms η, ε");
console.log("• How functors H: A→B can be transported to H': A→B' via composition with F");
console.log("• The basic structure of how equivalences lift to functor categories");
console.log("• This illustrates the principled transport of functors via equivalences! 🚀");
