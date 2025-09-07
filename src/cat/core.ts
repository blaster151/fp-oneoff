// Minimal, TS-friendly categorical core for small/large categories and functors.

export type Id = symbol;

// A morphism always carries enough info to compose safely.
export interface Mor<O, A, B> {
  readonly id: Id;
  readonly dom: O;
  readonly cod: O;
  readonly run: (a: A) => B;
}

// Small = enumerable objects (we can list/traverse).
export interface SmallCategory<O, A> {
  readonly name: string;
  readonly objects: () => ReadonlyArray<O>;
  id<A1>(o: O): Mor<O, A1, A1>;
  comp<A1, B1, C1>(g: Mor<O, B1, C1>, f: Mor<O, A1, B1>): Mor<O, A1, C1>;
}

// Large = plural objects (no requirement to enumerate).
export interface LargeCategory<O> {
  readonly name: string;
  id<A1>(o: O): Mor<O, A1, A1>;
  comp<A1, B1, C1>(g: Mor<O, B1, C1>, f: Mor<O, A1, B1>): Mor<O, A1, C1>;
}

// A functor between categories. Codomain can be large.
export interface Functor<CO, DO, CA, DA> {
  readonly name: string;
  // on objects
  F0(o: CO): DO;
  // on morphisms
  F1<A, B>(m: Mor<CO, A, B>): Mor<DO, CA extends A ? A : A, DA extends B ? B : B>;
}

// Quick helpers
export const mkMor = <O, A, B>(dom: O, cod: O, run: (a: A) => B): Mor<O, A, B> => ({
  id: Symbol(),
  dom,
  cod,
  run,
});

// Law checkers (runtime, small data only).
export function checkFunctorLaws<CO, DO, A, B, C>(
  C: { id<T>(o: CO): Mor<CO, T, T>; comp<T, U, V>(g: Mor<CO, U, V>, f: Mor<CO, T, U>): Mor<CO, T, V>; },
  D: { id<T>(o: DO): Mor<DO, T, T>; comp<T, U, V>(g: Mor<DO, U, V>, f: Mor<DO, T, U>): Mor<DO, T, V>; },
  F: Functor<CO, DO, A, B>
) {
  return {
    preservesId<T>(o: CO) {
      const left = F.F1<T,T>(C.id<T>(o)).run;
      const right = D.id<T>(F.F0(o)).run;
      // Compare by sampling; caller supplies points if desired.
      return (x: T) => Object.is(left(x), right(x));
    },
    preservesComp<T, U, V>(f: Mor<CO, T, U>, g: Mor<CO, U, V>) {
      const left = F.F1(C.comp(g, f)).run;
      const right = D.comp(F.F1(g), F.F1(f)).run;
      return (x: T) => Object.is(left(x), right(x));
    }
  };
}