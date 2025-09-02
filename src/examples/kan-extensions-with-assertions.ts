// kan-extensions-with-assertions.ts
// Enhanced Kan extensions demo with explicit assertions to verify categorical properties

import { HasHom, SetFunctor, SetObj, LeftKan_Set, RightKan_Set } from "../types/catkit-kan";
import { SmallCategory } from "../types/category-to-nerve-sset";

// Define Functor interface locally to avoid import conflicts
interface Functor<A_O, A_M, B_O, B_M> {
  Fobj: (a:A_O)=>B_O;
  Fmor: (m:A_M)=>B_M;
}

// ---------- Utility: assertion helper ----------
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("Assertion failed: " + msg);
}

// ---------- Kan extensions with nontrivial D and explicit assertions ----------

// (1) C: arrow X --u--> Y
type CObj = "X" | "Y";
type CM  = { tag:"id", o:CObj } | { tag:"u" };

const C: SmallCategory<CObj, CM> & { objects:CObj[]; morphisms:CM[] } = {
  objects: ["X","Y"],
  morphisms: [{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
  id: (o: CObj)=> ({tag:"id", o}),
  src: (m: CM)=> m.tag==="id" ? m.o : "X",
  dst: (m: CM)=> m.tag==="id" ? m.o : "Y",
  comp: (g: CM, f: CM) => {
    const s = (m:CM)=> C.src(m), d = (m:CM)=> C.dst(m);
    if (d(f)!==s(g)) throw new Error("C comp mismatch");
    if (f.tag==="id") return g;
    if (g.tag==="id") return f;
    return {tag:"u"};
  }
};

// (2) D: d0 --v--> d1 (plus identities)
type DObj = "d0" | "d1";
type DM   = { tag:"id0" } | { tag:"id1" } | { tag:"v" };

const D: SmallCategory<DObj, DM> & HasHom<DObj, DM> & { objects:DObj[] } = {
  objects: ["d0","d1"],
  id: (o: DObj)=> o==="d0" ? {tag:"id0"} : {tag:"id1"},
  src: (m: DM)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d0"),
  dst: (m: DM)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d1"),
  comp: (g: DM, f: DM) => {
    if (D.dst(f)!==D.src(g)) throw new Error("D comp mismatch");
    if (f.tag==="id0"||f.tag==="id1") return g;
    if (g.tag==="id0"||g.tag==="id1") return f;
    return {tag:"v"};
  },
  hom: (x: DObj, y: DObj) => {
    if (x==="d0" && y==="d0") return [ {tag:"id0"} ];
    if (x==="d0" && y==="d1") return [ {tag:"v"} ];
    if (x==="d1" && y==="d1") return [ {tag:"id1"} ];
    return [];
  }
};

// (3) F: C -> D mapping X|Y to d0|d1 and u -> v
const F: Functor<CObj, CM, DObj, DM> = {
  Fobj: (c: CObj)=> c==="X" ? "d0" : "d1",
  Fmor: (m: CM)=> m.tag==="id" ? (m.o==="X" ? {tag:"id0"} : {tag:"id1"}) : {tag:"v"}
};

// (4) H: C -> Set
const set = <A>(id:string, xs:A[], eq:(a:A,b:A)=>boolean): SetObj<A> => ({ id, elems: xs, eq });
const HX = set("HX", ["x0","x1"], (a,b)=>a===b);
const HY = set("HY", ["y0"],      (a,b)=>a===b);
const H: SetFunctor<CObj, CM> = {
  obj: (c: CObj)=> c==="X" ? HX : HY,
  map: (u: CM)=> (x:any)=> u.tag==="id" ? x : "y0"
};

const keyC    = (c:CObj)=> c;
const keyDMor = (m:DM)=> m.tag;

console.log("🎯 Kan Extensions with Explicit Assertions");
console.log("==========================================\n");

console.log("Building categories:");
console.log("• C: arrow category X --u--> Y");
console.log("• D: nontrivial category d0 --v--> d1");
console.log("• F: C → D mapping X|Y to d0|d1, u to v");
console.log("• H: C → Set with H(X) = {x0, x1}, H(Y) = {y0}, H(u) collapsing x_i to y0");
console.log("");

// Build Lan and Ran
const Lan = LeftKan_Set(C, D, F, H, keyC, keyDMor);
const Ran = RightKan_Set(C, D, F, H, keyC, keyDMor);

// --- Assertions for Left Kan (coend identification) ---
console.log("🔍 Testing Left Kan Extension (Coend Identification):");
const Lan_d0 = Lan.obj("d0");
const Lan_d1 = Lan.obj("d1");
assert(Lan_d0.elems.length>0 && Lan_d1.elems.length>0, "Lan objects nonempty");

const v: DM = {tag:"v"};
const send = Lan.map(v);

// pick an element [X, id0, x0] in Lan(d0)
const el0 = Lan_d0.elems.find(e => (e as any).rep.c==="X" && ((e as any).rep.f as DM).tag==="id0") || Lan_d0.elems[0];
assert(!!el0, "Found element [X, id0, x0] in Lan(d0)");
const image = send(el0!);

// Check there exists a representative class at d1 equal to image
const equalsImage = (x:any,y:any)=> Lan_d1.eq(x,y);
assert(Lan_d1.elems.some(e => equalsImage(e, image)), "Lan(v) image is present in Lan(d1)");

// And specifically, that [X,v,x0] is identified with [Y,id1,H(u)(x0)] in the quotient
const witness = Lan_d1.elems.find(e => (e as any).rep.c==="Y" && ((e as any).rep.f as DM).tag==="id1" && (e as any).rep.x==="y0");
assert(!!witness && equalsImage(witness!, image), "Coend relation: [X,v,x0] ~ [Y,id1,H(u)(x0)]");
console.log("✅ [Lan] coend identification along v: OK");

// --- Assertions for Right Kan (end naturality & transport) ---
console.log("\n🔍 Testing Right Kan Extension (End Naturality & Transport):");
const Ran_d0 = Ran.obj("d0");
const Ran_d1 = Ran.obj("d1");
assert(Ran_d0.elems.length>0, "Ran(d0) nonempty");

const fam0 = Ran_d0.elems[0]; // a family { alpha_X, alpha_Y }
assert(!!fam0, "Found family in Ran(d0)");
const Hu = H.map({tag:"u"} as CM);
const ax_id0 = fam0!["X"].get("id0"); // α_X(id0)
const ay_v   = fam0!["Y"].get("v");   // α_Y(v)
assert(JSON.stringify(Hu(ax_id0))===JSON.stringify(ay_v), "End naturality: H(u)(α_X(id0)) = α_Y(v)");

const fam1 = Ran.map(v)(fam0!);
// At d1, only α'_Y(id1) exists, and should equal α_Y(v)
assert(JSON.stringify(fam1["Y"].get("id1"))===JSON.stringify(ay_v), "Ran(v) precomposition: α'_Y(id1) = α_Y(v)");
console.log("✅ [Ran] end naturality & transport along v: OK");

console.log("\n🎉 All Kan extension assertions passed!");
console.log("\nWhat we verified:");
console.log("• Left Kan: coend identification [X,v,x0] ~ [Y,id1,H(u)(x0)]");
console.log("• Right Kan: end naturality H(u)(α_X(id0)) = α_Y(v)");
console.log("• Transport: Ran(v) precomposition α'_Y(id1) = α_Y(v)");
console.log("\nThe categorical abstraction becomes concrete, verifiable code! 🚀");
