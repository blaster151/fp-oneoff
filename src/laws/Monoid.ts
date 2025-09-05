import type { Eq, Law, Lawful } from "./Witness";

/** Monoid witness. */
export type Monoid<A> = {
  empty: A;
  concat: (x:A, y:A)=> A;
};

export function monoidLaws<A>(eq: Eq<A>, M: Monoid<A>, samples: A[]): Law<{M: Monoid<A>, xs:A[]}>[] {
  const xs = samples.length ? samples : [M.empty];
  return [
    {
      name: "assoc",
      check: ({M, xs})=> xs.every(a => xs.every(b => xs.every(c =>
        eq(M.concat(M.concat(a,b), c), M.concat(a, M.concat(b,c)))
      ))),
    },
    {
      name: "left id",
      check: ({M, xs})=> xs.every(a => eq(M.concat(M.empty,a), a)),
    },
    {
      name: "right id",
      check: ({M, xs})=> xs.every(a => eq(M.concat(a,M.empty), a)),
    },
  ];
}

/** Helper to wrap a monoid into a Lawful pack. */
export function lawfulMonoid<A>(tag: string, eq: Eq<A>, M: Monoid<A>, samples: A[]): Lawful<A, Monoid<A>> {
  return { tag, eq, struct: M, laws: monoidLaws(eq, M, samples) };
}