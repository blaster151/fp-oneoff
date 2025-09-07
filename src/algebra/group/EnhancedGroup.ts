// Enhanced group structure with law witnesses for categorical operations
export type BinOp<A> = (x: A, y: A) => A;

export interface EnhancedGroup<A> {
  readonly carrier: "finite" | "infinite";
  readonly elems?: A[] | undefined;                // optional, used for exhaustive checks
  readonly eq: (x: A, y: A) => boolean;

  // structure
  readonly op: BinOp<A>;               // *
  readonly e: A;                       // identity
  readonly inv: (x: A) => A;           // x^{-1}

  // witnesses (run-time checkers used in tests)
  readonly laws?: {
    assoc: (a: A, b: A, c: A) => boolean;     // (a*b)*c = a*(b*c)
    leftId: (a: A) => boolean;                // e*a = a
    rightId: (a: A) => boolean;               // a*e = a
    leftInv: (a: A) => boolean;               // inv(a)*a = e
    rightInv: (a: A) => boolean;              // a*inv(a) = e
  } | undefined;
}

// Helpers: canonical tiny groups used in tests
export const Z_add = {
  mk(n: number): EnhancedGroup<number> {
    return {
      carrier: "infinite",
      eq: (x, y) => x === y,
      op: (x, y) => x + y,
      e: 0,
      inv: (x) => -x,
      laws: {
        assoc: (a, b, c) => (a + b) + c === a + (b + c),
        leftId: (a) => 0 + a === a,
        rightId: (a) => a + 0 === a,
        leftInv: (a) => (-a) + a === 0,
        rightInv: (a) => a + (-a) === 0,
      }
    };
  }
};

export function Klein4<A>(a: A, b: A, c: A, d: A): EnhancedGroup<A> {
  // abstract V_4 via "addition mod 2" on pairs; but we just supply concrete elems/op via lookup
  const elems = [a, b, c, d];
  const eq = (x: A, y: A) => x === y;
  // multiplication table: e=a; every non-e element has order 2; group is abelian
  const table = new Map<A, Map<A, A>>();
  const put = (x: A, y: A, z: A) => {
    if (!table.has(x)) table.set(x, new Map());
    table.get(x)!.set(y, z);
  };
  const op = (x: A, y: A) => table.get(x)!.get(y)!;
  // fill symmetric Klein 4 table
  // rename for readability
  const e = a, u = b, v = c, w = d;
  // row e
  put(e, e, e); put(e, u, u); put(e, v, v); put(e, w, w);
  // row u
  put(u, e, u); put(u, u, e); put(u, v, w); put(u, w, v);
  // row v
  put(v, e, v); put(v, u, w); put(v, v, e); put(v, w, u);
  // row w
  put(w, e, w); put(w, u, v); put(w, v, u); put(w, w, e);

  return {
    carrier: "finite",
    elems,
    eq,
    op,
    e,
    inv: (x) => x, // every non-e is self-inverse
    laws: {
      assoc: (x, y, z) => eq(op(op(x, y), z), op(x, op(y, z))),
      leftId: (x) => eq(op(e, x), x),
      rightId: (x) => eq(op(x, e), x),
      leftInv: (x) => eq(op(x, x), e),  // since inv(x)=x in V4
      rightInv: (x) => eq(op(x, x), e),
    }
  };
}