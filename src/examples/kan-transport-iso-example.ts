// kan-transport-iso-example.ts
import { Functor, HasHom, SetFunctor, SetObj } from "../types/catkit-kan";
import { SmallCategory } from "../types/category-to-nerve-sset";
import { AdjointEquivalence, NatIso } from "../types/catkit-equivalence";
import { transportLeftKanAlongEquivalence, transportRightKanAlongEquivalence, checkSetNatIso } from "../types/catkit-kan-transport";

// Source category C: X --u--> Y
type CObj = "X"|"Y";
type CM   = {tag:"id",o:CObj}|{tag:"u"};
const C: SmallCategory<CObj,CM> & {objects:CObj[]; morphisms:CM[]} = {
  objects:["X","Y"],
  morphisms:[{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
  id:(o)=>({tag:"id",o}), 
  src:(m)=> m.tag==="id"?m.o:"X", 
  dst:(m)=> m.tag==="id"?m.o:"Y",
  comp:(g,f)=>{ 
    if (C.dst(f)!==C.src(g)) throw new Error("C comp");
    if (f.tag==="id") return g; 
    if (g.tag==="id") return f; 
    return {tag:"u"}; 
  }
};

// Target D: d0 --v--> d1
type DObj = "d0"|"d1";
type DM   = {tag:"id0"}|{tag:"id1"}|{tag:"v"};
const D: SmallCategory<DObj,DM> & HasHom<DObj,DM> & {objects:DObj[]; morphisms:DM[]} = {
  objects:["d0","d1"],
  morphisms:[{tag:"id0"},{tag:"id1"},{tag:"v"}],
  id:(o)=> o==="d0"?{tag:"id0"}:{tag:"id1"},
  src:(m)=> m.tag==="id0"?"d0":m.tag==="id1"?"d1":"d0",
  dst:(m)=> m.tag==="id0"?"d0":m.tag==="id1"?"d1":"d1",
  comp:(g,f)=>{ 
    if (D.dst(f)!==D.src(g)) throw new Error("D comp");
    if (f.tag==="id0"||f.tag==="id1") return g;
    if (g.tag==="id0"||g.tag==="id1") return f;
    return {tag:"v"}; 
  },
  hom:(x,y)=> (x==="d0"&&y==="d0")?[{tag:"id0"}]: (x==="d0"&&y==="d1")?[{tag:"v"}] : (x==="d1"&&y==="d1")?[{tag:"id1"}]: []
};

// Renamed copy D' : e0 --w--> e1
type DpObj = "e0"|"e1";
type DpM   = {tag:"idE0"}|{tag:"idE1"}|{tag:"w"};
const Dp: SmallCategory<DpObj,DpM> & HasHom<DpObj,DpM> & {objects:DpObj[]; morphisms:DpM[]} = {
  objects:["e0","e1"],
  morphisms:[{tag:"idE0"},{tag:"idE1"},{tag:"w"}],
  id:(o)=> o==="e0"?{tag:"idE0"}:{tag:"idE1"},
  src:(m)=> m.tag==="idE0"?"e0":m.tag==="idE1"?"e1":"e0",
  dst:(m)=> m.tag==="idE0"?"e0":m.tag==="idE1"?"e1":"e1",
  comp:(g,f)=>{ 
    if (Dp.dst(f)!==Dp.src(g)) throw new Error("Dp comp");
    if (f.tag==="idE0"||f.tag==="idE1") return g;
    if (g.tag==="idE0"||g.tag==="idE1") return f;
    return {tag:"w"}; 
  },
  hom:(x,y)=> (x==="e0"&&y==="e0")?[{tag:"idE0"}]: (x==="e0"&&y==="e1")?[{tag:"w"}] : (x==="e1"&&y==="e1")?[{tag:"idE1"}]: []
};

// Equivalence E : D ≃ D' (strict iso here)
const K: Functor<DObj,DM,DpObj,DpM> = {
  Fobj:(d)=> d==="d0"?"e0":"e1",
  Fmor:(m)=> m.tag==="id0"?{tag:"idE0"}:m.tag==="id1"?{tag:"idE1"}:{tag:"w"}
};
const G: Functor<DpObj,DpM,DObj,DM> = {
  Fobj:(e)=> e==="e0"?"d0":"d1",
  Fmor:(m)=> m.tag==="idE0"?{tag:"id0"}:m.tag==="idE1"?{tag:"id1"}:{tag:"v"}
};
const unit: NatIso<DObj,DM,DObj,DM> = {
  F:{Fobj:(d)=>d,Fmor:(m)=>m},
  G:{Fobj:(d)=> G.Fobj(K.Fobj(d)), Fmor:(m)=> G.Fmor(K.Fmor(m)) },
  at:(d)=> D.id(d), 
  invAt:(d)=> D.id(d)
};
const counit: NatIso<DpObj,DpM,DpObj,DpM> = {
  F:{Fobj:(e)=> K.Fobj(G.Fobj(e)), Fmor:(m)=> K.Fmor(G.Fmor(m)) },
  G:{Fobj:(e)=>e, Fmor:(m)=>m},
  at:(e)=> Dp.id(e), 
  invAt:(e)=> Dp.id(e)
};
const E: AdjointEquivalence<DObj,DM,DpObj,DpM> = { A:D as any, B:Dp as any, F:K, G, unit, counit };

// F : C → D  and H : C → Set
const Fcd: Functor<CObj,CM,DObj,DM> = {
  Fobj:(c)=> c==="X"?"d0":"d1",
  Fmor:(u)=> u.tag==="id"? (u.o==="X"?{tag:"id0"}:{tag:"id1"}) : {tag:"v"}
};
const set = <A>(id:string, xs:A[], eq:(a:A,b:A)=>boolean): SetObj<A> => ({ id, elems: xs, eq });
const HX = set("HX", ["x0","x1"], (a,b)=>a===b);
const HY = set("HY", ["y0"],      (a,b)=>a===b);
const H: SetFunctor<CObj,CM> = {
  obj:(c)=> c==="X"?HX:HY,
  map:(u)=> (x:any)=> u.tag==="id"?x:"y0"
};

const keyC = (c:CObj)=>c, keyDM = (m:DM)=>m.tag, keyDpM = (m:DpM)=>m.tag;

console.log("🎯 Kan Extensions Transport Demo");
console.log("=================================\n");

console.log("📊 Setup:");
console.log("C: X --u--> Y (source category)");
console.log("D: d0 --v--> d1 (target category)");
console.log("D': e0 --w--> e1 (equivalent category)");
console.log("E: D ≃ D' (strict equivalence with K ⊣ G)");
console.log("F: C → D, H: C → Set");
console.log();

// Build and check Lan transport iso
console.log("🔄 Testing Left Kan Extension Transport:");
console.log("Asserting: Lan_{K∘F} H ≅ (Lan_F H) ∘ G");

const { iso: isoLan } = transportLeftKanAlongEquivalence(C, D, Dp, E, Fcd, H, keyC, keyDM, keyDpM);
const lanTransportOk = checkSetNatIso(Dp as any, isoLan);
console.log("[Lan transport] natural isomorphism holds:", lanTransportOk ? "✅ YES" : "❌ NO");

// Build and check Ran transport iso (full, end-side)
console.log("\n🔄 Testing Right Kan Extension Transport:");
console.log("Asserting: Ran_{K∘F} H ≅ (Ran_F H) ∘ G");

const { iso: isoRan } = transportRightKanAlongEquivalence(C, D, Dp, E, Fcd, H, keyC, keyDM, keyDpM);
const ranTransportOk = checkSetNatIso(Dp as any, isoRan);
console.log("[Ran transport] natural isomorphism holds:", ranTransportOk ? "✅ YES" : "❌ NO");

console.log("\n🎉 Kan transport demo completed!");
console.log("\nWhat we demonstrated:");
console.log("• Left Kan extensions transport along equivalences: Lan_{K∘F} H ≅ (Lan_F H) ∘ G");
console.log("• Right Kan extensions transport along equivalences: Ran_{K∘F} H ≅ (Ran_F H) ∘ G");
console.log("• Natural isomorphism witnesses for both transport directions");
console.log("• Explicit verification that 'Kan transports up to iso' holds in code form!");
console.log("🚀 This shows the functorial nature of Kan extensions under equivalences!");
