import type { Law } from "./Witness";

/** Abstract adjunction witness: F ⊣ G via unit/counit or hom-set bijection. */
export type Adjunction<A,B> = {
  // Either: unit/counit
  unit?:  <A>(a:A)=> any;
  counit?:<B>(b:B)=> any;
  // Or: a bijection Φ: Hom(F A, B) ≅ Hom(A, G B) with naturality (not fully encoded here)
  homIso?: {
    to:   (h: any)=> any; // (F A → B) -> (A → G B)
    from: (k: any)=> any; // (A → G B) -> (F A → B)
  };
};

export function adjunctionRoundTripLaws(adj: Adjunction<any,any>): Law<{samples: any[]}>[] {
  if (!adj.homIso) return [];
  const { to, from } = adj.homIso;
  return [
    { name: "homIso.from ∘ to = id", check: ({samples})=> samples.every(h => JSON.stringify(from(to(h)))===JSON.stringify(h)) },
    { name: "homIso.to ∘ from = id", check: ({samples})=> samples.every(k => JSON.stringify(to(from(k)))===JSON.stringify(k)) },
  ];
}