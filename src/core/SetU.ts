// GOAL: Universe-parametric sets and functions.
// We keep this minimal to support building GrpU and CatU on top.

import { UniverseId, UniverseOps, Small } from "../size/Universe";

export type SetU<U extends UniverseId, A> = {
  readonly carrier: Small<U, A[] | ReadonlyArray<A>>; // finite for now
  readonly Uops: UniverseOps<U>;
};

export type FuncU<U extends UniverseId, A, B> = {
  readonly dom: SetU<U, A>;
  readonly cod: SetU<U, B>;
  readonly map: (a: A) => B; // total
};

// Constructors
export const finiteSet = <U extends UniverseId, A>(Uops: UniverseOps<U>, xs: A[]): SetU<U, A> => ({
  carrier: Uops.toSmall(xs),
  Uops,
});

export const total = <U extends UniverseId, A, B>(
  dom: SetU<U, A>, cod: SetU<U, B>, f: (a: A) => B
): FuncU<U, A, B> => ({ dom, cod, map: f });

// Composition / id
export const idU = <U extends UniverseId, A>(X: SetU<U, A>): FuncU<U, A, A> =>
  total(X, X, x => x);

export const compU = <U extends UniverseId, A, B, C>(
  g: FuncU<U, B, C>, f: FuncU<U, A, B>
): FuncU<U, A, C> => {
  if (f.cod !== g.dom) throw new Error("domain/codomain mismatch");
  return total(f.dom, g.cod, x => g.map(f.map(x)));
};
