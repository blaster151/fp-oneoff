import type { FiniteRing } from "./Ring";
import type { RingHom } from "./RingHom";
import { asAbelian, FiniteAbGroup } from "../ab/AbGroup";
import { FiniteGroup } from "../group/Group";

/** Identity & composition reuse RingHom.ts helpers (re-export shape if desired). */

/** Product ring R×S with componentwise ops (has 1=(1,1), 0=(0,0)). */
export function productRing<A,B>(
  R: FiniteRing<A>, S: FiniteRing<B>
): FiniteRing<{a:A,b:B}> {
  const elems = R.elems.flatMap(a => S.elems.map(b => ({a,b})));
  const eq = (x:{a:A,b:B}, y:{a:A,b:B}) => R.eq(x.a,y.a) && S.eq(x.b,y.b);
  const add = (x:{a:A,b:B}, y:{a:A,b:B}) => ({ a: R.add(x.a,y.a), b: S.add(x.b,y.b) });
  const neg = (x:{a:A,b:B}) => ({ a: R.neg(x.a), b: S.neg(x.b) });
  const mul = (x:{a:A,b:B}, y:{a:A,b:B}) => ({ a: R.mul(x.a,y.a), b: S.mul(x.b,y.b) });
  const zero = { a:R.zero, b:S.zero };
  const one  = { a:R.one,  b:S.one  };
  return { elems, eq, add, zero, neg, mul, one, comm: (R.comm && S.comm) };
}

/** Projections and pairing for the product U.P. */
export function projections<A,B>(R: FiniteRing<A>, S: FiniteRing<B>) {
  const RS = productRing(R,S);
  return {
    RS,
    pi1: (x:{a:A,b:B}) => x.a,
    pi2: (x:{a:A,b:B}) => x.b
  };
}
export function pairHom<X,A,B>(
  X: FiniteRing<X>, R: FiniteRing<A>, S: FiniteRing<B>,
  f: (x:X)=>A, g: (x:X)=>B
) {
  return (x:X)=> ({ a:f(x), b:g(x) });
}

/** Forgetful functor U: Ring → Ab (underlying additive abelian group). */
export function forgetAdditive<A>(R: FiniteRing<A>): FiniteAbGroup<A> {
  // Build a FiniteGroup using additive structure; then asAbelian() brands it (addition is commutative).
  const G: FiniteGroup<A> = {
    elems: R.elems,
    eq: R.eq,
    op: R.add,
    id: R.zero,
    inv: R.neg
  };
  return asAbelian(G);
}