// src/cat/grp/FinGrp.ts
export interface FinGroup<A> {
  carrier: A[];
  id: A;
  op: (a: A, b: A) => A;
  inv: (a: A) => A;
  eq: (a: A, b: A) => boolean;
}

export interface FinGroupMor<A,B> {
  src: FinGroup<A>;
  dst: FinGroup<B>;
  run: (a: A) => B;
}

export function makeFinGroup<A>(G: FinGroup<A>): FinGroup<A> {
  return G;
}