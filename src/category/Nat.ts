/**
 * Natural transformation between endofunctors F and G on Set.
 * Read: for all types A, a function F<A> -> G<A>.
 *
 * In code: Nat<F,G> is a generic function taking an F<A> and returning a G<A>.
 *
 * IMPORTANT: This is a *type encoding*. We do not introspect functor laws at runtime.
 */
export type Nat<F, G> = <A>(fa: F) => G;

// Simpler alias for natural transformations
export type Nat1<F, G> = <A>(fa: F) => G;