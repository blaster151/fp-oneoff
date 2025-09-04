import { Fix, In, Out, mapF } from "../types/adt-fix.js";

/** GADT-fold: same shape as cata but in a dedicated module. */
export type GAlgebra<F,A>   = (fa: F) => A;
export type GCoalgebra<F,A> = (a: A) => F;

export const gfold = <F,A>(alg: GAlgebra<F,A>) =>
  function go(fx: Fix<F>): A {
    const fa = Out(fx);
    const rec = mapF((child: Fix<F>) => go(child), fa);
    return alg(rec);
  };

/** gbuild: Church-style builder takes a consumer algebra and produces a result. */
export type GBuilder<F> = <A>(alg: GAlgebra<F,A>) => A;

/** Introduce a builder from a seed (usual anamorphism in Church clothing). */
export const gbuildFrom = <F,A>(coalg: GCoalgebra<F,A>) =>
  (a: A): GBuilder<F> =>
    <B>(alg: GAlgebra<F,B>) => {
      const loop = (s:A): B => alg(mapF(loop, coalg(s)));
      return loop(a);
    };

/** fold/build fusion: gfold(alg)(gfrom(a)) === gfrom(a)(alg) without intermediate Fix. */
export const gfoldBuild = <F,A>(alg: GAlgebra<F,A>) =>
  (builder: GBuilder<F>): A => builder(alg);