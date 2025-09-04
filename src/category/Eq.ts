/**
 * Equality witness Eq<A,B>.
 * - Provides cast A -> B
 * - Provides symmetry (Eq<B,A>)
 * - Provides composition/transitivity (Eq<A,C>)
 *
 * IMPORTANT: This is a *witness*, not a runtime proof system.
 * We use it to model the equality GADT (Eql) discussed in Ghani/Johann.
 */
export interface Eq<A, B> {
  readonly cast: (a: A) => B;
  readonly sym: () => Eq<B, A>;
  readonly andThen: <C>(next: Eq<B, C>) => Eq<A, C>;
}

/** Reflexivity: Eq<T,T> */
export const refl = <T>(): Eq<T, T> => {
  const self: Eq<T, T> = {
    cast: (x) => x,
    sym: () => self,
    andThen: <C>(n: Eq<T, C>) => n,
  };
  return self;
};

/** Compose Eq<A,B> and Eq<B,C> to get Eq<A,C>. */
export const compose = <A, B, C>(ab: Eq<A, B>, bc: Eq<B, C>): Eq<A, C> => ab.andThen(bc);

/**
 * Coerce value between equal types according to Eq witness.
 * Keep usage local to modeling Eql/kan-extension constructions.
 */
export const coerce = <A, B>(e: Eq<A, B>, a: A): B => e.cast(a);