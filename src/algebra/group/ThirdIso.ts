import { Group, GroupHom, GroupIso, Subgroup } from "./structures";
import { canonicalProjection, firstIsomorphism } from "./FirstIso";
import { analyzeGroupHom } from "./analyzeHom";
import { quotientGroup, Coset, leftCoset } from "./Quotient";

function eqDefault<T>(a:T,b:T){ return Object.is(a,b); }

export interface ThirdIsoResult<A> {
  Q_GmodK: Group<Coset<A>>;          // G/K
  NmodK_in_Q: Subgroup<Coset<A>>;    // N/K ≤ G/K
  Q_over_NmodK: Group<any>;          // (G/K)/(N/K)
  GmodN: Group<Coset<A>>;            // G/N
  iso: GroupIso<any, any>;
}

/** Third Isomorphism via θ : G/K → G/N, θ([g]_K) = [g]_N and First Iso */
export function thirdIsomorphism<A>(G: Group<A>, N_norm: Subgroup<A>, K_norm: Subgroup<A>): ThirdIsoResult<A> {
  // π_K : G → G/K
  const piK = canonicalProjection(G, K_norm);
  const Q = piK.target; // G/K

  // N/K as a subgroup of G/K: elements are {[n]_K | n∈N}
  const eqQ = Q.eq ?? ((x:Coset<A>,y:Coset<A>) => x.set.length===y.set.length && x.set.every(u => y.set.includes(u)));
  const NK_elems: Coset<A>[] = N_norm.elems.map(n => leftCoset(G, K_norm, n));
  // de-dupe
  const NK_unique: Coset<A>[] = [];
  for (const c of NK_elems) if (!NK_unique.some(d => eqQ(c,d))) NK_unique.push(c);
  const NmodK: Subgroup<Coset<A>> = { name: `${N_norm.name ?? "N"}/${K_norm.name ?? "K"}`, elems: NK_unique, op: Q.op, e: Q.e, inv: Q.inv, eq: Q.eq };

  // π_N : G → G/N
  const piN = canonicalProjection(G, N_norm);
  const GmodN = piN.target;

  // θ : G/K → G/N, θ([g]_K) = [g]_N. Implement by picking a representative.
  const theta: GroupHom<Coset<A>, Coset<A>> = {
    name: "theta",
    source: Q,
    target: GmodN,
    map: (c: Coset<A>) => piN.map(c.rep)
  };

  // Analyze θ, then First Iso ⇒ (G/K)/(N/K) ≅ G/N
  const thetaAnalyzed = analyzeGroupHom(theta);
  const iso = firstIsomorphism(thetaAnalyzed as any);

  // Also expose (G/K)/(N/K) explicitly to compare sizes
  const Q_over_NmodK = quotientGroup(Q, NmodK);

  return { Q_GmodK: Q, NmodK_in_Q: NmodK, Q_over_NmodK, GmodN, iso };
}