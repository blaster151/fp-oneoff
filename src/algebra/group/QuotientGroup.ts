import { Group } from "./structures";
import { Congruence } from "./Congruence";

/** A quotient group G/≈. Cosets represented by a chosen representative. */
export interface Coset<G> { rep: G; }

export function QuotientGroup<G>(C: Congruence<G>) {
  const { G, eqv } = C;

  const norm = (g: G): Coset<G> => ({ rep: g });
  const eqCoset = (a: Coset<G>, b: Coset<G>) => eqv(a.rep, b.rep);

  const op = (a: Coset<G>, b: Coset<G>): Coset<G> => norm(G.op(a.rep, b.rep));
  const inv = (a: Coset<G>): Coset<G> => norm(G.inv(a.rep));
  const id = norm(G.id);

  // For finite groups, we can enumerate coset representatives
  const elems: Coset<G>[] = [];
  if (G.elems) {
    const representatives: G[] = [];
    for (const g of G.elems) {
      // Check if g is already represented by an existing coset
      if (!representatives.some(rep => eqv(g, rep))) {
        representatives.push(g);
        elems.push(norm(g));
      }
    }
  }

  const Q: Group<Coset<G>> = {
    elems,
    id, 
    op, 
    inv, 
    eq: eqCoset,
    name: `${G.name ?? 'G'}/≈`
  };

  return { Group: Q, norm, eqCoset };
}