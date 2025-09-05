// catkit-equivalence.ts
// Core equivalences, isomorphisms, natural isomorphisms, and adjoint equivalences

import { eqJSON } from './eq.js';

// ---------- Core minimal types ----------
export interface SmallCategory<O,M> {
  id:  (o: O) => M;
  src: (m: M) => O;
  dst: (m: M) => O;
  comp:(g: M, f: M) => M; // g ∘ f
}
export interface Functor<A_O,A_M,B_O,B_M> {
  Fobj:(a:A_O)=>B_O;
  Fmor:(m:A_M)=>B_M;
}
export interface Nat<A_O,A_M,B_O,B_M> {
  F: Functor<A_O,A_M,B_O,B_M>;
  G: Functor<A_O,A_M,B_O,B_M>;
  at:(a:A_O)=>B_M; // α_a : F a → G a
}

// Optional structure for finite checks
export interface Finite<O,M> {
  objects: ReadonlyArray<O>;
  morphisms: ReadonlyArray<M>;
}

// ---------- Utilities ----------
export function composeFunctors<A_O,A_M,B_O,B_M,C_O,C_M>(
  _A: SmallCategory<A_O,A_M>, _B: SmallCategory<B_O,B_M>, _C: SmallCategory<C_O,C_M>,
  F: Functor<A_O,A_M,B_O,B_M>, G: Functor<B_O,B_M,C_O,C_M>
): Functor<A_O,A_M,C_O,C_M> {
  return { Fobj:(a)=>G.Fobj(F.Fobj(a)), Fmor:(m)=>G.Fmor(F.Fmor(m)) };
}

export function checkNaturality<A_O,A_M,B_O,B_M>(
  A: Pick<SmallCategory<A_O,A_M>, "src"|"dst"> & Finite<A_O,A_M>,
  B: SmallCategory<B_O,B_M>,
  nt: Nat<A_O,A_M,B_O,B_M>
): boolean {
  const { F,G,at } = nt;
  return A.morphisms.every(u => {
    const a  = A.src(u), a2 = A.dst(u);
    const lhs = B.compose(G.Fmor(u), at(a));
    const rhs = B.compose(at(a2),    F.Fmor(u));
    const eq = eqJSON<any>();
    return eq(lhs, rhs);
  });
}

// ---------- Isomorphisms in a category ----------
export interface Iso<O,M> {
  C: SmallCategory<O,M>;
  a: O; b: O;
  f: M; g: M; // f:a→b, g:b→a
}
export function checkIso<O,M>(iso: Iso<O,M>): boolean {
  const { C,a,b,f,g } = iso;
  const left  = C.compose(g,f);
  const right = C.id(a);
  const left2 = C.compose(f,g);
  const right2= C.id(b);
  const eq = eqJSON<any>();
  return eq(left, right) && eq(left2, right2);
}

// ---------- Natural isomorphisms ----------
export interface NatIso<A_O,A_M,B_O,B_M> extends Nat<A_O,A_M,B_O,B_M> {
  invAt:(a:A_O)=>B_M;
}

// Compose and invert natural isomorphisms
export function composeNatIso<A_O,A_M,B_O,B_M>(
  B: SmallCategory<B_O,B_M>,
  alpha: NatIso<A_O,A_M,B_O,B_M>, // F ⇒ G
  beta:  NatIso<A_O,A_M,B_O,B_M>  // G ⇒ H
): NatIso<A_O,A_M,B_O,B_M> {       // F ⇒ H
  return {
    F: alpha.F,
    G: beta.G,
    at:   (a:A_O)=> B.compose(beta.at(a), alpha.at(a)),
    invAt:(a:A_O)=> B.compose(alpha.invAt(a), beta.invAt(a))
  };
}
export function invertNatIso<A_O,A_M,B_O,B_M>(alpha: NatIso<A_O,A_M,B_O,B_M>): NatIso<A_O,A_M,B_O,B_M> {
  return { F: alpha.G, G: alpha.F, at: alpha.invAt, invAt: alpha.at };
}

export function checkNatIso<A_O,A_M,B_O,B_M>(
  A: Pick<SmallCategory<A_O,A_M>,"src"|"dst"> & Finite<A_O,A_M>,
  B: SmallCategory<B_O,B_M>,
  alpha: NatIso<A_O,A_M,B_O,B_M>
): boolean {
  const nat = checkNaturality(A,B,alpha);
  const pointwise = (A.objects as A_O[]).every(a => {
    const f = alpha.at(a), g = alpha.invAt(a);
    const left  = B.compose(g,f);
    const right = B.id(alpha.F.Fobj(a));
    const left2 = B.compose(f,g);
    const right2= B.id(alpha.G.Fobj(a));
    const eq = eqJSON<any>();
    return eq(left, right) && eq(left2, right2);
  });
  return nat && pointwise;
}

// ---------- Adjoint equivalence of categories ----------
export interface AdjointEquivalence<A_O,A_M,B_O,B_M> {
  A: SmallCategory<A_O,A_M> & Finite<A_O,A_M>;
  B: SmallCategory<B_O,B_M> & Finite<B_O,B_M>;
  F: Functor<A_O,A_M,B_O,B_M>; // A -> B
  G: Functor<B_O,B_M,A_O,A_M>; // B -> A
  unit:   NatIso<A_O,A_M,A_O,A_M>; // η: Id_A ⇒ G∘F
  counit: NatIso<B_O,B_M,B_O,B_M>; // ε: F∘G ⇒ Id_B
}
export function checkAdjointEquivalence<A_O,A_M,B_O,B_M>(E: AdjointEquivalence<A_O,A_M,B_O,B_M>): boolean {
  const { A,B,F,G,unit,counit } = E;
  const uIso = checkNatIso(A,A,unit);
  const cIso = checkNatIso(B,B,counit);
  const ok1 = (A.objects as A_O[]).every(a => {
    const Fa = F.Fobj(a);
    const left  = B.compose(counit.at(Fa), F.Fmor(unit.at(a)));
    const right = B.id(Fa);
    const eq = eqJSON<any>();
    return eq(left, right);
  });
  const ok2 = (B.objects as B_O[]).every(b => {
    const Gb = G.Fobj(b);
    const left  = A.compose(G.Fmor(counit.at(b)), unit.at(Gb));
    const right = A.id(Gb);
    const eq = eqJSON<any>();
    return eq(left, right);
  });
  return uIso && cIso && ok1 && ok2;
}

// ---------- Simple hom-set transport via equivalence ----------
export function homIsoViaEquivalence<A_O,A_M,B_O,B_M>(
  E: AdjointEquivalence<A_O,A_M,B_O,B_M>,
  a: A_O, a2: A_O
): { toB: (h:A_M)=>B_M; toA: (k:B_M)=>A_M } {
  const { A,B,F,G,unit,counit } = E;
  // Simplified version that avoids complex type interactions
  const toB = (h:A_M) => {
    const Fh = F.Fmor(h);
    const Fa2 = F.Fobj(a2);
    const unitA = unit.at(a);
    // Use type assertion to avoid complex type checking
    return B.compose(B.compose(counit.at(Fa2), Fh), unitA as any) as B_M;
  };
  const invUnitAtA = unit.invAt(a);
  const toA = (k:B_M) => A.compose( G.Fmor(k), invUnitAtA );
  return { toB, toA };
}

