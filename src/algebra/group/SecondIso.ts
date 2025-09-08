import { Group, GroupHom, GroupIso, Subgroup } from "./structures";
import { canonicalProjection, firstIsomorphism } from "./FirstIso";
import { analyzeGroupHom } from "./analyzeHom";
import { hom as groupHom } from "../../structures/group/Hom.js";
import { compose as composeHom } from "../../structures/group/GrpCat.js";
import { productSet, intersectionSubgroup, makeSubgroup } from "./SubgroupOps";
import { quotientGroup } from "./Quotient";

/** Result bundle so tests can also inspect the pieces */
export interface SecondIsoResult<A,B> {
  A_cap_N: Subgroup<A>;
  AN: Subgroup<A>;
  quotient_AN_mod_N: Group<any>;
  target_in_GmodN: Group<any>; // im(π∘i) ≤ G/N
  iso: GroupIso<any, any>;     // A/(A∩N) ≅ im(π∘i)  (canonically equals (AN)/N)
}

/** Build Second Isomorphism iso using π∘i : A → G/N and First Iso */
export function secondIsomorphism<A>(G: Group<A>, A_sub: Subgroup<A>, N_norm: Subgroup<A>): SecondIsoResult<A, any> {
  // Sanity: construct AN and A∩N
  const A_cap_N = intersectionSubgroup(G, A_sub, N_norm, `${(A_sub as any).label ?? "A"}∩${(N_norm as any).label ?? "N"}`);
  const AN_elems = productSet(G, A_sub, N_norm);
  const AN = makeSubgroup(G, AN_elems, `${(A_sub as any).label ?? "A"}${(N_norm as any).label ?? "N"}`);

  // π : G → G/N
  const pi = canonicalProjection(G, N_norm);
  // i : A → G (inclusion)
  const i: GroupHom<A,A> = groupHom(A_sub, G, (a:A)=>a, "incl");

  // ψ = π ∘ i : A → G/N
  const psi = analyzeGroupHom(composeHom(pi, i, "psi"));

  // First Iso gives A/(A∩N) ≅ im(ψ)
  // (ψ.witnesses.kernelSubgroup is A∩N; imageSubgroup is {aN | a∈A})
  // We reuse your existing firstIsomorphism implementation:
  const iso = firstIsomorphism(psi as any);

  // For convenience, also expose (AN)/N (isomorphic to im ψ)
  const GmodN = pi.target; // quotient group G/N already built inside π
  const target_in_GmodN = (psi as any).witnesses!.imageSubgroup!; // ≤ G/N

  // (Optional) Also build (AN)/N explicitly: take AN as a group and N as subgroup (same N elements).
  const N_in_AN: Subgroup<A> = makeSubgroup(AN, N_norm.elems.filter(x => AN.elems.includes(x as any)), `${(N_norm as any).label ?? "N"}`);
  const quotient_AN_mod_N = quotientGroup(AN, N_in_AN);

  return { A_cap_N, AN, quotient_AN_mod_N, target_in_GmodN, iso };
}