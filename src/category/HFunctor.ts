import type { Nat1 } from "./Nat";

/**
 * HFunctor = Higher-order functor.
 * Maps functors to functors, and natural transformations to natural transformations.
 * (H = Higher-order, *not* Haskell.)
 *
 * Simplified signature for TypeScript compatibility.
 */
export interface HFunctor<F> {
  hfmap<G, H>(nt: Nat1<G, H>): Nat1<F, F>;
}

/** Law helpers (OPTIONAL): check identity and composition at a few sample points. */
export function hfunctorLaws<F>(HF: HFunctor<F>) {
  return {
    /**
     * Identity law: hfmap(id) ~ id
     * We cannot universally quantify A at runtime; callers can supply test points.
     */
    identity<G>(id: Nat1<G, G>) {
      const lifted = HF.hfmap<G, G>(id);
      return { lifted };
    },
    /**
     * Composition: hfmap(nt2 ∘ nt1) = hfmap(nt2) ∘ hfmap(nt1)
     * Caller provides sample to test equality on a few As.
     */
    composition<G, H, K>(
      nt1: Nat1<G, H>, nt2: Nat1<H, K>
    ) {
      const left = HF.hfmap<G, K>((fa) => nt2(nt1(fa)));
      const right1 = HF.hfmap<G, H>(nt1);
      const right2 = HF.hfmap<H, K>(nt2);
      return { 
        left, 
        right: <A>(x: any) => right2(right1(x)) as any 
      };
    }
  };
}