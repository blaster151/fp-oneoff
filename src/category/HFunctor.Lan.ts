import type { HFunctor } from "./HFunctor";
import type { Nat1 } from "./Nat";
import type { Lan1 } from "./Lan";
import type { Eq } from "./Eq";

/**
 * HFunctor instance for Lan h.
 * hfmap_Lan : Nat g k -> Nat (Lan h g) (Lan h k)
 *
 * (Lan h g) c  =  ∀b. Eq(h b, c) -> g b
 * so lifting a natural transformation nt : g ~> k is:
 *   (lanG : Lan h g c) ↦ (eq : Eq(h b, c)) ↦ nt(lanG(eq))
 */
export function lanHFunctor<H>(): HFunctor<any> {
  return {
    hfmap<G, K>(nt: Nat1<G, K>) {
      return <C>(lanG: Lan1<H, G, C>) =>
        (<B>(eq: Eq<any, any>) => nt(lanG(eq))) as unknown as Lan1<H, K, C>;
    },
  };
}