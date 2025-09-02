// rel-common.ts
// Common interface for Rel and BitRel with factory pattern for drop-in replacement
// Enables runtime strategy switching between naive and bit-packed implementations

import { Finite, Rel, Pair } from "./rel-equipment.js";
import { BitRel } from "./bitrel.js";

/************ Common relation interface ************/
export interface IRel<A, B> {
  readonly A: Finite<A>;
  readonly B: Finite<B>;
  
  // Core operations
  has(a: A, b: B): boolean;
  toPairs(): Pair<A, B>[];
  
  // Relational algebra
  compose<C>(S: IRel<B, C>): IRel<A, C>;
  converse(): IRel<B, A>;
  dagger(): IRel<B, A>;
  
  // Lattice operations
  leq(that: IRel<A, B>): boolean;
  meet(that: IRel<A, B>): IRel<A, B>;
  join(that: IRel<A, B>): IRel<A, B>;
  
  // Image operations
  image(X: Iterable<A>): B[];
  
  // Predicates
  isFunctional(): boolean;
  isTotal(): boolean;
  
  // Conversion
  toRel(): Rel<A, B>;
  toBitRel(): BitRel<A, B>;
}

/************ Wrapper implementations ************/
class RelWrapper<A, B> implements IRel<A, B> {
  constructor(private rel: Rel<A, B>) {}
  
  get A() { return this.rel.A; }
  get B() { return this.rel.B; }
  
  has(a: A, b: B): boolean { return this.rel.has(a, b); }
  toPairs(): Pair<A, B>[] { return this.rel.toPairs(); }
  
  compose<C>(S: IRel<B, C>): IRel<A, C> {
    return new RelWrapper(this.rel.compose(S.toRel()));
  }
  
  converse(): IRel<B, A> { return new RelWrapper(this.rel.converse()); }
  dagger(): IRel<B, A> { return this.converse(); }
  
  leq(that: IRel<A, B>): boolean { return this.rel.leq(that.toRel()); }
  meet(that: IRel<A, B>): IRel<A, B> { return new RelWrapper(this.rel.meet(that.toRel())); }
  join(that: IRel<A, B>): IRel<A, B> { return new RelWrapper(this.rel.join(that.toRel())); }
  
  image(X: Iterable<A>): B[] { return this.rel.image(X); }
  
  isFunctional(): boolean { return this.rel.isFunctional(); }
  isTotal(): boolean { return this.rel.isTotal(); }
  
  toRel(): Rel<A, B> { return this.rel; }
  toBitRel(): BitRel<A, B> { return BitRel.fromRel(this.rel); }
}

class BitRelWrapper<A, B> implements IRel<A, B> {
  constructor(private bitrel: BitRel<A, B>) {}
  
  get A() { return this.bitrel.A; }
  get B() { return this.bitrel.B; }
  
  has(a: A, b: B): boolean { return this.bitrel.has(a, b); }
  toPairs(): Pair<A, B>[] { return this.bitrel.toPairs(); }
  
  compose<C>(S: IRel<B, C>): IRel<A, C> {
    return new BitRelWrapper(this.bitrel.compose(S.toBitRel()));
  }
  
  converse(): IRel<B, A> { return new BitRelWrapper(this.bitrel.converse()); }
  dagger(): IRel<B, A> { return this.converse(); }
  
  leq(that: IRel<A, B>): boolean { return this.bitrel.leq(that.toBitRel()); }
  meet(that: IRel<A, B>): IRel<A, B> { return new BitRelWrapper(this.bitrel.meet(that.toBitRel())); }
  join(that: IRel<A, B>): IRel<A, B> { return new BitRelWrapper(this.bitrel.join(that.toBitRel())); }
  
  image(X: Iterable<A>): B[] { return this.bitrel.image(X); }
  
  isFunctional(): boolean { return this.bitrel.isFunctional(); }
  isTotal(): boolean { return this.bitrel.isTotal(); }
  
  toRel(): Rel<A, B> { return this.bitrel.toRel(); }
  toBitRel(): BitRel<A, B> { return this.bitrel; }
}

/************ Relation factory ************/
export type RelStrategy = 'naive' | 'bit';

export interface RelFactory {
  readonly strategy: RelStrategy;
  empty<A, B>(A: Finite<A>, B: Finite<B>): IRel<A, B>;
  fromPairs<A, B>(A: Finite<A>, B: Finite<B>, pairs: Iterable<Pair<A, B>>): IRel<A, B>;
  id<T>(X: Finite<T>): IRel<T, T>;
}

class NaiveRelFactory implements RelFactory {
  readonly strategy = 'naive' as const;
  
  empty<A, B>(A: Finite<A>, B: Finite<B>): IRel<A, B> {
    return new RelWrapper(Rel.empty(A, B));
  }
  
  fromPairs<A, B>(A: Finite<A>, B: Finite<B>, pairs: Iterable<Pair<A, B>>): IRel<A, B> {
    return new RelWrapper(Rel.fromPairs(A, B, pairs));
  }
  
  id<T>(X: Finite<T>): IRel<T, T> {
    return new RelWrapper(Rel.id(X));
  }
}

class BitRelFactory implements RelFactory {
  readonly strategy = 'bit' as const;
  
  empty<A, B>(A: Finite<A>, B: Finite<B>): IRel<A, B> {
    return new BitRelWrapper(BitRel.empty(A, B));
  }
  
  fromPairs<A, B>(A: Finite<A>, B: Finite<B>, pairs: Iterable<Pair<A, B>>): IRel<A, B> {
    return new BitRelWrapper(BitRel.fromPairs(A, B, pairs));
  }
  
  id<T>(X: Finite<T>): IRel<T, T> {
    return new BitRelWrapper(BitRel.id(X));
  }
}

/************ Factory function ************/
export function makeRelFactory(strategy: RelStrategy): RelFactory {
  switch (strategy) {
    case 'naive': return new NaiveRelFactory();
    case 'bit': return new BitRelFactory();
  }
}

/************ Convenience functions ************/
export function makeRel<A, B>(
  strategy: RelStrategy,
  A: Finite<A>, 
  B: Finite<B>, 
  pairs: Iterable<Pair<A, B>>
): IRel<A, B> {
  return makeRelFactory(strategy).fromPairs(A, B, pairs);
}

export function makeRelId<T>(strategy: RelStrategy, X: Finite<T>): IRel<T, T> {
  return makeRelFactory(strategy).id(X);
}

/************ Performance comparison utilities ************/
export function compareStrategies<A, B>(
  A: Finite<A>,
  B: Finite<B>,
  pairs: Iterable<Pair<A, B>>,
  operations: Array<(rel: IRel<A, B>) => any>
): {
  naive: { times: number[]; results: any[] };
  bit: { times: number[]; results: any[] };
} {
  const naiveRel = makeRel('naive', A, B, pairs);
  const bitRel = makeRel('bit', A, B, pairs);
  
  const timeOperation = (rel: IRel<A, B>, op: (rel: IRel<A, B>) => any) => {
    const start = performance.now();
    const result = op(rel);
    const end = performance.now();
    return { time: end - start, result };
  };
  
  const naiveResults = operations.map(op => timeOperation(naiveRel, op));
  const bitResults = operations.map(op => timeOperation(bitRel, op));
  
  return {
    naive: {
      times: naiveResults.map(r => r.time),
      results: naiveResults.map(r => r.result)
    },
    bit: {
      times: bitResults.map(r => r.time),
      results: bitResults.map(r => r.result)
    }
  };
}

/************ Global strategy configuration ************/
let globalStrategy: RelStrategy = 'naive';

export function setGlobalRelStrategy(strategy: RelStrategy): void {
  globalStrategy = strategy;
}

export function getGlobalRelStrategy(): RelStrategy {
  return globalStrategy;
}

export function createRel<A, B>(A: Finite<A>, B: Finite<B>, pairs: Iterable<Pair<A, B>>): IRel<A, B> {
  return makeRel(globalStrategy, A, B, pairs);
}

export function createRelId<T>(X: Finite<T>): IRel<T, T> {
  return makeRelId(globalStrategy, X);
}