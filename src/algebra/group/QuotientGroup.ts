// Minimal quotient construction for finite groups.
// REPRESENTATION: a quotient element is represented by a canonical representative.
// We choose the first element encountered in its ≈-class.

import { Equiv, Congruence } from "./Congruence";
import { FiniteGroup } from "./Group";

export interface Quotient<G> {
  // Canonical representative for [g]
  repr(g: G): G;
  // Normalize any element to its class representative
  norm(g: G): { rep: G };
  // The quotient group structure
  Group: FiniteGroup<{ rep: G }>;
  // Equality on cosets
  eqCoset(a: { rep: G }, b: { rep: G }): boolean;
}

export type Coset<G> = { rep: G };

/** Build G/≈ for a finite group */
export function quotientGroup<G>(
  G: FiniteGroup<G>,
  cong: Congruence<G>
): Quotient<G> {
  const { elems, op, id, inv } = G;
  const eq = cong.eq;

  // Partition elems into classes via simple union-find by scanning
  const reps: G[] = [];
  const repOf = new Map<G,G>();

  function findRep(x: G): G {
    for (const r of reps) if (eq(x, r)) return r;
    reps.push(x);
    return x;
  }

  for (const x of elems) {
    const r = findRep(x);
    repOf.set(x, r);
  }

  const repr = (g: G) => {
    // map to an existing element's rep if present; fall back to first eq match
    if (repOf.has(g)) return repOf.get(g)!;
    for (const r of reps) if (eq(g, r)) return r;
    // As a last resort (shouldn't happen if elems enumerate G), treat g as new rep
    reps.push(g);
    repOf.set(g, g);
    return g;
  };

  type Q = { rep: G };
  const lift = (g: G): Q => ({ rep: repr(g) });

  const qop = (a: Q, b: Q): Q => lift(op(a.rep, b.rep));
  const qinv = (a: Q): Q => lift(inv(a.rep));
  const qid   = lift(id);

  const qelems: Q[] = Array.from(new Set(reps)).map(rep => ({ rep }));

  const eqCoset = (a: { rep: G }, b: { rep: G }) => eq(a.rep, b.rep);

  return {
    repr,
    norm: lift,
    Group: {
      elems: qelems,
      op: qop,
      id: qid,
      inv: qinv,
      eq: eqCoset,
    },
    eqCoset,
  };
}