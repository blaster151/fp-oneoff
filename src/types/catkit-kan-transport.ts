// catkit-kan-transport.ts
// Transporting pointwise Kan extensions along an equivalence D ≃ D'.
// We produce Set-valued natural isomorphisms:
//   (Lan_{K∘F} H)   ≅  (Lan_F H) ∘ G
//   (Ran_{K∘F} H)   ≅  (Ran_F H) ∘ G
// where E = (K : D→D', G : D'→D, η : Id_D ⇒ G∘K, ε : K∘G ⇒ Id_{D'}) is an adjoint equivalence.
//
// Requires:
//  - catkit-kan.ts  (LeftKan_Set, RightKan_Set, SetFunctor, SetObj, SmallCategory, Functor, HasHom)
//  - catkit-equivalence.ts (AdjointEquivalence, NatIso)

import {
  Functor, HasHom, SetFunctor,
  LeftKan_Set, RightKan_Set
} from "./catkit-kan.js";
import { eqJSON } from './eq.js';

// Helper for generating unique keys from values
const keyFromValue = (x: unknown): string => JSON.stringify(x);
import { SmallCategory } from "./category-to-nerve-sset.js";
import {
  AdjointEquivalence
} from "./catkit-equivalence.js";

// ---------- Set-valued natural isomorphisms ----------

export interface SetNat<O,M> {
  F: SetFunctor<O,M>;
  G: SetFunctor<O,M>;
  at:   (o:O) => (x:any)=>any;
}
export interface SetNatIso<O,M> extends SetNat<O,M> {
  invAt:(o:O) => (y:any)=>any;
}
export function checkSetNatIso<O,M>(
  D: SmallCategory<O,M> & { objects: ReadonlyArray<O>; morphisms: ReadonlyArray<M> },
  nat: SetNatIso<O,M>
): boolean {
  const { F, G, at, invAt } = nat;
  // Pointwise bijectivity
  const bij = D.objects.every((o: any) => {
    const f = at(o), g = invAt(o);
    const X = F.obj(o).elems;
    const Y = G.obj(o).elems;
    const eq = eqJSON<any>();
    const gf = X.every(x => eq(g(f(x)), x));
    const fg = Y.every(y => eq(f(g(y)), y));
    return gf && fg;
  });
  if (!bij) return false;

  // Naturality: for every m:o→o',  G(m) ∘ α_o = α_{o'} ∘ F(m)
  const natOK = D.morphisms.every((m: any) => {
    const o = D.src(m), o2 = D.dst(m);
    const Fm = F.map(m), Gm = G.map(m);
    const a  = at(o),    a2 = at(o2);
    return F.obj(o).elems.every(x => {
      const lhs = Gm(a(x));
      const rhs = a2(Fm(x));
      const eq = eqJSON<any>();
      return eq(lhs, rhs);
    });
  });
  return natOK;
}

// ---------- Precompose a SetFunctor along a functor G : D' → D ----------
export function precomposeSetFunctor<Dp_O,Dp_M,D_O,D_M>(
  _Dp: SmallCategory<Dp_O,Dp_M>,
  G : Functor<Dp_O,Dp_M,D_O,D_M>,
  F : SetFunctor<D_O,D_M>
): SetFunctor<Dp_O,Dp_M> {
  return {
    obj: (d: Dp_O) => F.obj(G.Fobj(d)),
    map: (m: Dp_M) => F.map(G.Fmor(m))
  };
}

// ---------- Internal (copy of coend normalizer used for Lan) ----------

class UnionFind {
  private parent = new Map<string,string>();
  constructor(keys: Iterable<string>) { for (const k of keys) this.parent.set(k,k); }
  find(x: string): string { const p=this.parent.get(x)!; if (p===x) return x; const r=this.find(p); this.parent.set(x,r); return r; }
  union(a:string,b:string){ const ra=this.find(a), rb=this.find(b); if (ra!==rb) this.parent.set(ra,rb); }
}

type CoendNode<C_O, D_M> = { c:C_O; f:D_M; x:any };
type CoendClass<C_O, D_M> = { rep: CoendNode<C_O,D_M>; key:string };

function classifyLeftKan<C_O, C_M, D_O, D_M>(
  C: SmallCategory<C_O, C_M> & { objects: ReadonlyArray<C_O>; morphisms: ReadonlyArray<C_M> },
  D: SmallCategory<D_O, D_M> & HasHom<D_O, D_M> & { objects: ReadonlyArray<D_O> },
  F: Functor<C_O, C_M, D_O, D_M>,
  H: SetFunctor<C_O, C_M>,
  keyC: (c:C_O)=>string,
  keyDMor: (m:D_M)=>string,
  d: D_O
){
  const nodes = new Map<string, CoendNode<C_O, D_M>>();
  for (const c of C.objects) {
    for (const f of D.hom(F.Fobj(c), d)) {
      for (const x of H.obj(c).elems) {
        const k = `${keyC(c)}|f=${keyDMor(f)}|x=${keyFromValue(x)}`;
        nodes.set(k, { c, f, x });
      }
    }
  }
  const uf = new UnionFind(nodes.keys());
  for (const u of C.morphisms) {
    const c = C.src(u) as C_O, cp = C.dst(u) as C_O;
    const Hu = H.map(u);
    for (const h of D.hom(F.Fobj(cp), d)) {
      const f1 = D.compose(h, F.Fmor(u));
      for (const x of H.obj(c).elems) {
        const x2 = Hu(x);
        const kL = `${keyC(c)}|f=${keyDMor(f1)}|x=${keyFromValue(x)}`;
        const kR = `${keyC(cp)}|f=${keyDMor(h)}|x=${keyFromValue(x2)}`;
        if (nodes.has(kL) && nodes.has(kR)) uf.union(kL,kR);
      }
    }
  }
  const classes = new Map<string, CoendClass<C_O,D_M>>();
  for (const k of nodes.keys()) {
    const r = uf.find(k);
    if (!classes.has(r)) classes.set(r, { rep: nodes.get(k)!, key:r });
  }
  const normalize = (node: CoendNode<C_O,D_M>): CoendClass<C_O,D_M> => {
    const k = `${keyC(node.c)}|f=${keyDMor(node.f)}|x=${keyFromValue(node.x)}`;
    const r = uf.find(k);
    return classes.get(r)!;
  };
  return { classes, normalize };
}

// ---------- Transport isos ----------

export function transportLeftKanAlongEquivalence<C_O,C_M,D_O,D_M,Dp_O,Dp_M>(
  C: SmallCategory<C_O,C_M> & { objects:ReadonlyArray<C_O>; morphisms:ReadonlyArray<C_M> },
  D: SmallCategory<D_O,D_M> & HasHom<D_O,D_M> & { objects:ReadonlyArray<D_O>; morphisms:ReadonlyArray<D_M> },
  Dp: SmallCategory<Dp_O,Dp_M> & HasHom<Dp_O,Dp_M> & { objects:ReadonlyArray<Dp_O>; morphisms:ReadonlyArray<Dp_M> },
  E: AdjointEquivalence<D_O,D_M,Dp_O,Dp_M>,  // K : D→D', G : D'→D
  F: Functor<C_O,C_M,D_O,D_M>,
  H: SetFunctor<C_O,C_M>,
  keyC: (c:C_O)=>string,
  keyDMor: (m:D_M)=>string,
  keyDMorP:(m:Dp_M)=>string
){
  // Left Kans
  const LanD  = LeftKan_Set(C, D,  F,           H, keyC, keyDMor);
  const KF    = { Fobj:(a:C_O)=> E.F.Fobj(F.Fobj(a)), Fmor:(u:C_M)=> E.F.Fmor(F.Fmor(u)) } as Functor<C_O,C_M,Dp_O,Dp_M>;
  const LanDp = LeftKan_Set(C, Dp, KF,          H, keyC, keyDMorP);
  const LanD_pre = precomposeSetFunctor(Dp, E.G, LanD); // (Lan_F H) ∘ G : D'→Set

  // α_{d'} : (Lan_{K∘F} H)(d') → (Lan_F H)(G d')
  const at = (dP: Dp_O) => {
    const d = E.G.Fobj(dP);
    const classifyD  = classifyLeftKan(C,D,F,H,keyC,keyDMor, d);
    return (cls:any) => {
      const { c, f:fp, x } = cls.rep as { c:C_O; f:Dp_M; x:any };
      // map f' : K(Fc)→d'  to  f : Fc → G(d')
      const f_in_D = E.G.Fmor(fp);               // G(f') : G(K Fc) → G(d')
      const etaFc  = E.unit.at(F.Fobj(c));       // Fc → G(K Fc)
      const f = D.compose(f_in_D, etaFc);           // Fc → G(d')
      return classifyD.normalize({ c, f, x });
    };
  };

  // α^{-1}_{d'} : (Lan_F H)(G d') → (Lan_{K∘F} H)(d')
  const invAt = (dP: Dp_O) => {
    const classifyDp = classifyLeftKan(C,Dp,KF,H,keyC,keyDMorP, dP);
    return (cls:any) => {
      const { c, f, x } = cls.rep as { c:C_O; f:D_M; x:any };
      // map f : Fc → G(d')  to  f' : K(Fc) → d'
      const Kf  = E.F.Fmor(f);            // K(f) : K(Fc) → K(G d')
      const eps = E.counit.at(dP);        // ε_{d'} : K(G d') → d'
      const fp  = Dp.compose(eps, Kf);       // K(Fc) → d'
      return classifyDp.normalize({ c, f: fp, x });
    };
  };

  const iso: SetNatIso<Dp_O,Dp_M> = {
    F: LanDp, G: LanD_pre, at, invAt
  };
  return { LanDp, LanD_pre, iso };
}

export function transportRightKanAlongEquivalence<C_O,C_M,D_O,D_M,Dp_O,Dp_M>(
  C: SmallCategory<C_O,C_M> & { objects:ReadonlyArray<C_O>; morphisms:ReadonlyArray<C_M> },
  D: SmallCategory<D_O,D_M> & HasHom<D_O,D_M> & { objects:ReadonlyArray<D_O>; morphisms:ReadonlyArray<D_M> },
  Dp: SmallCategory<Dp_O,Dp_M> & HasHom<Dp_O,Dp_M> & { objects:ReadonlyArray<Dp_O>; morphisms:ReadonlyArray<Dp_M> },
  E: AdjointEquivalence<D_O,D_M,Dp_O,Dp_M>,
  F: Functor<C_O,C_M,D_O,D_M>,
  H: SetFunctor<C_O,C_M>,
  keyC: (c:C_O)=>string,
  keyDMor: (m:D_M)=>string,
  keyDMorP:(m:Dp_M)=>string
){
  // Right Kans
  const RanD  = RightKan_Set(C, D,  F,           H, keyC, keyDMor);
  const KF    = { Fobj:(a:C_O)=> E.F.Fobj(F.Fobj(a)), Fmor:(u:C_M)=> E.F.Fmor(F.Fmor(u)) } as Functor<C_O,C_M,Dp_O,Dp_M>;
  const RanDp = RightKan_Set(C, Dp, KF,          H, keyC, keyDMorP);
  const RanD_pre = precomposeSetFunctor(Dp, E.G, RanD); // (Ran_F H) ∘ G

  // α_{d'} : (Ran_{K∘F} H)(d') → (Ran_F H)(G d')
  // α_c(g) = α'_c( ε^{-1}_{d'} ∘ K(g) )
  const at = (dP: Dp_O) => {
    const epsInv = E.counit.invAt(dP); // d' → K(G d')
    return (familyP: Record<string, Map<string,any>>) => {
      const out: Record<string, Map<string,any>> = {};
      for (const c of C.objects) {
        const kc = keyC(c);
        const alphaP = familyP[kc]; // map keyed by keyDMorP on D'(d', K F c)
        if (!alphaP) continue;
        const mOut = new Map<string,any>();
        // For each g : G d' → F c in D, compute h' = ε^{-1}_{d'} ∘ K(g)
        for (const g of D.hom(E.G.Fobj(dP), F.Fobj(c))) {
          const Kg   = E.F.Fmor(g);               // K(g) : K(G d') → K(F c)
          const hP   = Dp.compose(Kg, epsInv);       // d' → K(F c)
          const keyH = keyDMorP(hP);
          mOut.set(keyDMor(g), alphaP.get(keyH));
        }
        out[kc] = mOut;
      }
      return out;
    };
  };

  // α^{-1}_{d'} : (Ran_F H)(G d') → (Ran_{K∘F} H)(d')
  // α'_c(h) = α_c( η^{-1}_{Fc} ∘ G(h) )
  const invAt = (dP: Dp_O) => {
    return (family: Record<string, Map<string,any>>) => {
      const out: Record<string, Map<string,any>> = {};
      for (const c of C.objects) {
        const kc = keyC(c);
        const alpha = family[kc]; // map keyed by keyDMor on D(G d', F c)
        if (!alpha) continue;
        const mOut = new Map<string,any>();
        const etaInvFc = E.unit.invAt(F.Fobj(c));  // G(K(F c)) → F c
        for (const h of Dp.hom(dP, E.F.Fobj(F.Fobj(c)))) {
          const Gh   = E.G.Fmor(h);                 // G(h): G d' → G K F c
          const g    = D.compose(etaInvFc, Gh);        // G d' → F c
          mOut.set(keyDMorP(h), alpha.get(keyDMor(g)));
        }
        out[kc] = mOut;
      }
      return out;
    };
  };

  const iso: SetNatIso<Dp_O,Dp_M> = { F: RanDp, G: RanD_pre, at, invAt };
  return { RanDp, RanD_pre, iso };
}
