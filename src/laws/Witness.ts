/** A canonical shape for "witness packs" and law checkers. */

import { Eq } from '../types/eq.js';

// Re-export for backward compatibility
export { Eq };

/** A law is a named predicate over some environment E (params) producing boolean. */
export type Law<E> = {
  name: string;
  check: (env: E)=> boolean;
  // Optional: minimal counterexample, if your check can compute it cheaply.
  // If you don't have one, return undefined.
  witness?: (env: E)=> unknown | undefined;
};

/** A Lawful<A> bundle groups the structure, its equality, and a set of laws. */
export type Lawful<A, S> = {
  tag: string;          // e.g., "Monoid/number/sum"
  eq: Eq<A>;
  struct: S;            // the structure implementation (ops, data)
  laws: Law<any>[];     // usually specialized helpers generate these
  run?: () => { ok: boolean; failures: any[] }; // optional custom runner
};

/** A two-sided "equivalence witness" (isomorphism-like): f ⊣⊢ g with round trips. */
export type Iso<A,B> = {
  to:   (a:A)=> B;
  from: (b:B)=> A;
};
export function isoLaws<A,B>(eqA: Eq<A>, eqB: Eq<B>, iso: Iso<A,B>): Law<{samplesA:A[], samplesB:B[]}>[] {
  return [
    {
      name: "iso.rightLeft = idB",
      check: ({samplesB})=> samplesB.every(b => eqB(iso.to(iso.from(b)), b)),
      witness: ({samplesB})=> samplesB.find(b => !eqB(iso.to(iso.from(b)), b))
    },
    {
      name: "iso.leftRight = idA",
      check: ({samplesA})=> samplesA.every(a => eqA(iso.from(iso.to(a)), a)),
      witness: ({samplesA})=> samplesA.find(a => !eqA(iso.from(iso.to(a)), a))
    },
  ];
}

/** Utility to run a bundle of laws and collect minimal counterexamples if provided. */
export function runLaws<E>(laws: Law<E>[], env: E) {
  const failures = [];
  for (const L of laws) {
    const ok = L.check(env);
    if (!ok) {
      failures.push({
        name: L.name,
        witness: L.witness?.(env)
      });
    }
  }
  return { ok: failures.length===0, failures };
}