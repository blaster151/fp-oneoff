// catkit-kan.ts
// Pointwise Kan extensions (Set-valued) via ends/coends for *finite* small categories.
// - Left Kan: (Lan_F H)(d) ≅ ∫^c D(Fc,d) × H(c)  (coend quotient via union-find)
// - Right Kan: (Ran_F H)(d) ≅ ∫_c H(c)^{D(d,Fc)}  (end as product-of-exponents with naturality filter)

// Import existing types to avoid conflicts
import { 
  SmallCategory
} from './category-to-nerve-sset';

// We need hom-set enumeration to compute ends/coends.
export interface HasHom<O, M> {
  hom: (x: O, y: O) => ReadonlyArray<M>;
}

// A Set-valued functor out of a category C
export interface SetFunctor<C_O, C_M> {
  obj: (c: C_O) => SetObj<any>;
  map: (u: C_M) => (x:any)=>any; // H(u): H(c) → H(c')
}

// Re-export SetObj type for convenience
export type SetObj<A> = { id: string; elems: ReadonlyArray<A>; eq: (x:A,y:A)=>boolean };

// Re-export Functor type for convenience  
export interface Functor<A_O, A_M, B_O, B_M> {
  Fobj: (a:A_O)=>B_O;
  Fmor: (m:A_M)=>B_M;
}

// -------------------------------------------------------------------------------------
// Left Kan extension Lan_F H : D → Set
// -------------------------------------------------------------------------------------

class UnionFind {
  private parent = new Map<string,string>();
  constructor(keys: Iterable<string>) { for (const k of keys) this.parent.set(k,k); }
  find(x: string): string { const p=this.parent.get(x)!; if (p===x) return x; const r=this.find(p); this.parent.set(x,r); return r; }
  union(a:string,b:string){ const ra=this.find(a), rb=this.find(b); if (ra!==rb) this.parent.set(ra,rb); }
}

type CoendNode<C_O, D_M> = { c:C_O; f:D_M; x:any };
type CoendClass<C_O, D_M> = { rep: CoendNode<C_O,D_M>; key:string };

export function LeftKan_Set<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M> & { objects: ReadonlyArray<C_O>; morphisms: ReadonlyArray<C_M> },
  D: SmallCategory<D_O, D_M> & HasHom<D_O, D_M> & { objects: ReadonlyArray<D_O> },
  F: Functor<C_O, C_M, D_O, D_M>,
  H: SetFunctor<C_O, C_M>,
  keyC: (c:C_O)=>string,
  keyDMor: (m:D_M)=>string
): { obj: (d:D_O)=> SetObj<CoendClass<C_O,D_M>>; map: (v:D_M)=> (cls:CoendClass<C_O,D_M>)=> CoendClass<C_O,D_M> } {

  const buildUF = (d: D_O) => {
    // Create nodes for ⊔_c Hom_D(Fc,d) × H(c)
    const nodes = new Map<string, CoendNode<C_O, D_M>>();
    for (const c of C.objects) {
      const hom = D.hom(F.Fobj(c), d);
      const Hc  = H.obj(c).elems;
      for (const f of hom) for (const x of Hc) {
        const key = `${keyC(c)}|f=${keyDMor(f)}|x=${JSON.stringify(x)}`;
        nodes.set(key, { c, f, x });
      }
    }
    const uf = new UnionFind(nodes.keys());

    // Impose identifications: for u:c→c', and h: F c'→ d, we equate
    //   (c, h∘F(u), x)  ~  (c', h, H(u)(x))
    for (const u of C.morphisms) {
      const c  = C.src(u) as C_O;
      const cp = C.dst(u) as C_O;
      const Hu = H.map(u);
      for (const h of D.hom(F.Fobj(cp), d)) {
        const f1 = D.comp(h, F.Fmor(u)); // F(u): Fc→Fcp;  h∘F(u): Fc→d
        const Huxs = H.obj(c).elems.map(x => ({ x, x2: Hu(x) }));
        for (const {x, x2} of Huxs) {
          const kLeft  = `${keyC(c)}|f=${keyDMor(f1)}|x=${JSON.stringify(x)}`;
          const kRight = `${keyC(cp)}|f=${keyDMor(h)}|x=${JSON.stringify(x2)}`;
          if (nodes.has(kLeft) && nodes.has(kRight)) uf.union(kLeft, kRight);
        }
      }
    }

    // Representatives per class
    const classes = new Map<string, CoendClass<C_O,D_M>>();
    for (const k of nodes.keys()) {
      const r = uf.find(k);
      if (!classes.has(r)) classes.set(r, { rep: nodes.get(k)!, key:r });
    }

    const normalize = (node: CoendNode<C_O,D_M>): CoendClass<C_O,D_M> => {
      const k = `${keyC(node.c)}|f=${keyDMor(node.f)}|x=${JSON.stringify(node.x)}`;
      const r = uf.find(k);
      return classes.get(r)!;
    };

    return { classes, normalize };
  };

  const obj = (d: D_O): SetObj<CoendClass<C_O,D_M>> => {
    const { classes } = buildUF(d);
    return { id:`Lan(F,H)(${String(d)})`, elems: [...classes.values()], eq:(a,b)=> a.key===b.key };
  };

  const map = (v: D_M) => (cls: CoendClass<C_O,D_M>): CoendClass<C_O,D_M> => {
    // (Lan F H)(v): class of (c, f:Fc→d, x) ↦ class of (c, v∘f:Fc→d', x)
    const dprime = D.dst(v);
    const { normalize } = buildUF(dprime);
    const { c, f, x } = cls.rep;
    return normalize({ c, f: D.comp(v, f), x });
  };

  return { obj, map };
}

// -------------------------------------------------------------------------------------
// Right Kan extension Ran_F H : D → Set
// -------------------------------------------------------------------------------------

type FuncAsMap<TDom, TCod> = Map<string, any> & { __dom: ReadonlyArray<TDom>; __cod: ReadonlyArray<TCod> };

function allFunctions<TDom, TCod>(
  dom: ReadonlyArray<TDom>,
  cod: ReadonlyArray<TCod>,
  keyDom: (d:TDom)=>string
): FuncAsMap<TDom,TCod>[] {
  // Enumerate all functions dom → cod (finite, exponential in |dom|).
  if (dom.length === 0) {
    const m = new Map() as FuncAsMap<TDom,TCod>;
    m.__dom = dom; m.__cod = cod;
    return [m];
  }
  const [d0, ...rest] = dom;
  if (!d0) return [];
  const rec = allFunctions(rest, cod, keyDom);
  const out: FuncAsMap<TDom,TCod>[] = [];
  for (const m of rec) {
    for (const c of cod) {
      const m2 = new Map(m) as FuncAsMap<TDom,TCod>;
      m2.set(keyDom(d0), c);
      m2.__dom = dom; m2.__cod = cod;
      out.push(m2);
    }
  }
  return out;
}

export function RightKan_Set<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M> & { objects: ReadonlyArray<C_O>; morphisms: ReadonlyArray<C_M> },
  D: SmallCategory<D_O, D_M> & HasHom<D_O, D_M> & { objects: ReadonlyArray<D_O> },
  F: Functor<C_O, C_M, D_O, D_M>,
  H: SetFunctor<C_O, C_M>,
  keyC: (c:C_O)=>string,
  keyDMor: (m:D_M)=>string
): { obj: (d:D_O)=> SetObj<Record<string, FuncAsMap<D_M,any>>>; map: (v:D_M)=> (family:Record<string,FuncAsMap<D_M,any>>)=> Record<string,FuncAsMap<D_M,any>> } {

  // Helper to build the end at a fixed d
  const buildEnd = (d:D_O) => {
    // For each c, the set of functions D(d, F c) → H(c)
    const perC_funcs: Record<string, FuncAsMap<D_M,any>[]> = {};
    const perC_domKeys: Record<string, string[]> = {};
    for (const c of C.objects) {
      const hom = D.hom(d, F.Fobj(c));
      const Hc  = H.obj(c).elems;
      const keyHom = (h:D_M)=> keyDMor(h);
      const funcs = allFunctions(hom, Hc, keyHom);
      perC_funcs[keyC(c)] = funcs;
      perC_domKeys[keyC(c)] = hom.map(keyHom);
    }

    // Cartesian product over objects to get a candidate family
    const keys = C.objects.map(keyC);
    const product: Record<string, FuncAsMap<D_M,any>>[] = [];
    const backtrack = (i:number, acc: Record<string, FuncAsMap<D_M,any>>) => {
      if (i===keys.length) { product.push({...acc}); return; }
      const k = keys[i];
      if (k && perC_funcs[k]) {
        for (const f of perC_funcs[k]) { acc[k]=f; backtrack(i+1, acc); }
      }
    };
    backtrack(0, {} as any);

    // Filter by naturality: for u:c→c', H(u) ∘ α_c = α_{c'} ∘ (F(u) ∘ -)
    const okFamilies = product.filter(fam => {
      return C.morphisms.every(u => {
        const c  = C.src(u) as C_O; const cp = C.dst(u) as C_O;
        const kc = keyC(c), kcp = keyC(cp);
        const alpha_c  = fam[kc];  // Map from D(d,Fc) to H(c) as Map keyed by keyDMor
        const alpha_cp = fam[kcp]; // Map from D(d,Fc') to H(c')
        if (!alpha_c || !alpha_cp) return false;
        const Hu = H.map(u);
        // For every g: d→F c, we need H(u)(α_c(g)) = α_{c'}(F(u)∘g)
        for (const g of D.hom(d, F.Fobj(c))) {
          const left  = Hu(alpha_c.get(keyDMor(g)));
          const right = alpha_cp.get(keyDMor( D.comp(F.Fmor(u), g) ));
          if (JSON.stringify(left) !== JSON.stringify(right)) return false;
        }
        return true;
      });
    });

    // Build SetObj out of the passing families
    const elems = okFamilies.map(f => f);
    const eq = (a:any,b:any) => JSON.stringify(a)===JSON.stringify(b);
    return { elems, eq };
  };

  const obj = (d:D_O): SetObj<Record<string, FuncAsMap<D_M,any>>> => {
    const { elems, eq } = buildEnd(d);
    return { id:`Ran(F,H)(${String(d)})`, elems, eq };
  };

  const map = (v:D_M) => (family: Record<string, FuncAsMap<D_M,any>>) => {
    // Precompose: α'_{c}(g) = α_c(g ∘ v)
    const dprime = D.dst(v);
    const result: Record<string, FuncAsMap<D_M,any>> = {};
    for (const c of C.objects) {
      const keyc = keyC(c);
      const alpha_c = family[keyc];
      if (!alpha_c) continue;
      const out = new Map() as FuncAsMap<D_M,any>;
      out.__dom = D.hom(dprime, F.Fobj(c));
      out.__cod = H.obj(c).elems;
      for (const g of out.__dom) {
        const gv = D.comp(g, v); // g ∘ v : d → F c
        out.set(keyDMor(g), alpha_c.get(keyDMor(gv)));
      }
      result[keyc] = out;
    }
    return result;
  };

  return { obj, map };
}

// -------------------------------------------------------------------------------------
// Tiny example helper (already used in the transport example)
// -------------------------------------------------------------------------------------

export function demoKanExample() {
  type CObj = "X" | "Y";

  // C: two objects X→Y
  const C: SmallCategory<CObj, {tag:"id",o:CObj} | {tag:"u"}> & { objects:CObj[]; morphisms: Array<{tag:"id",o:CObj}|{tag:"u"}> } = {
    objects: ["X","Y"],
    morphisms: [{tag:"id",o:"X"},{tag:"id",o:"Y"},{tag:"u"}],
    id: (o)=> ({tag:"id", o}),
    src: (m)=> m.tag==="id" ? m.o : "X",
    dst: (m)=> m.tag==="id" ? m.o : "Y",
    comp: (g,f) => {
      const s = (m:any)=> C.src(m), d=(m:any)=>C.dst(m);
      if (d(f)!==s(g)) throw new Error("C comp mismatch");
      if (f.tag==="id") return g;
      if (g.tag==="id") return f;
      // only u; composing u with ids gives u
      return {tag:"u"};
    }
  };

  // D: terminal category • with one object "*"
  type DObj = "*";
  type DM = {tag:"id"};
  const D: SmallCategory<DObj,DM> & HasHom<DObj,DM> & { objects:DObj[] } = {
    objects: ["*"],
    id: (_)=>({tag:"id"}),
    src: (_)=>"*",
    dst: (_)=>"*",
    comp: (_g,_f)=>({tag:"id"}),
    hom: (_x,_y)=> [ {tag:"id"} ]
  };

  // F: C → D (constant functor)
  const F: Functor<CObj, any, DObj, DM> = {
    Fobj: (_)=>"*",
    Fmor: (_)=>({tag:"id"})
  };

  // H: C → Set
  const set = <A>(id:string, xs:A[], eq:(a:A,b:A)=>boolean): SetObj<A> => ({ id, elems: xs, eq });
  const HX = set("HX",[ "x0", "x1" ], (a,b)=>a===b);
  const HY = set("HY",[ "y0" ], (a,b)=>a===b);
  const H: SetFunctor<CObj, any> = {
    obj: (c)=> c==="X" ? HX : HY,
    map: (u)=> (x:any)=> {
      if (u.tag==="id") return x;
      // u: X→Y, collapse both x0,x1 to y0
      return "y0";
    }
  };

  const keyC = (c:CObj)=>c;
  const keyDMor = (_:DM)=>"id";

  // Left Kan at *: coend quotient — should coequalize H(u): H(X)→H(Y)
  const Lan = LeftKan_Set(C, D, F, H, keyC, keyDMor);
  const LanStar = Lan.obj("*");
  // Expect a single element since both x0,x1 map to the same y0 through u
  console.log("[Lan] |Lan(F,H)(*)| =", LanStar.elems.length);
  console.log("[Lan] class reps =", LanStar.elems.map(c=>c.rep));

  // Right Kan at *: end = families (α_X, α_Y) with H(u)(α_X(id)) = α_Y(id)
  const Ran = RightKan_Set(C, D, F, H, keyC, keyDMor);
  const RanStar = Ran.obj("*");
  console.log("[Ran] elements (families count) =", RanStar.elems.length);
  console.log("[Ran] sample family =", RanStar.elems[0]);
}
