import { GroupHom } from "../Hom";
import { Group } from "../structures";

export interface Pullback<A, B, C> {
  P: Group<[A, C]>;
  p1: (ac: [A, C]) => A; // projection to G
  p2: (ac: [A, C]) => C; // projection to K
  witness: () => boolean; // checks f∘p1 = g∘p2 on all elements (finite)
}

// Finite-only executable pullback
export function pullback<A, B, C>(
  f: GroupHom<unknown, unknown, A, B>,
  g: GroupHom<unknown, unknown, C, B>
): Pullback<A, B, C> {
  const G = f.source; // FiniteGroup<A>
  const K = g.source; // FiniteGroup<C>
  const H = f.target; // FiniteGroup<B>

  // equality fallbacks
  const eqH = H.eq ?? ((x: B, y: B) => Object.is(x, y));
  const eqG = G.eq ?? ((x: A, y: A) => Object.is(x, y));
  const eqK = K.eq ?? ((x: C, y: C) => Object.is(x, y));

  const elems: Array<[A, C]> = [];
  for (const a of G.elems) {
    for (const c of K.elems) {
      if (eqH(f.map(a), g.map(c))) elems.push([a, c]);
    }
  }

  const op = (x: [A, C], y: [A, C]): [A, C] => [G.op(x[0], y[0]), K.op(x[1], y[1])];
  const id: [A, C] = [G.id, K.id];
  const inv = (x: [A, C]): [A, C] => [G.inv(x[0]), K.inv(x[1])];

  const P: Group<[A, C]> = {
    elems,
    op,
    id,
    inv,
    eq: (x, y) => eqG(x[0], y[0]) && eqK(x[1], y[1])
  };

  const p1 = (ac: [A, C]) => ac[0];
  const p2 = (ac: [A, C]) => ac[1];
  const witness = () => elems.every(([a, c]) => eqH(f.map(a), g.map(c)));

  return { P, p1, p2, witness };
}
