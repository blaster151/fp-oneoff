import { FiniteGroup } from "../../structures/group/Group";
import { congruenceFromHom } from "./Congruence";
import { quotientGroup } from "./QuotientGroup";
import { groupHom } from "./GroupHom";

// Define a compatible interface
interface GroupHomLike<A,B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  map: (a: A) => B;
  name?: string;
}

// Legacy wrapper - use groupHom directly instead
export function createGroupHom<A,B>(source: FiniteGroup<A>, target: FiniteGroup<B>, map: (a:A)=>B, name?:string) {
  return groupHom(source, target, map, name);
}

export function composeHom<A,B,C>(
  g: GroupHomLike<B,C>, 
  f: GroupHomLike<A,B>,
  name?: string
) {
  const composedMap = (a: A) => g.map(f.map(a));
  const composedName = name || `${g.name || 'g'}∘${f.name || 'f'}`;
  return groupHom(f.source, g.target, composedMap, composedName);
}
// Checks if a relation is a group congruence
// Uses explicit elems and op, matching new Congruence.ts conventions
export function isCongruence<G>(
  elems: readonly G[],
  op: (a:G,b:G)=>G,
  eq: (x:G, y:G) => boolean
): boolean {
  // reflexive + symmetric + (optional) transitive spot-check
  for (const x of elems) if (!eq(x,x)) return false;
  for (const x of elems) for (const y of elems) {
    if (eq(x,y) !== eq(y,x)) return false;
  }
  // Compatibility left/right
  for (const x of elems) for (const y of elems) if (eq(x,y)) {
    for (const z of elems) {
      if (!eq(op(z,x), op(z,y))) return false;
      if (!eq(op(x,z), op(y,z))) return false;
    }
  }
  return true;
}

/**
 * Attempt to convert a Group<G> to a FiniteGroup<G> if it has the required properties.
 * Falls back to undefined if not all properties are present.
 */
export function asFiniteGroup<G>(G: any): import("../../structures/group/Group").FiniteGroup<G> | undefined {
  if (G && Array.isArray(G.elems) && typeof G.op === "function" && typeof G.inv === "function" && typeof G.id !== "undefined") {
    return G as import("../../structures/group/Group").FiniteGroup<G>;
  }
  return undefined;
}

// Factors a group homomorphism through its quotient and inclusion
export function factorThroughQuotient<G,H>(
  hom: GroupHomLike<G,H>
) {
  const { source: G, target: H, map } = hom;
  // G and H are already FiniteGroup<G> and FiniteGroup<H> from GroupHom definition
  // Congruence from hom
  const cong = congruenceFromHom(G.elems as readonly G[], map, H.eq ?? ((a: H, b: H) => a === b));
  const Q = quotientGroup(G, cong);

  // Surjection π: G→Q
  const pi = (g:G) => Q.norm(g);

  // Injection ι: Q→H (really into im(f))
  const iota = (c: {rep:G}) => map(c.rep);

  return { quotient: Q.Group, pi, iota };
}