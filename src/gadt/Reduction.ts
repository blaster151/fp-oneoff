/** Equality witness + existential packaging.
 * These are lightweight helpers to "reduce" GADT reasoning to equality + ∃.
 * In TS this is intentionally shallow (type-guided casts), but it lets us
 * express the same patterns the paper relies on.
 */

/** A ~ B, with safe(ish) casts plus symmetry & transitivity. */
export interface EqWit<A, B> {
  cast: (a: A) => B;
  sym: () => EqWit<B, A>;
  andThen: <C>(next: EqWit<B, C>) => EqWit<A, C>;
}

export const refl = <T>(): EqWit<T, T> => {
  const self: EqWit<T, T> = {
    cast: (x) => x,
    sym: () => self,
    andThen: <C>(n: EqWit<T, C>) => n,
  };
  return self;
};

export const compose = <A,B,C>(ab: EqWit<A,B>, bc: EqWit<B,C>): EqWit<A,C> => ab.andThen(bc);

/** ∃x. P x : package a value with a type witness; consumers can unpack. */
export type Exists<T> = { readonly _exists: true; readonly witness: any; readonly value: T };

export const pack = <X,T>(witness: X, value: T): Exists<T> => ({ _exists: true, witness, value });

export const unpack = <T, R>(ex: Exists<T>, k: (w: any, v: T) => R): R => k(ex.witness, ex.value);