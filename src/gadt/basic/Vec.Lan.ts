import type { Lan1 } from "../../category/Lan";
import { Eq, refl } from "../../category/Eq";
import { Nat, Z, S, isS } from "./Nat";
import { Vec, vnil, vcons } from "./Vec";

/** Pair helper */
export type Pair<X,Y> = { fst: X; snd: Y };
export const Pair = <X,Y>(fst:X, snd:Y): Pair<X,Y> => ({ fst, snd });

/** g b = Pair<A, Vec<b, A>> */
export type GV<b extends Nat, A> = Pair<A, Vec<b, A>>;

/** Given c = S n and a Lan value Lan S (GV _) c, build Vec<c, A> by cons'ing. */
export function vecConViaLan<A, C extends Nat>(c: C, lan: Lan1<typeof S, GV<any, A>, C>): Vec<C, A> {
  if (!isS(c)) throw new Error("vecConViaLan: index must be S n");
  const e: Eq<any, any> = refl<any>();
  const pair = lan(e);     // GV<n, A> = { fst: A; snd: Vec<n,A> }
  return vcons(c, pair.fst, pair.snd as any) as any;
}