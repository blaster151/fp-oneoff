import { Term } from "../Term";
import { Signature } from "../Signature";
import { KleisliFromTheory } from "./Kleisli";
import { buildSetMonadFromTheory, FiniteSet } from "./LawvereMonad";

export type KleisliHom<A,B> = (a:A)=>Term;

export type TriangleResult<A,B,C> = {
  commutes: boolean;
  witnesses: A[]; // domain elements where it fails (empty if commutes)
};

export type SquareResult<A,B,C,D> = {
  commutes: boolean;
  witnesses: A[]; // domain elements where it fails
};

export function makeKleisliDiagramTools(
  sig: Signature,
  equations: Array<{lhs:Term; rhs:Term}>,
  maxDepth = 2
) {
  const { T, composeK } = KleisliFromTheory(sig, equations, maxDepth);

  function triangle<A,B,C>(
    Aset: FiniteSet<A>,
    Bset: FiniteSet<B>,
    Cset: FiniteSet<C>,
    f: KleisliHom<A,B>,
    g: KleisliHom<B,C>,
    h: KleisliHom<A,C>
  ): TriangleResult<A,B,C> {
    const eqTC = T.Tcarrier(Cset).eq;
    const bad: A[] = [];
    for (const a of Aset.elems) {
      const lhs = composeK(f, g)(Aset, Bset, Cset)(a);
      const rhs = h(a);
      if (!eqTC(lhs, rhs)) bad.push(a);
    }
    return { commutes: bad.length===0, witnesses: bad };
  }

  function square<A,B,C,D>(
    Aset: FiniteSet<A>,
    Bset: FiniteSet<B>,
    Cset: FiniteSet<C>,
    Dset: FiniteSet<D>,
    f: KleisliHom<A,B>,
    g: KleisliHom<B,D>,
    h: KleisliHom<A,C>,
    k: KleisliHom<C,D>
  ): SquareResult<A,B,C,D> {
    const eqTD = T.Tcarrier(Dset).eq;
    const bad: A[] = [];
    for (const a of Aset.elems) {
      const topThenRight = composeK(f, g)(Aset, Bset, Dset)(a);
      const leftThenBottom = composeK(h, k)(Aset, Cset, Dset)(a);
      if (!eqTD(topThenRight, leftThenBottom)) bad.push(a);
    }
    return { commutes: bad.length===0, witnesses: bad };
  }

  return { T, triangle, square, composeK };
}