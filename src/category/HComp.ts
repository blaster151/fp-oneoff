import type { HFunctor } from "./HFunctor";
import type { Nat1 } from "./Nat";

/**
 * Compose two higher-order functors (F ∘ G).
 * Given hfmap_F : Nat g h -> Nat (F g) (F h)
 * and   hfmap_G : Nat g h -> Nat (G g) (G h)
 * we define
 *   hfmap_{F∘G}(nt) = hfmap_F(hfmap_G(nt))
 */
export function HComp(F: HFunctor<any>, G: HFunctor<any>): HFunctor<any> {
  return {
    hfmap<G0, H0>(nt: Nat1<G0, H0>) {
      const liftedThroughG = G.hfmap<G0, H0>(nt);  // Nat (G g) (G h)
      const liftedThroughF = F.hfmap<any, any>(liftedThroughG); // Nat (F (G g)) (F (G h))
      return liftedThroughF as any;
    },
  };
}