import { Group, GroupHom, GroupIso, Subgroup } from "./structures";
import { canonicalProjection, firstIsomorphism } from "./FirstIso";
import { analyzeGroupHom } from "./analyzeHom";
import { composeHom, groupHom } from "./Hom";
import { quotientGroup } from "./Quotient";

/** Result bundle for Third Isomorphism Theorem */
export interface ThirdIsoResult<A> {
  GmodN: Group<any>;           // G/N
  KmodN: Subgroup<any>;        // K/N ≤ G/N
  GmodK: Group<any>;           // G/K
  quotient_GmodN_mod_KmodN: Group<any>; // (G/N)/(K/N)
  iso: GroupIso<any, any>;     // (G/N)/(K/N) ≅ G/K
}

/**
 * Third Isomorphism Theorem:
 * If N ⊴ G and K ⊴ G with N ≤ K, then K/N ⊴ G/N and (G/N)/(K/N) ≅ G/K
 * 
 * Construction: Use canonical projection π: G → G/N, then apply First Iso to
 * the induced map π': G → G/N with kernel K.
 */
export function thirdIsomorphism<A>(
  G: Group<A>, 
  N: Subgroup<A>, 
  K: Subgroup<A>
): ThirdIsoResult<A> {
  // Build G/N
  const GmodN = quotientGroup(G, N);
  
  // Build K/N (K is a subgroup of G containing N)
  // K/N consists of cosets kN where k ∈ K
  const KmodN_elems = K.elems.map(k => {
    // Find the coset kN in G/N
    return GmodN.elems.find(coset => 
      coset.set.some(x => (G.eq ?? Object.is)(x, k))
    )!;
  });
  
  // Make K/N a subgroup of G/N
  const KmodN: Subgroup<any> = {
    name: `${K.name ?? "K"}/${N.name ?? "N"}`,
    elems: KmodN_elems,
    op: GmodN.op,
    e: GmodN.e,
    inv: GmodN.inv,
    eq: GmodN.eq
  };
  
  // Build G/K
  const GmodK = quotientGroup(G, K);
  
  // Build (G/N)/(K/N)
  const quotient_GmodN_mod_KmodN = quotientGroup(GmodN, KmodN);
  
  // The isomorphism (G/N)/(K/N) ≅ G/K is given by the map
  // [gN]K/N ↦ gK
  // We construct this using the First Isomorphism Theorem
  
  // Define the map f: G/N → G/K by f(gN) = gK
  const f: GroupHom<any, any> = {
    name: "f",
    source: GmodN,
    target: GmodK,
    map: (gN_coset: any) => {
      // Find the representative g of the coset gN
      const g = gN_coset.rep;
      // Find the coset gK in G/K
      return GmodK.elems.find(coset => 
        coset.set.some(x => (G.eq ?? Object.is)(x, g))
      )!;
    }
  };
  
  // Analyze the homomorphism
  const analyzed_f = analyzeGroupHom(f);
  
  // Apply First Isomorphism Theorem
  const iso = firstIsomorphism(analyzed_f as any);
  
  return {
    GmodN,
    KmodN,
    GmodK,
    quotient_GmodN_mod_KmodN,
    iso
  };
}