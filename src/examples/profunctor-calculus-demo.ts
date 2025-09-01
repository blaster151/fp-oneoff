> If you didn’t paste the “companions/conjoints” helpers earlier, this file inlines small versions.

```
// example.ts
import {
  // Relations/equipment bits
  SetObj, Rel, FnM, RelCat, FuncCat, diagRel, makeRelationsDouble,
  // Profunctor & coend bits
  FiniteSmallCategory, FiniteProf, ProTrans,
  composeFiniteProfCoend, checkProTransNaturality,
  hcomposeTrans
} from "./category-to-nerve-sset";

// ---------- A) Equipment over Set: companions, conjoints, unit/counit, triangles ----------

// Inline companions/conjoints (in case you didn’t add them in your module yet)
const companionRel = (f: FnM): Rel => ({
  src: f.src, dst: f.dst,
  holds: (a: any, b: any) => f.dst.eq(f.f(a), b)
});
const conjointRel = (f: FnM): Rel => ({
  src: f.dst, dst: f.src,
  holds: (b: any, a: any) => f.dst.eq(b, f.f(a))
});
const composeRel = (S: Rel, R: Rel): Rel => RelCat().comp(S, R);

// Small finite sets
const A: SetObj<number> = { id: "A", elems: [0,1,2], eq: (x,y)=>x===y };
const B: SetObj<number> = { id: "B", elems: [0,1,2], eq: (x,y)=>x===y };

// A function f: A → B
const f: FnM = { src: A, dst: B, f: (x:number)=> (x+1)%3 };

const Drel = makeRelationsDouble();
const Γ  = companionRel(f);   // graph of f
const Γd = conjointRel(f);    // cograph of f

// Unit η: id_A ⇒ Γd ∘ Γ
const eta = Drel.mkSquare({
  hTop: diagRel(A),
  hBot: composeRel(Γd, Γ),
  vLeft: Drel.V.id(A), vRight: Drel.V.id(A)
});

// Counit ε: Γ ∘ Γd ⇒ id_B
const eps = Drel.mkSquare({
  hTop: composeRel(Γ, Γd),
  hBot: diagRel(B),
  vLeft: Drel.V.id(B), vRight: Drel.V.id(B)
});

// Quick equality test of relations by inclusions both ways
const relsEqualByInclusions = (R: Rel, S: Rel) => {
  const incl = (top: Rel, bot: Rel) => {
    try { Drel.mkSquare({ hTop: top, hBot: bot, vLeft: Drel.V.id(top.src), vRight: Drel.V.id(top.dst) }); return true; }
    catch { return false; }
  };
  return incl(R,S) && incl(S,R);
};

// Triangle laws (collapse to equality of relations in this equipment)
const leftTriangle  = relsEqualByInclusions(Γ,  composeRel(composeRel(Γ, Γd), Γ));
const rightTriangle = relsEqualByInclusions(Γd, composeRel(Γd, composeRel(Γ, Γd)));

console.log("[Equipment] unit ok, counit ok, triangles:", !!eta, !!eps, { leftTriangle, rightTriangle });

// ---------- B) Finite profunctors + coend composition + protransformations ----------

// A *discrete* finite category: objects X, only identities.
// (Keeps lmap/rmap trivial so we can focus on coend quotient mechanics.)
function Disc<X extends string>(objs: ReadonlyArray<X>): FiniteSmallCategory<X, {tag:"id", x:X}> {
  return {
    objects: objs,
    morphisms: objs.map(x => ({ tag:"id", x })),
    id: (o:X)=>({tag:"id", x:o}),
    src: (m)=>m.x,
    dst: (m)=>m.x,
    comp: (g,f)=> (g.x===f.x ? g : (()=>{ throw new Error("impossible in discrete"); })())
  };
}

type Id<X extends string> = { tag:"id", x:X };

const A0 = Disc(["a0","a1"] as const);
const B0 = Disc(["b0","b1"] as const);
const C0 = Disc(["c0","c1"] as const);

// Finite profunctor helper: table-based elems with identity lmap/rmap
function tableProf<A extends string, B extends string>(
  A: FiniteSmallCategory<A, Id<A>>,
  B: FiniteSmallCategory<B, Id<B>>,
  table: Record<A, Record<B, string[]>>
): FiniteProf<A, Id<A>, B, Id<B>, string> {
  return {
    elems: (a,b)=> table[a]?.[b] ?? [],
    lmap: (_u, _b, t)=> t,  // discrete: only identities
    rmap: (_a, _v, t)=> t,
    keyT: (t)=> t,
    eqT: (x,y)=> x===y
  };
}

// Define two profunctors P: A⇸B and Q: B⇸C
const P = tableProf(A0, B0, {
  a0: { b0: ["p00","p01"], b1: ["p02"] },
  a1: { b0: [],            b1: ["p11"] }
} as any);

const Q = tableProf(B0, C0, {
  b0: { c0: ["q00"], c1: ["q01"] },
  b1: { c0: ["q10"], c1: [] }
} as any);

// Compose via coend: (P∘Q)(a,c) = ∫^b P(a,b)×Q(b,c) / ∼
const keyB = (b: keyof typeof B0.objects extends never ? string : any) => String(b);
const R = composeFiniteProfCoend(A0, B0, C0, (b:any)=>String(b), P, Q);

// Inspect some components
function showClasses<A extends string, C extends string>(
  a: A, c: C, R: ReturnType<typeof composeFiniteProfCoend<any,any,any,any,any,any,any,any>>
) {
  const classes = R.elems(a,c);
  return classes.map((cls:any) => `⟦b=${cls.rep.b}; p=${cls.rep.p}; q=${cls.rep.q}⟧`);
}
console.log("[Prof] (P∘Q)(a0,c0) =", showClasses("a0","c0", R));
console.log("[Prof] (P∘Q)(a0,c1) =", showClasses("a0","c1", R));
console.log("[Prof] (P∘Q)(a1,c0) =", showClasses("a1","c0", R));

// A protransformation α: P ⇒ P' mapping strings to upper-case strings
const Pprime: FiniteProf<any, any, any, any, string> = {
  ...P,
  elems: P.elems,
  lmap: P.lmap, rmap: P.rmap,
  keyT: (t:string)=> t.toUpperCase(),
  eqT:  (x:string,y:string)=> x.toUpperCase()===y.toUpperCase()
};
const alpha: ProTrans<any, any, any, any, string, string> = {
  at: (_a,_b) => (t:string)=> t.toUpperCase()
};

// Naturality is trivial in the discrete case but we can still run the checker:
const natOK = checkProTransNaturality(A0, B0, P, Pprime, alpha);
console.log("[ProTrans] α naturality (discrete) =", natOK);

// Horizontal composition α ★ id_Q : (P∘Q) ⇒ (P'∘Q)
const hstar = hcomposeTrans(A0, B0, C0, (b:any)=>String(b), P, Pprime, Q, Q, alpha, { at: (_b,_c)=> (x:any)=> x });
const img = hstar.at("a0","c0")(R.elems("a0","c0")[0]); // map first class
console.log("[ProTrans] (α★id)(a0,c0) sends class to key =", img.key);
```

