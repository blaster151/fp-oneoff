// Finite group core + helpers

export type Elem<A> = A;

export interface FiniteGroup<A> {
  // carrier
  readonly elems: ReadonlyArray<Elem<A>>;
  // structure
  readonly op: (a: A, b: A) => A;    // group operation
  readonly id: A;                    // identity
  readonly inv: (a: A) => A;         // inverse
  // equality on elements (default: ===)
  readonly eq?: (a: A, b: A) => boolean;
  // human name (for diagnostics)
  readonly name?: string;
}

export const eqOf = <A>(G: FiniteGroup<A>) =>
  G.eq ?? ((x, y) => Object.is(x, y));

export function isGroup<A>(G: FiniteGroup<A>): boolean {
  const eq = eqOf(G);
  const E = G.elems;
  // closure + identity + inverses + associativity (brute force)
  for (const a of E) for (const b of E) {
    const ab = G.op(a, b);
    if (!E.some(e => eq(e, ab))) return false;
  }
  for (const a of E) {
    if (!eq(G.op(G.id, a), a) || !eq(G.op(a, G.id), a)) return false;
    if (!E.some(x => eq(G.op(a, x), G.id) && eq(G.op(x, a), G.id))) return false;
  }
  for (const a of E) for (const b of E) for (const c of E) {
    const lhs = G.op(G.op(a, b), c);
    const rhs = G.op(a, G.op(b, c));
    if (!eq(lhs, rhs)) return false;
  }
  return true;
}

/** Cyclic group C_n written additively (mod n). */
export function Cyclic(n: number): FiniteGroup<number> {
  if (n <= 0 || !Number.isInteger(n)) throw new Error(`Cyclic: n must be a positive integer`);
  const elems = Array.from({ length: n }, (_, i) => i);
  const op    = (a: number, b: number) => (a + b) % n;
  const id    = 0;
  const inv   = (a: number) => (n - (a % n)) % n;
  return { elems, op, id, inv, name: `C${n}` };
}

/** Direct product G × H (componentwise operation). */
export function Product<A,B>(G: FiniteGroup<A>, H: FiniteGroup<B>): FiniteGroup<[A,B]> {
  const eqG = eqOf(G), eqH = eqOf(H);
  const elems: Array<[A,B]> = [];
  for (const a of G.elems) for (const b of H.elems) elems.push([a,b]);
  return {
    elems,
    op: ([a1,b1], [a2,b2]) => [G.op(a1,a2), H.op(b1,b2)],
    id: [G.id, H.id],
    inv: ([a,b]) => [G.inv(a), H.inv(b)],
    eq: (pair1, pair2) => {
      if (!pair1 || !pair2) return false;
      const [x1,y1] = pair1;
      const [x2,y2] = pair2;
      return eqG(x1,x2) && eqH(y1,y2);
    },
    name: `(${G.name ?? 'G'})×(${H.name ?? 'H'})`
  };
}