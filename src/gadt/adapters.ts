import { cata, ana, hylo } from "../types/adt-fix.js";
import { gfold, gbuildFrom, gfoldBuild } from "./Initial.js";
import { toChurch, fromChurch } from "./Church.js";

export const fold = gfold;                // alias for symmetry
export const buildFrom = gbuildFrom;
export const fusion = gfoldBuild;

export const toChurchFix = toChurch;
export const fromChurchBuilder = fromChurch;

// Opt-in "no intermediate" hylo (equals fusion on Church) for perf-minded users:
export const hyloChurch = <F,A,B>(alg:(f:F)=>B, coalg:(a:A)=>F) =>
  (a:A):B => buildFrom<F,A>(coalg)(a)(alg);