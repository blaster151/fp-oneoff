import { Signature } from "../Signature";
import { Term } from "../Term";
import { buildSetMonadFromTheory, SetMonadFromTheory, FiniteSet } from "./LawvereMonad";

/** Kleisli category for the monad induced by (sig, equations). */
export function KleisliFromTheory(
  sig: Signature,
  equations: Array<{ lhs: Term; rhs: Term }>,
  maxDepth = 2
) {
  const T: SetMonadFromTheory = buildSetMonadFromTheory(sig, equations, maxDepth);

  /** Morphisms A ⇝ B are functions A → T(B) (terms over B-vars). */
  type Hom<A,B> = (a: A) => Term;

  /** Identity on A: a ↦ η_A(a). */
  function idK<A>(Aset: FiniteSet<A>): Hom<A,A> {
    const etaA = T.eta(Aset);
    return (a: A) => etaA(a);
  }

  /** Composition: (g ⋆ f)(a) = bind_BC(f(a), g) where g: B→T(C). */
  function composeK<A,B,C>(
    f: Hom<A,B>,
    g: Hom<B,C>
  ): (Aset: FiniteSet<A>, Bset: FiniteSet<B>, Cset: FiniteSet<C>) => Hom<A,C> {
    return (Aset: FiniteSet<A>, Bset: FiniteSet<B>, Cset: FiniteSet<C>) => {
      const bindBC = T.bind(Bset, Cset); // bind: T B × (B→T C) → T C
      return (a: A) => {
        const termInB = f(a);
        return bindBC(termInB, g);
      };
    };
  }

  return { T, idK, composeK };
}