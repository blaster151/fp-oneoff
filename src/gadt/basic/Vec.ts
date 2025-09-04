/**
 * Length-indexed vectors Vec<N, A>
 *
 * Constructors (GADT view):
 *   VNil  : Vec<Z, A>
 *   VCons : A -> Vec<N, A> -> Vec<S<N>, A>
 *
 * Implementation: higher-order fixpoint with node-local higher-order fmap.
 */

import { HFix, Hin, Hout, withHMap, hmapH, hcata } from "../../higher/HFix";
import { Nat, Z, S, isZ, isS } from "./Nat";

/** Higher-order node family:
 *   VecF<G, A, N> =
 *     | { _t:"vnil";    n:Z;    aTy }                       -- no recursive positions
 *     | { _t:"vcons";   n:S<M>;  head:A; tail:G<M> }        -- recursive tail at index M
 */
export type VecF<G, A, N extends Nat> =
  | { _t:"vnil"; n: { tag:"Z" }; aTy?: undefined }
  | { _t:"vcons"; n: N; head: A; tail: G };

/** Build nodes with node-local higher-order fmap so hcata can traverse. */
const VNilF  = <G,A>(): VecF<G, A, any> =>
  withHMap<VecF<G, A, any>>({ _t:"vnil", n: { tag:"Z" } } as any, _nt => ({ _t:"vnil", n: { tag:"Z" } } as any));

const VConsF = <G,A,N extends Nat>(n:N, head:A, tail:G): VecF<G, A, N> =>
  withHMap<VecF<G, A, N>>({ _t:"vcons", n, head, tail } as any, (nt:(g:G)=>any) =>
    ({ _t:"vcons", n, head, tail: nt(tail) } as any)
  );

/** Carrier: Vec<N, A> */
export type Vec<N extends Nat, A> = HFix<VecF<any, A, N>, N>;

/** Smart constructors */
export const vnil = <A>(): Vec<typeof Z, A> =>
  Hin<VecF<any, A, any>, any>(VNilF(), Z);

export const vcons = <N extends Nat, A>(nS: N, head: A, tail: Vec<any, A>): Vec<N, A> => {
  if (!isS(nS)) throw new Error("vcons: index must be S n");
  return Hin<VecF<any, A, N>, N>(VConsF(nS, head, tail as any), nS);
};

/** Vector fold via hcata: give algebra returning R. */
export const foldVec = <A,R>(onNil: ()=>R, onCons:(head:A, r:R)=>R) =>
  hcata<VecF<R, A, Nat>, R>((t:any) =>
    t._t==="vnil" ? onNil()
                  : onCons(t.head, t.tail)
  );

/** Helpers */
export const length = <N extends Nat, A>(v: Vec<N, A>): number =>
  foldVec<A,number>(() => 0, (_h, r) => 1 + r)(v);

export const toArray = <N extends Nat, A>(v: Vec<N, A>): A[] =>
  foldVec<A,A[]>(() => [], (h, r) => [h, ...r])(v);