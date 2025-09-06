import { Group, GroupHom, Subgroup } from "./structures";

export function groupHom<A,B>(source: Group<A>, target: Group<B>, map: (a:A)=>B, name?:string): GroupHom<A,B> {
  return { source, target, map, name };
}

export function composeHom<A,B,C>(g: GroupHom<B,C>, f: GroupHom<A,B>, name?: string): GroupHom<A,C> {
  return { name, source: f.source, target: g.target, map: (a:A) => g.map(f.map(a)) };
}

// Identity hom (sometimes handy for tests)
export function idHom<A>(G: Group<A>): GroupHom<A,A> {
  return { source: G, target: G, map: (a:A)=>a, name: "id" };
}

/**
 * Theorem 7: Inclusion homomorphism S → H for subgroup S ≤ H
 * This witnesses the converse to Theorem 6: every subgroup can be obtained
 * as the image of some homomorphism (namely, the inclusion).
 * 
 * File placement: Hom.ts seems appropriate since it's a homomorphism constructor,
 * though it could also go in SubgroupOps.ts since it deals with subgroups.
 */
export function inclusionHom<A>(H: Group<A>, S: Subgroup<A>, name?: string): GroupHom<A,A> {
  return {
    name: name ?? `incl_${S.name ?? "S"}→${H.name ?? "H"}`,
    source: S,
    target: H,
    map: (s: A) => s
  };
}