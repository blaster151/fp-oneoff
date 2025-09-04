import { FiniteMonoid } from "../Monoid";
import { FiniteSet } from "../../../set/Set";

/** Free monoid on a finite set A: carrier = words over A; op = concatenation; e = [].
 * For practicality in tests, we parameterize by a wordBound to keep elems finite. */
export type Word<A> = A[];
export function FreeMonoid<A>(Aset: FiniteSet<A>, wordBound = 2): FiniteMonoid<Word<A>> {
  const eq = (x:Word<A>, y:Word<A>) =>
    x.length===y.length && x.every((xi,i)=> Aset.eq(xi, y[i]));
  const op = (x:Word<A>, y:Word<A>) => x.concat(y);
  const e: Word<A> = [];

  // enumerate words up to length wordBound
  const elems: Word<A>[] = [[]];
  function extend(w: Word<A>, k: number) {
    if (k === 0) return;
    for (const a of Aset.elems) {
      const w2 = w.concat([a]);
      elems.push(w2);
      extend(w2, k-1);
    }
  }
  extend([], wordBound);

  return { elems, eq, op, e };
}

/** Forgetful functor U: Mon → Set (just returns underlying carrier). */
export function U_underlying<A>(M: FiniteMonoid<A>): FiniteSet<A> {
  return { elems: M.elems, eq: M.eq };
}

/** Universal property: Given f: A → |M|, there exists unique monoid hom φ: F(A) → M s.t. φ∘η = f,
 * where η: A → |F(A)| sends a ↦ [a]. */
export function liftToMonoidHom<A,B>(
  Aset: FiniteSet<A>, M: FiniteMonoid<B>, f: (a:A)=>B
) {
  const F = FreeMonoid(Aset);
  const eta = (a:A)=> [a] as Word<A>;
  const phi = (w: Word<A>) => {
    // interpret word via f and monoid op
    let acc = M.e;
    for (const a of w) acc = M.op(acc, f(a));
    return acc;
  };
  return { F, eta, phi };
}