// catkit-adjunction.ts
// General hom-set companions/conjoints in arbitrary small categories,
// natural transformations, adjunctions, and the mates correspondence.
// This extends the existing category theory foundation with adjunction theory.

import { eqJSON } from './eq';

// ---- Base: SmallCategory is assumed (from existing types). Re-declare minimal types here for isolation. ----
export interface SmallCategory<O, M> {
  id:  (o: O) => M;
  src: (m: M) => O;
  dst: (m: M) => O;
  comp:(g: M, f: M) => M; // g ∘ f
}

// ---- Functors & Naturality ----------------------------------------------------------------------

export interface Functor<A_O, A_M, B_O, B_M> {
  Fobj: (a: A_O) => B_O;
  Fmor: (m: A_M) => B_M; // preserves id/comp (not enforced here)
}

export function IdFunctor<O, M>(C: SmallCategory<O, M>): Functor<O, M, O, M> {
  return { Fobj: (o) => o, Fmor: (m) => m };
}

export function composeFunctors<A_O, A_M, B_O, B_M, C_O, C_M>(
  A: SmallCategory<A_O, A_M>,
  B: SmallCategory<B_O, B_M>,
  C: SmallCategory<C_O, C_M>,
  F: Functor<A_O, A_M, B_O, B_M>,
  G: Functor<B_O, B_M, C_O, C_M>
): Functor<A_O, A_M, C_O, C_M> {
  return {
    Fobj: (a) => G.Fobj(F.Fobj(a)),
    Fmor: (m) => G.Fmor(F.Fmor(m)),
  };
}

export interface Nat<A_O, A_M, B_O, B_M> {
  F: Functor<A_O, A_M, B_O, B_M>;
  G: Functor<A_O, A_M, B_O, B_M>;
  at: (a: A_O) => B_M; // component α_a : F(a) → G(a)
}

/** Check α naturality:  G(u) ∘ α_a = α_{a'} ∘ F(u)  for all u:a→a' */
export function checkNaturality<A_O, A_M, B_O, B_M>(
  A: { morphisms: ReadonlyArray<A_M>; src:(m:A_M)=>A_O; dst:(m:A_M)=>A_O },
  B: SmallCategory<B_O, B_M>,
  nt: Nat<A_O, A_M, B_O, B_M>
): boolean {
  const { F, G, at } = nt;
  return A.morphisms.every(u => {
    const a  = A.src(u), a2 = A.dst(u);
    const lhs = B.comp(G.Fmor(u), at(a));
    const rhs = B.comp(at(a2),    F.Fmor(u));
    const eq = eqJSON<any>();
    return eq(lhs, rhs);
  });
}

// ---- Adjunctions & Triangle Identities ----------------------------------------------------------

export interface Adjunction<A_O, A_M, B_O, B_M> {
  A: SmallCategory<A_O, A_M>;
  B: SmallCategory<B_O, B_M>;
  F: Functor<A_O, A_M, B_O, B_M>;       // left adjoint
  G: Functor<B_O, B_M, A_O, A_M>;       // right adjoint
  unit:  Nat<A_O, A_M, A_O, A_M>;       // η : Id_A ⇒ G∘F   (codomain functor should be G∘F)
  counit:Nat<B_O, B_M, B_O, B_M>;       // ε : F∘G ⇒ Id_B
}

/** Triangle identities:
 *  (1)  ε_{F a} ∘ F(η_a) = id_{F a}    in B
 *  (2)  G(ε_b) ∘ η_{G b} = id_{G b}    in A
 */
export function checkAdjunctionTriangles<A_O, A_M, B_O, B_M>(Adj: Adjunction<A_O, A_M, B_O, B_M>): boolean {
  const { A, B, F, G, unit, counit } = Adj;
  // (1) for each a in A, compare in B
  const ok1 = (A as any).objects
    ? (A as any).objects.every((a: A_O) => {
        const left  = B.comp(counit.at(F.Fobj(a)), F.Fmor(unit.at(a)));
        const right = B.id(F.Fobj(a));
        const eq = eqJSON<any>();
        return eq(left, right);
      })
    : true;

  // (2) for each b in B, compare in A
  const ok2 = (B as any).objects
    ? (B as any).objects.every((b: B_O) => {
        const left  = A.comp(G.Fmor(counit.at(b)), unit.at(G.Fobj(b)));
        const right = A.id(G.Fobj(b));
        const eq = eqJSON<any>();
        return eq(left, right);
      })
    : true;

  return ok1 && ok2;
}

// ---- Hom-set companions & conjoints (general; finite if hom enumerator provided) ---------------

export interface HasHom<B_O, B_M> {
  hom: (x: B_O, y: B_O) => ReadonlyArray<B_M>;
}

export interface Prof<A_O, A_M, B_O, B_M, T> {
  elems: (a: A_O, b: B_O) => ReadonlyArray<T>;
  lmap:  (u: A_M, b: B_O, t: T) => T; // contravariant in A
  rmap:  (a: A_O, v: B_M, t: T) => T; // covariant in B
}

export interface FiniteProf<A_O, A_M, B_O, B_M, T> extends Prof<A_O, A_M, B_O, B_M, T> {
  keyT: (t: T) => string;
  eqT:  (x: T, y: T) => boolean;
}

/** Companion profunctor Γ_F = B(F-, =): elements are B-morphisms F(a)→b. */
export function companionHomProf<A_O, A_M, B_O, B_M>(
  B: SmallCategory<B_O, B_M> & HasHom<B_O, B_M>,
  F: Functor<A_O, A_M, B_O, B_M>
): FiniteProf<A_O, A_M, B_O, B_M, B_M> {
  return {
    elems: (a, b) => B.hom(F.Fobj(a), b),
    lmap:  (u, b, m) => B.comp(m, F.Fmor(u)),
    rmap:  (_a, v, m) => B.comp(v, m)
  };
}

/** Conjoint profunctor Γ_F^† = B(=,F-): elements are B-morphisms b→F(a). */
export function conjointHomProf<A_O, A_M, B_O, B_M>(
  B: SmallCategory<B_O, B_M> & HasHom<B_O, B_M>,
  F: Functor<A_O, A_M, B_O, B_M>
): FiniteProf<A_O, A_M, B_O, B_M, B_M> {
  return {
    elems: (a, b) => B.hom(b, F.Fobj(a)),
    lmap:  (u, b, m) => B.comp(F.Fmor(u), m), // precompose in codomain of m
    rmap:  (_a, v, m) => B.comp(m, v)       // postcompose
  };
}

// ---- Mates correspondence (no coends required) -------------------------------------------------

/** Given an adjunction F ⊣ G and functors H: X→A, K: X→B, a mate pair:
 *  α : F∘H ⇒ K    corresponds to    α^♭ : H ⇒ G∘K
 *  α^♭_x = G(α_x) ∘ η_{H x}
 */
export function mateLeftToRight<X_O, X_M, A_O, A_M, B_O, B_M>(
  X: SmallCategory<X_O, X_M>,
  Adj: Adjunction<A_O, A_M, B_O, B_M>,
  H: Functor<X_O, X_M, A_O, A_M>,
  K: Functor<X_O, X_M, B_O, B_M>,
  alpha: Nat<X_O, X_M, B_O, B_M> // where alpha.F = F∘H, alpha.G = K
): Nat<X_O, X_M, A_O, A_M> {
  const { A, G, unit } = Adj;
  return {
    F: H,
    G: composeFunctors(X, Adj.B, Adj.A, K, G), // G∘K : X→A
    at: (x: X_O) => {
      const eta = unit.at(H.Fobj(x));            // Hx → G(F(Hx))
      const Galpha = G.Fmor(alpha.at(x));        // G(F(Hx)) → G(Kx)
      return A.comp(Galpha, eta);                // G(α_x) ∘ η_{Hx}
    }
  };
}

/** Conversely, β : H ⇒ G∘K  corresponds to  β^♯ : F∘H ⇒ K via
 *  β^♯_x = ε_{K x} ∘ F(β_x)
 */
export function mateRightToLeft<X_O, X_M, A_O, A_M, B_O, B_M>(
  X: SmallCategory<X_O, X_M>,
  Adj: Adjunction<A_O, A_M, B_O, B_M>,
  H: Functor<X_O, X_M, A_O, A_M>,
  K: Functor<X_O, X_M, B_O, B_M>,
  beta: Nat<X_O, X_M, A_O, A_M> // where beta.F = H, beta.G = G∘K
): Nat<X_O, X_M, B_O, B_M> {
  const { B, F, counit } = Adj;
  return {
    F: composeFunctors(X, Adj.A, Adj.B, H, F),   // F∘H : X→B
    G: K,
    at: (x: X_O) => {
      const Fbeta = F.Fmor(beta.at(x));          // F(Hx) → F(GKx)
      const eps   = counit.at(K.Fobj(x));        // F(GKx) → Kx
      return B.comp(eps, Fbeta);                 // ε_{Kx} ∘ F(β_x)
    }
  };
}

// ---- Tiny sanity example (discrete categories) --------------------------------------------------

type Id<X> = { tag:"id", x:X };
export function Disc<X>(objs: ReadonlyArray<X>) {
  const objects = objs;
  const morphisms = objs.map(x => ({ tag:"id", x } as Id<X>));
  const id = (o:X)=>({tag:"id", x:o} as Id<X>);
  const src = (m:Id<X>)=>m.x, dst = (m:Id<X>)=>m.x;
  const comp = (g:Id<X>, f:Id<X>) => (g.x===f.x? g : g); // only identities exist
  const C: SmallCategory<X, Id<X>> & { objects:X[]; morphisms:Id<X>[]; hom:(x:X,y:X)=>Id<X>[] } = {
    id, src, dst, comp, objects: objects.slice() as X[], morphisms: morphisms as Id<X>[],
    hom: (x,y)=> x===y ? [id(x)] : []
  };
  return C;
}
