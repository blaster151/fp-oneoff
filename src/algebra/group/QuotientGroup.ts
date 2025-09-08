import { FiniteGroup } from "./Group";
import { Congruence } from "./Congruence";

/** A quotient group G/≈. Cosets represented by a chosen representative. */
export interface Coset<G> { rep: G; }

export function QuotientGroup<G>(C: Congruence<G>) {
  const { G, eqv } = C;

  const norm = (g: G): Coset<G> => ({ rep: g });
  const eqCoset = (a: Coset<G>, b: Coset<G>) => eqv(a.rep, b.rep);

  const op = (a: Coset<G>, b: Coset<G>): Coset<G> => norm(G.op(a.rep, b.rep));
  const inv = (a: Coset<G>): Coset<G> => norm(G.inv(a.rep));
  const e   = norm((G as any).e ?? (G as any).id);

  // Generate all equivalence classes
  const classes = new Map<string, Coset<G>>();
  for (const g of G.elems) {
    let found = false;
    for (const existing of classes.values()) {
      if (eqv(g, existing.rep)) {
        found = true;
        break;
      }
    }
    if (!found) {
      classes.set(JSON.stringify(g), norm(g));
    }
  }
  const elems = Array.from(classes.values());

  const Q: FiniteGroup<Coset<G>> = {
    elems,
    id: e,
    op,
    inv,
    eq: eqCoset
  };

  return { Group: Q, norm, eqCoset };
}