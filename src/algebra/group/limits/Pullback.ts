import { Group, GroupHom } from "../FirstIso";

export interface Pullback<A,B,C> {
  P: Group<[A,C]>;
  p1: (ac: [A,C]) => A; // projection to G
  p2: (ac: [A,C]) => C; // projection to K
  witness: () => boolean; // checks f∘p1 = g∘p2 on all elements (finite)
}

// Finite-only executable pullback
export function pullback<A,B,C>(f: GroupHom<A,B>, g: GroupHom<C,B>): Pullback<A,B,C> {
  const G = f.src, K = g.src, H = f.dst;
  if (!G.elements || !K.elements) throw new Error("pullback: need finite G and K.");

  const elems: Array<[A,C]> = [];
  for (const a of G.elements) {
    for (const c of K.elements) {
      if (H.eq(f.map(a), g.map(c))) elems.push([a,c]);
    }
  }

  const eq = (x: [A,C], y: [A,C]) => G.eq(x[0], y[0]) && K.eq(x[1], y[1]);
  const op = (x: [A,C], y: [A,C]): [A,C] => [ G.op(x[0], y[0]), K.op(x[1], y[1]) ];
  const e: [A,C] = [G.e, K.e];
  const inv = (x: [A,C]): [A,C] => [ G.inv(x[0]), K.inv(x[1]) ];

  const P: Group<[A,C]> = { eq, op, e, inv, elements: elems };
  const p1 = (ac: [A,C]) => ac[0];
  const p2 = (ac: [A,C]) => ac[1];
  const witness = () =>
    elems.every(([a,c]) => H.eq(f.map(a), g.map(c)));

  return { P, p1, p2, witness };
}