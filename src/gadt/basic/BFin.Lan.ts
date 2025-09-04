/**
 * BFin constructor from Lan S g, where g b = Either<Unit, BFin b>.
 * Mirrors the paper: BFinCon :: Either Unit (BFin a) -> BFin (S a)
 * but in Lan-style: Lan S g (S a) ~ Either Unit (BFin a)
 */

import type { Lan1 } from "../../category/Lan";
import { Eq, refl } from "../../category/Eq";
import { Nat, Z, S, isS, pred } from "./Nat";
import { BFin, zero, succ } from "./BFin";

/** Either, Unit (very small local encodings to avoid external deps) */
export type Unit = { readonly unit: true };
export type Either<L, R> = { _t: "left"; left: L } | { _t: "right"; right: R };
export const Left  = <L,R>(l:L): Either<L,R> => ({ _t:"left", left:l });
export const Right = <L,R>(r:R): Either<L,R> => ({ _t:"right", right:r });

/** Our g b = Either<Unit, BFin b> */
export type GB<b extends Nat> = Either<Unit, BFin<b>>;

/** Given c = S a and a Lan S g c, produce a BFin c. */
export function bfinConViaLan<c extends Nat>(c: c, lan: Lan1<typeof S, GB<any>, c>): BFin<c> {
  if (!isS(c)) throw new Error("bfinConViaLan: c must be S a");
  // pick b = a and use Eq<S a, c> = refl
  const e: Eq<any, any> = refl<any>();
  const res = lan(e);
  if (res._t === "left") return zero(c) as any;
  return succ(c, res.right as any) as any;
}