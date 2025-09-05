import type { FiniteRing } from "./Ring";
import type { RingHom, compose, id } from "./RingHom";
import { FiniteAbGroup } from "../ab/AbGroup";
import { PairingScheme, tupleScheme } from "../group/pairing/PairingScheme";

/** Category Ring: objects are finite rings, morphisms are ring homomorphisms */

/** Zero morphism: x ↦ 0_S */
export function zero<A,B>(R: FiniteRing<A>, S: FiniteRing<B>): RingHom<A,B> {
  return { source: R, target: S, f: (_:A)=> S.zero };
}

/** Product ring: cartesian product with componentwise operations */
export function productRing<A,B>(
  R: FiniteRing<A>,
  S: FiniteRing<B>
): FiniteRing<{a:A,b:B}> {
  const scheme = tupleScheme<A,B>();
  const elems: {a:A,b:B}[] = [];
  for (const a of R.elems) {
    for (const b of S.elems) {
      elems.push(scheme.pair(a, b));
    }
  }

  const eq = (x:{a:A,b:B}, y:{a:A,b:B}) => R.eq(scheme.left(x), scheme.left(y)) && S.eq(scheme.right(x), scheme.right(y));
  const add = (x:{a:A,b:B}, y:{a:A,b:B}): {a:A,b:B} => scheme.pair(R.add(scheme.left(x), scheme.left(y)), S.add(scheme.right(x), scheme.right(y)));
  const neg = (x:{a:A,b:B}): {a:A,b:B} => scheme.pair(R.neg(scheme.left(x)), S.neg(scheme.right(x)));
  const mul = (x:{a:A,b:B}, y:{a:A,b:B}): {a:A,b:B} => scheme.pair(R.mul(scheme.left(x), scheme.left(y)), S.mul(scheme.right(x), scheme.right(y)));
  const zero = scheme.pair(R.zero, S.zero);
  const one = scheme.pair(R.one, S.one);

  return { elems, eq, add, zero, neg, mul, one, comm: R.comm && S.comm };
}

/** Projections from product ring */
export function projections<A,B>(
  R: FiniteRing<A>,
  S: FiniteRing<B>
): { p1: RingHom<{a:A,b:B},A>, p2: RingHom<{a:A,b:B},B> } {
  const RS = productRing(R, S);
  const scheme = tupleScheme<A,B>();
  const p1: RingHom<{a:A,b:B},A> = { source: RS, target: R, f: (o:{a:A,b:B})=> scheme.left(o) };
  const p2: RingHom<{a:A,b:B},B> = { source: RS, target: S, f: (o:{a:A,b:B})=> scheme.right(o) };
  return { p1, p2 };
}

/** Universal property of product ring: for f:X→R and g:X→S, unique ⟨f,g⟩:X→R×S */
export function productLift<X,A,B>(
  X: FiniteRing<X>,
  R: FiniteRing<A>,
  S: FiniteRing<B>,
  f: RingHom<X,A>,
  g: RingHom<X,B>
): { RS: FiniteRing<{a:A,b:B}>, pair: RingHom<X,{a:A,b:B}> } {
  const RS = productRing(R, S);
  const scheme = tupleScheme<A,B>();
  const pair: RingHom<X,{a:A,b:B}> = { source: X, target: RS, f: (x:X)=> scheme.pair(f.f(x), g.f(x)) };
  return { RS, pair };
}

/** Forgetful functor Ring → Ab: forget multiplication, keep addition */
export function forgetfulToAb<A>(R: FiniteRing<A>): FiniteAbGroup<A> {
  return {
    elems: R.elems,
    eq: R.eq,
    op: R.add,
    id: R.zero,
    inv: R.neg
  };
}

/** Check that product ring's additive group equals direct sum of additive groups */
export function productRingAdditiveGroup<A,B>(
  R: FiniteRing<A>,
  S: FiniteRing<B>
): boolean {
  const RS = productRing(R, S);
  const AbRS = forgetfulToAb(RS);
  const AbR = forgetfulToAb(R);
  const AbS = forgetfulToAb(S);
  const scheme = tupleScheme<A,B>();
  
  // Check that the additive operations match
  for (const x of RS.elems) for (const y of RS.elems) {
    const sum = RS.add(x, y);
    const expected = scheme.pair(AbR.op(scheme.left(x), scheme.left(y)), AbS.op(scheme.right(x), scheme.right(y)));
    if (!AbRS.eq(sum, expected)) return false;
  }
  return true;
}