import { must, idx } from "../../../util/guards";

/** Abstract pairing scheme X×Y ↔ O with destructors. */
export interface PairingScheme<A, B, O> {
  pair: (a: A, b: B) => O;
  left: (o: O) => A;
  right: (o: O) => B;
}

/** Equality on O induced from equalities of A and B via the scheme's destructors. */
export function eqFromScheme<A, B, O>(
  eqA: (a1: A, a2: A) => boolean,
  eqB: (b1: B, b2: B) => boolean,
  S: PairingScheme<A, B, O>
): (o1: O, o2: O) => boolean {
  return (o1, o2) => eqA(S.left(o1), S.left(o2)) && eqB(S.right(o1), S.right(o2));
}

/** Concrete tuple-style scheme (stable, readable). */
export function tupleScheme<A, B>(): PairingScheme<A, B, { a: A; b: B }> {
  return {
    pair: (a, b) => ({ a, b }),
    left: (o) => o.a,
    right: (o) => o.b
  };
}

/** Index-based numeric scheme for finite carriers (shows "representation independence"). */
export function indexScheme<A, B>(
  Aelems: A[],
  Belems: B[]
): PairingScheme<A, B, number> {
  const iA = (a: A) => must(Aelems.findIndex(x => x === a), "element not found in A");
  const iB = (b: B) => must(Belems.findIndex(y => y === b), "element not found in B");
  const pair = (a: A, b: B) => iA(a) * Belems.length + iB(b);
  const left = (o: number) => idx(Aelems, Math.floor(o / Belems.length));
  const right = (o: number) => idx(Belems, o % Belems.length);
  return { pair, left, right };
}