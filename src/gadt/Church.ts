import { Fix, In, Out, mapF } from "../types/adt-fix.js";
import { GAlgebra, GBuilder } from "./Initial.js";

/** toChurch: Fix<F> -> GBuilder<F> */
export const toChurch = <F>(fx: Fix<F>): GBuilder<F> =>
  <A>(alg: GAlgebra<F,A>) => {
    const go = (t: Fix<F>): A => alg(mapF(go, Out(t)));
    return go(fx);
  };

/** fromChurch: GBuilder<F> -> Fix<F> (pick A=Fix<F>, alg=In) */
export const fromChurch = <F>(builder: GBuilder<F>): Fix<F> =>
  builder<Fix<F>>(In);