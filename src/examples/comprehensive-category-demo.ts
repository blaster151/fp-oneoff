// comprehensive-category-demo.ts
import {
  // categories & nerve
  SmallCategory, Edge, Quiver, makeFreeCategory, Nerve,
  NSimplex, showPath, showSimplex,
  // horns & quasi
  makeInnerHorn2, asQuasiFromNerve,
  // double cats
  makeCommutingSquaresDouble, checkInterchange, PathMor,
  // relations equipment
  SetObj as SetObjCatkit, Rel, FnM, RelCat, FuncCat, diagRel, makeRelationsDouble,
  companionRel, conjointRel, unitSquare_companion, counitSquare_companion, checkCompanionTriangles,
  // profunctors & coends
  FiniteSmallCategory, FiniteProf, ProTrans,
  composeFiniteProfCoend, checkProTransNaturality, hcomposeTrans
} from "../types";

// Kan extensions (Set-valued)
import {
  SmallCategory as SmallCategoryKan, Functor, SetFunctor, HasHom,
  SetObj, LeftKan_Set, RightKan_Set
} from "../types/catkit-kan";

// ---------- Utility: tiny assertion helper ----------
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("Assertion failed: " + msg);
}

// ---------- A) Free category A->B->C (+ A->C) and its nerve ----------
type Obj = "A"|"B"|"C";
const objects: Obj[] = ["A","B","C"];
const f: Edge<Obj> = { src:"A", dst:"B", label:"f" };
const g: Edge<Obj> = { src:"B", dst:"C", label:"g" };
const h: Edge<Obj> = { src:"A", dst:"C", label:"h" };
const Q: Quiver<Obj> = { objects, edges:[f,g,h] };
const Cfree = makeFreeCategory(Q);
const f1 = Cfree.ofEdge(f), g1 = Cfree.ofEdge(g), h1 = Cfree.ofEdge(h);

const N = Nerve(Cfree);
const sigma2 = N.simplex("A", [f1, g1]);
console.log("[Nerve] 2-simplex:", showSimplex(sigma2));

// Horn filler demo
const horn = makeInnerHorn2(Cfree, f1, g1);
const Nq = asQuasiFromNerve(Cfree);
assert(Nq.hasInnerHorn2(horn), "Nerve must fill inner 2-horn");
console.log("[Horn] filler:", showSimplex(Nq.fillInnerHorn2(horn) as NSimplex<Obj,PathMor<Obj>>));

// ---------- B) Double category of commuting squares ----------
const eqPath = (x: PathMor<Obj>, y: PathMor<Obj>) =>
  x.src===y.src && x.dst===y.dst && x.edges.length===y.edges.length &&
  x.edges.every((e,i)=> e===y.edges[i]);
const Dsq = makeCommutingSquaresDouble(Cfree, eqPath);
const If = Dsq.idVCell(f1); const Ig = Dsq.idVCell(g1);
assert(checkInterchange(Dsq, If, If, Ig, Ig, eqPath), "Interchange law on identities");
console.log("[DoubleCat] interchange on identities: OK");

// ---------- C) Relations equipment ----------
const Aset: SetObjCatkit<number> = { id:"A", elems:[0,1,2], eq:(x,y)=>x===y };
const Bset: SetObjCatkit<number> = { id:"B", elems:[0,1,2], eq:(x,y)=>x===y };
const fFn: FnM = { src:Aset, dst:Bset, f:(x)=> (x+1)%3 };
const Γ = companionRel(fFn), Γd = conjointRel(fFn);
const eta = unitSquare_companion(fFn);
const eps = counitSquare_companion(fFn);
const tri = checkCompanionTriangles(fFn);
assert(!!eta && !!eps && tri.left && tri.right, "Companion unit/counit + triangle laws");
console.log("[Equipment] unit, counit, triangles: OK");

// ---------- D) Finite profunctors (discrete) + coend composition ----------
function Disc<X extends string>(objs: ReadonlyArray<X>): FiniteSmallCategory<X, {tag:"id", x:X}> {
  return {
    objects: objs,
    morphisms: objs.map(x=>({tag:"id", x})),
    id: (o:X)=>({tag:"id", x:o}),
    src:(m)=>m.x, dst:(m)=>m.x,
    comp:(g,f)=> g.x===f.x ? g : (():any=>{throw new Error("discrete")})()
  };
}
type Id<X extends string> = { tag:"id", x:X };

const A0 = Disc(["a0","a1"] as const);
const B0 = Disc(["b0","b1"] as const);
const C0 = Disc(["c0","c1"] as const);

function tableProf<A extends string,B extends string>(
  A: FiniteSmallCategory<A, Id<A>>,
  B: FiniteSmallCategory<B, Id<B>>,
  table: Record<A, Record<B, string[]>>
): FiniteProf<A, Id<A>, B, Id<B>, string> {
  return {
    elems: (a,b)=> table[a]?.[b] ?? [],
    lmap: (_u,_b,t)=>t,
    rmap: (_a,_v,t)=>t,
    keyT: (t)=>t, eqT:(x,y)=>x===y
  };
}

const P = tableProf(A0,B0, { a0:{ b0:["p00","p01"], b1:["p02"] }, a1:{ b0:[], b1:["p11"] } } as any);
const Qp = tableProf(B0,C0, { b0:{ c0:["q00"], c1:["q01"] }, b1:{ c0:["q10"], c1:[] } } as any);

const R = composeFiniteProfCoend(A0,B0,C0, (b:any)=>String(b), P, Qp);
console.log("[Coend] (P∘Q)(a0,c0) =", R.elems("a0","c0").map(cls=>`⟦b=${(cls as any).rep.b}; p=${(cls as any).rep.p}; q=${(cls as any).rep.q}⟧`));

// Protransformation α: P⇒P' (uppercase) and horizontal comp
const Pprime: FiniteProf<any,any,any,any,string> = { ...P, keyT:(t:string)=>t.toUpperCase(), eqT:(x:string,y:string)=>x.toUpperCase()===y.toUpperCase() };
const alpha: ProTrans<any,any,any,any,string,string> = { at: (_a,_b)=>(t:string)=>t.toUpperCase() };
assert(checkProTransNaturality(A0,B0,P,Pprime,alpha), "α naturality (discrete)");
const hstar = hcomposeTrans(A0,B0,C0, (b:any)=>String(b), P,Pprime, Qp,Qp, alpha, { at:(_b,_c)=>(x:any)=>x });
const mapped = hstar.at("a0","c0")(R.elems("a0","c0")[0]);
assert(!!mapped.key, "hcompose produced a class");
console.log("[ProTrans] α★id mapped a class: OK");

// ---------- E) Kan extensions with nontrivial D and explicit assertions ----------

// (1) C: arrow X --u--> Y
type CObj = "X" | "Y";
type CM  = { tag:"id", o:CObj } | { tag:"u" };

const C1: SmallCategoryKan<CObj, CM> & { objects:CObj[]; morphisms:CM[] } = {
  objects: ["X","Y"],
  morphisms: [{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
  id: (o)=> ({tag:"id", o}),
  src: (m)=> m.tag==="id" ? m.o : "X",
  dst: (m)=> m.tag==="id" ? m.o : "Y",
  comp: (g,f) => {
    const s = (m:CM)=> C1.src(m), d = (m:CM)=> C1.dst(m);
    if (d(f)!==s(g)) throw new Error("C comp mismatch");
    if (f.tag==="id") return g;
    if (g.tag==="id") return f;
    return {tag:"u"};
  }
};

// (2) D: d0 --v--> d1 (plus identities)
type DObj = "d0" | "d1";
type DM   = { tag:"id0" } | { tag:"id1" } | { tag:"v" };

const D1: SmallCategoryKan<DObj, DM> & HasHom<DObj, DM> & { objects:DObj[] } = {
  objects: ["d0","d1"],
  id: (o)=> o==="d0" ? {tag:"id0"} : {tag:"id1"},
  src: (m)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d0"),
  dst: (m)=> m.tag==="id0" ? "d0" : (m.tag==="id1" ? "d1" : "d1"),
  comp: (g,f) => {
    if (D1.dst(f)!==D1.src(g)) throw new Error("D comp mismatch");
    if (f.tag==="id0"||f.tag==="id1") return g;
    if (g.tag==="id0"||g.tag==="id1") return f;
    return {tag:"v"};
  },
  hom: (x,y) => {
    if (x==="d0" && y==="d0") return [ {tag:"id0"} ];
    if (x==="d0" && y==="d1") return [ {tag:"v"} ];
    if (x==="d1" && y==="d1") return [ {tag:"id1"} ];
    return [];
  }
};

// (3) F: C -> D mapping X|Y to d0|d1 and u -> v
const F: Functor<CObj, CM, DObj, DM> = {
  Fobj: (c)=> c==="X" ? "d0" : "d1",
  Fmor: (m)=> m.tag==="id" ? (m.o==="X" ? {tag:"id0"} : {tag:"id1"}) : {tag:"v"}
};

// (4) H: C -> Set
const set = <A>(id:string, xs:A[], eq:(a:A,b:A)=>boolean): SetObj<A> => ({ id, elems: xs, eq });
const HX = set("HX", ["x0","x1"], (a,b)=>a===b);
const HY = set("HY", ["y0"],      (a,b)=>a===b);
const H: SetFunctor<CObj, CM> = {
  obj: (c)=> c==="X" ? HX : HY,
  map: (u)=> (x:any)=> u.tag==="id" ? x : "y0"
};

const keyC    = (c:CObj)=> c;
const keyDMor = (m:DM)=> m.tag;

// Build Lan and Ran
const Lan = LeftKan_Set(C1, D1, F, H, keyC, keyDMor);
const Ran = RightKan_Set(C1, D1, F, H, keyC, keyDMor);

// --- Assertions for Left Kan (coend identification) ---
const Lan_d0 = Lan.obj("d0");
const Lan_d1 = Lan.obj("d1");
assert(Lan_d0.elems.length>0 && Lan_d1.elems.length>0, "Lan objects nonempty");

const v: DM = {tag:"v"};
const send = Lan.map(v);

// pick an element [X, id0, x0] in Lan(d0)
const el0 = Lan_d0.elems.find(e => (e as any).rep.c==="X" && ((e as any).rep.f as DM).tag==="id0") || Lan_d0.elems[0];
const image = send(el0);

// Check there exists a representative class at d1 equal to image
const equalsImage = (x:any,y:any)=> Lan_d1.eq(x,y);
assert(Lan_d1.elems.some(e => equalsImage(e, image)), "Lan(v) image is present in Lan(d1)");

// And specifically, that [X,v,x0] is identified with [Y,id1,H(u)(x0)] in the quotient
const witness = Lan_d1.elems.find(e => (e as any).rep.c==="Y" && ((e as any).rep.f as DM).tag==="id1" && (e as any).rep.x==="y0");
assert(!!witness && equalsImage(witness!, image), "Coend relation: [X,v,x0] ~ [Y,id1,H(u)(x0)]");
console.log("[Lan] coend identification along v: OK");

// --- Assertions for Right Kan (end naturality & transport) ---
const Ran_d0 = Ran.obj("d0");
const Ran_d1 = Ran.obj("d1");
assert(Ran_d0.elems.length>0, "Ran(d0) nonempty");

const fam0 = Ran_d0.elems[0]; // a family { alpha_X, alpha_Y }
const Hu = H.map({tag:"u"} as CM);
const ax_id0 = fam0["X"].get("id0"); // α_X(id0)
const ay_v   = fam0["Y"].get("v");   // α_Y(v)
assert(JSON.stringify(Hu(ax_id0))===JSON.stringify(ay_v), "End naturality: H(u)(α_X(id0)) = α_Y(v)");

const fam1 = Ran.map(v)(fam0);
// At d1, only α'_Y(id1) exists, and should equal α_Y(v)
assert(JSON.stringify(fam1["Y"].get("id1"))===JSON.stringify(ay_v), "Ran(v) precomposition: α'_Y(id1) = α_Y(v)");
console.log("[Ran] end naturality & transport along v: OK");

console.log("All assertions passed ✅");
