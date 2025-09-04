import { FiniteGroup } from "../Group";
import { conjugation } from "./Conjugation";
import { GroupIso, isoComp, isoEqByPoints, isoId, isoInverse } from "../iso/GroupIso";
import { Auto } from "./Aut";

/** Build the set { conj_g | g ∈ G } as isomorphisms G ≅ G. */
export function innerAutomorphisms<A>(G: FiniteGroup<A>): Auto<A>[] {
  const xs: Auto<A>[] = G.elems.map(g => {
    const f = conjugation(G, g);
    const finv = conjugation(G, G.inv(g));
    return { forward: f, backward: finv };
  });
  // Deduplicate (abelian groups collapse to the identity)
  const uniq: Auto<A>[] = [];
  for (const a of xs) if (!uniq.some(u => isoEqByPoints(u, a))) uniq.push(a);
  return uniq;
}

/** Inn(G) as a subgroup of Aut(G) with inherited operation. */
export function innGroup<A>(G: FiniteGroup<A>): FiniteGroup<Auto<A>> {
  const elems = innerAutomorphisms(G);
  const eq = isoEqByPoints<A, A>;
  const op = (x: Auto<A>, y: Auto<A>): Auto<A> => isoComp(x, y);
  const id = isoId(G);
  const inv = (x: Auto<A>): Auto<A> => isoInverse(x);
  return { elems, eq, op, id, inv };
}