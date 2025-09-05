/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// kan-example-transport.ts
import { HasHom, SetFunctor, SetObj, LeftKan_Set, RightKan_Set } from "../types/catkit-kan";
import { SmallCategory } from "../types/category-to-nerve-sset";

// Define Functor interface locally to avoid import conflicts
interface Functor<A_O, A_M, B_O, B_M> {
  Fobj: (a:A_O)=>B_O;
  Fmor: (m:A_M)=>B_M;
}

// ---------- Source category C: arrow X --u--> Y ----------
type CObj = "X" | "Y";
type CM  = { tag:"id", o:CObj } | { tag:"u" };

const C: SmallCategory<CObj, CM> & { objects:CObj[]; morphisms:CM[] } = {
  objects: ["X","Y"],
  morphisms: [{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
  id: (o: CObj)=> ({tag:"id", o}),
  src: (m: CM)=> m.tag==="id" ? m.o : "X",
  dst: (m: CM)=> m.tag==="id" ? m.o : "Y",
  compose: (g: CM, f: CM) => {
    const s = (m:CM)=> C.src(m), d = (m:CM)=> C.dst(m);
    if (d(f)!==s(g)) throw new Error("C comp mismatch");
    if (f.tag==="id") return g;
    if (g.tag==="id") return f;
    return {tag:"u"}; // only u, so u∘u never typed; previous check prevents it
  }
};

// ---------- Target category D: two objects d0 --v--> d1 (plus identities) ----------
type DObj = "d0" | "d1";
type DM   = { tag:"id0" } | { tag:"id1" } | { tag:"v" };

const D: SmallCategory<DObj, DM> & HasHom<DObj, DM> & { objects:DObj[] } = {
  objects: ["d0","d1"],
  id: (o: DObj)=> o==="d0" ? {tag:"id0"} : {tag:"id1"},
  src: (m: DM)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d0"),
  dst: (m: DM)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d1"),
  compose: (g: DM, f: DM) => {
    if (D.dst(f)!==D.src(g)) throw new Error("D comp mismatch");
    if (f.tag==="id0") return g;
    if (f.tag==="id1") return g;
    if (g.tag==="id0") return f;
    if (g.tag==="id1") return f;
    // g= v, f= ? only cases that type-check: id∘v or v∘id
    // v ∘ v not composable; we already checked typing
    return {tag:"v"};
  },
  hom: (x: DObj, y: DObj) => {
    if (x==="d0" && y==="d0") return [ {tag:"id0"} ];
    if (x==="d0" && y==="d1") return [ {tag:"v"} ];
    if (x==="d1" && y==="d1") return [ {tag:"id1"} ];
    return [];
  }
};

// ---------- Functor F : C -> D mapping X|Y to d0|d1, and u -> v ----------
const F: Functor<CObj, CM, DObj, DM> = {
  Fobj: (c: CObj)=> c==="X" ? "d0" : "d1",
  Fmor: (m: CM)=> m.tag==="id" ? (m.o==="X" ? {tag:"id0"} : {tag:"id1"}) : {tag:"v"}
};

// ---------- Set-valued functor H : C -> Set ----------
const set = <A>(id:string, xs:A[], eq:(a:A,b:A)=>boolean): SetObj<A> => ({ id, elems: xs, eq });
const HX = set("HX", ["x0","x1"], (a,b)=>a===b);
const HY = set("HY", ["y0"],      (a,b)=>a===b);

const H: SetFunctor<CObj, CM> = {
  obj: (c: CObj)=> c==="X" ? HX : HY,
  map: (u: CM)=> (x:any)=> {
    if (u.tag==="id") return x;
    // u: X -> Y collapses both x0,x1 to y0
    return "y0";
  }
};

const keyC    = (c:CObj)=> c;
const keyDMor = (m:DM)=> m.tag;

// ---------- Build Lan and Ran ----------
const Lan = LeftKan_Set(C, D, F, H, keyC, keyDMor);
const Ran = RightKan_Set(C, D, F, H, keyC, keyDMor);

// Inspect objects at d0 and d1
const Lan_d0 = Lan.obj("d0");
const Lan_d1 = Lan.obj("d1");
console.log("[Lan] |Lan(F,H)(d0)| =", Lan_d0.elems.length);
console.log("[Lan] |Lan(F,H)(d1)| =", Lan_d1.elems.length);

// Show representatives (readable form)
const showLanClass = (cls:any) => {
  const { c, f, x } = cls.rep;
  return `[c=${c}; f=${(f as DM).tag}; x=${String(x)}]`;
};
console.log("[Lan] classes at d0 =", Lan_d0.elems.map(showLanClass));
console.log("[Lan] classes at d1 =", Lan_d1.elems.map(showLanClass));

// Map along v: d0 -> d1
const v: DM = {tag:"v"};
const LanV = Lan.map(v);
if (Lan_d0.elems.length>0) {
  const firstElem = Lan_d0.elems[0];
  if (firstElem) {
    const sent = LanV(firstElem);
    console.log("[Lan] map(v):", showLanClass(firstElem), "↦", showLanClass(sent));
  }
}

// ---------- Right Kan: families at d0 and d1 ----------
const Ran_d0 = Ran.obj("d0");
const Ran_d1 = Ran.obj("d1");
console.log("[Ran] |Ran(F,H)(d0)| =", Ran_d0.elems.length);
console.log("[Ran] |Ran(F,H)(d1)| =", Ran_d1.elems.length);

// Pretty-print a family: record keyed by C objects, mapping homs to H(c) values
const showFamily = (fam:Record<string, any>) => {
  const showMap = (m:any) => `{ ${[...m.entries()].map(([k,v]:[string,any])=>`${k}↦${String(v)}`).join(", ")} }`;
  return `{ X: ${showMap(fam["X"])}, Y: ${showMap(fam["Y"])} }`;
};

if (Ran_d0.elems.length>0) {
  const firstFamily = Ran_d0.elems[0];
  if (firstFamily) {
    console.log("[Ran] example family at d0 =", showFamily(firstFamily));
    // Transport along v: precompose
    const famSent = Ran.map(v)(firstFamily);
    console.log("[Ran] Ran(v) sends family to =", showFamily(famSent));
  }
}

// Notes:
// - For Lan: classes at d0 correspond to H(X) elements tagged by id0; at d1, (X,v,x) is identified with (Y,id1,H(u)(x)).
// - For Ran: families α_c: D(d,Fc)→H(c) must satisfy H(u)∘α_X = α_Y∘(F(u)∘-). Ran(v) precomposes each α_c with (-)∘v.
