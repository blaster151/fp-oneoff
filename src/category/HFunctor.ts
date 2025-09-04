import { Nat } from "./Nat.js";

/**
 * HFunctor = Higher-order functor.
 * Maps functors to functors, and natural transformations to natural transformations.
 * (H = Higher-order, not "Haskell").
 */
export interface HFunctor<F> {
  hfmap<G, H>(nt: Nat<G, H>): Nat<F, F>;
}

// Alternative: more explicit HFunctor
export interface HigherOrderFunctor<F, G, H> {
  hfmap(nt: Nat<G, H>): Nat<F, F>;
}