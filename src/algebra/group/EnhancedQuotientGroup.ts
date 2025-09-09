// Minimal quotient construction for finite groups.
// REPRESENTATION: a quotient element is represented by a canonical representative.
// We choose the first element encountered in its ≈-class.

import { Equiv, EnhancedCongruence } from "./EnhancedCongruence";

export interface EnhancedFiniteGroup<G> {
  readonly elems: readonly G[];
  readonly op: (a:G,b:G)=>G;
  readonly id: G;
  readonly inv: (a:G)=>G;
  // Optional stringifier for nicer debugging
  show?: (a:G)=>string;
}

export interface EnhancedQuotient<G> {
  // Canonical representative for [g]
  repr(g: G): G;
  // Normalize any element to its class representative
  norm(g: G): { rep: G };
  // The quotient group structure
  Group: EnhancedFiniteGroup<{ rep: G }>;
}

/** Build G/≈ for a finite group */
export function enhancedQuotientGroup<G>(
  G: EnhancedFiniteGroup<G>,
  cong: EnhancedCongruence<G>
): EnhancedQuotient<G> {
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

  return {
    repr,
    norm: lift,
    Group: {
      elems: qelems,
      op: qop,
      id: qid,
      inv: qinv,
      show: a => G.show ? `[${G.show(a.rep)}]` : `[?]`,
    }
  };
}