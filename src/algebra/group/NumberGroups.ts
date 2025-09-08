import type { Group } from "./Group";
import { add as qAdd, eq as qEq, neg as qNeg, zero as qZero, Rational, mul as qMul, fromBigInt } from "../../number/Rational";

// Integers under addition (modelled with number)
export const Zplus: Group<number> = {
  eq: (x, y) => x === y,
  op: (x, y) => x + y,
  id: 0,
  inv: x => -x,
  // infinite: no elements listing
};

// Rationals under addition
export const Qplus: Group<Rational> = {
  eq: qEq,
  op: qAdd,
  id: qZero,
  inv: qNeg,
};

// Automorphisms mentioned on the page:

// Aut(Z,+): identity and negation
export const autoZ_id = (x: number) => x;
export const autoZ_neg = (x: number) => -x;

// Aut(Q,+): scaling by nonzero q
export function autoQ_scale(q: Rational) {
  if (qEq(q, qZero)) throw new Error("scale must be nonzero");
  return (x: Rational) => qMul(q, x);
}

// Helpers to build GroupHom/GroupIso values for these maps (source/target plugged later)