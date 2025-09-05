import type { Law } from "./Witness";

/** A tiny functor interface (simplified without HKT). */
export type Functor<F> = {
  map: <A,B>(f:(a:A)=>B, fa:F)=> F;
};

export type Nat<F, G> = {
  eta: (fa:F)=> G;
};

export function naturalityLaws<F, G>(
  F: Functor<F>, G: Functor<G>, N: Nat<F,G>,
  sampleObjs: { A: any[], B: any[], f: (a:any)=>any }
): Law<{}>[] {
  const { A, f } = sampleObjs;
  return [
    {
      name: "naturality: G.map(f) ∘ η = η ∘ F.map(f)",
      check: ()=> A.every(a => {
        const lhs = G.map(sampleObjs.f, N.eta({__val:a} as any));
        const rhs = N.eta(F.map(sampleObjs.f, {__val:a} as any));
        // very schematic; in your real code you'd supply real F/G values and equality
        return JSON.stringify(lhs) === JSON.stringify(rhs);
      })
    }
  ];
}