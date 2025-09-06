import { Group } from "./Group";
import { Congruence } from "./Congruence";

/** A quotient group G/≈. Cosets represented by a chosen representative. */
export interface Coset<G> { rep: G; }

export function QuotientGroup<G>(C: Congruence<G>) {
  const { G, eqv } = C;

  const norm = (g: G): Coset<G> => ({ rep: g });
  const eqCoset = (a: Coset<G>, b: Coset<G>) => eqv(a.rep, b.rep);

  const op = (a: Coset<G>, b: Coset<G>): Coset<G> => norm(G.op(a.rep, b.rep));
  const inv = (a: Coset<G>): Coset<G> => norm(G.inv(a.rep));
  const e   = norm(G.e);

  const Q: Group<Coset<G>> = {
    e, op, inv, eq: eqCoset,
    show: (c) => `[${G.show ? G.show(c.rep) : String(c.rep)}]`
  };

  return { Group: Q, norm, eqCoset };
}