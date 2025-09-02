/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

import { HKT2, HKT3, Bifunctor, Trifunctor } from '../types';

// Example 1: Either as a Bifunctor
// Either<E, A> represents success (Right A) or failure (Left E)

// HKT2 encoding for Either
interface EitherHKT<E, A> extends HKT2<'Either', E, A> {}

// Concrete Either type
type Either<E, A> = Left<E> | Right<A>;

class Left<E> implements EitherHKT<E, never> {
  readonly _URI = 'Either' as const;
  readonly _E = undefined as E;
  readonly _A = undefined as never;
  constructor(readonly value: E) {}
}

class Right<A> implements EitherHKT<never, A> {
  readonly _URI = 'Either' as const;
  readonly _E = undefined as never;
  readonly _A = undefined as A;
  constructor(readonly value: A) {}
}

// Bifunctor instance for Either
const eitherBifunctor: Bifunctor<'Either'> = {
  bimap: <E, A, E2, A2>(
    fea: EitherHKT<E, A>, 
    f: (e: E) => E2, 
    g: (a: A) => A2
  ): EitherHKT<E2, A2> => {
    if (fea instanceof Left) {
      return new Left(f(fea.value)) as EitherHKT<E2, A2>;
    } else {
      return new Right(g((fea as Right<A>).value)) as EitherHKT<E2, A2>;
    }
  },
  
  mapLeft: <E, E2, A>(
    fea: EitherHKT<E, A>, 
    f: (e: E) => E2
  ): EitherHKT<E2, A> => {
    if (fea instanceof Left) {
      return new Left(f(fea.value)) as EitherHKT<E2, A>;
    } else {
      // For Right case, we need to cast through unknown to satisfy TypeScript
      return fea as unknown as EitherHKT<E2, A>;
    }
  }
};

// Example 2: ReaderT as a Trifunctor
// ReaderT<R, E, A> = R -> Either<E, A>

// HKT3 encoding for ReaderT
interface ReaderTHKT<R, E, A> extends HKT3<'ReaderT', R, E, A> {}

// Concrete ReaderT type
class ReaderT<R, E, A> implements ReaderTHKT<R, E, A> {
  readonly _URI = 'ReaderT' as const;
  readonly _R = undefined as R;
  readonly _E = undefined as E;
  readonly _A = undefined as A;
  
  constructor(private readonly run: (r: R) => Either<E, A>) {}
  
  // Helper method to run the reader
  execute(r: R): Either<E, A> {
    return this.run(r);
  }
}

// Trifunctor instance for ReaderT
const readerTTrifunctor: Trifunctor<'ReaderT'> = {
  trimap: <R, E, A, R2, E2, A2>(
    r: ReaderTHKT<R, E, A>, 
    fR: (r: R2) => R, 
    fE: (e: E) => E2, 
    fA: (a: A) => A2
  ): ReaderTHKT<R2, E2, A2> => {
    const readerT = r as ReaderT<R, E, A>;
    const transformed = new ReaderT<R2, E2, A2>((r2: R2) => {
      const result = readerT.execute(fR(r2));
      if (result instanceof Left) {
        return new Left(fE(result.value)) as Either<E2, A2>;
      } else {
        return new Right(fA((result as Right<A>).value)) as Either<E2, A2>;
      }
    });
    return transformed as ReaderTHKT<R2, E2, A2>;
  }
};

// Usage examples
function demonstrateBifunctor() {
  console.log('=== Bifunctor Examples ===');
  
  // Create some Either values
  const success: Either<string, number> = new Right(42);
  const failure: Either<string, number> = new Left('Something went wrong');
  
  // Use bimap to transform both sides
  const successTransformed = eitherBifunctor.bimap(
    success,
    (e: string) => `Error: ${e}`,  // transform error
    (a: number) => a * 2           // transform success
  );
  
  const failureTransformed = eitherBifunctor.bimap(
    failure,
    (e: string) => `Error: ${e}`,  // transform error
    (a: number) => a * 2           // transform success
  );
  
  console.log('Original success:', success);
  console.log('Transformed success:', successTransformed);
  console.log('Original failure:', failure);
  console.log('Transformed failure:', failureTransformed);
  
  // Use mapLeft to transform only the error side
  const failureWithPrefix = eitherBifunctor.mapLeft!(
    failure,
    (e: string) => `PREFIX: ${e}`
  );
  
  console.log('Failure with prefix:', failureWithPrefix);
}

function demonstrateTrifunctor() {
  console.log('\n=== Trifunctor Examples ===');
  
  // Create a ReaderT that reads a number and returns Either<string, number>
  const reader: ReaderT<number, string, number> = new ReaderT((r: number) => {
    if (r > 0) {
      return new Right(r * 2);
    } else {
      return new Left('Input must be positive');
    }
  });
  
  // Use trimap to transform all three type parameters
  const transformedReader = readerTTrifunctor.trimap(
    reader,
    (r: string) => parseInt(r),           // R2 (string) -> R (number)
    (e: string) => `Validation: ${e}`,    // E -> E2
    (a: number) => a + 10                 // A -> A2
  );
  
  console.log('Original reader with input 5:', reader.execute(5));
  console.log('Original reader with input -1:', reader.execute(-1));
  console.log('Transformed reader with input "5":', (transformedReader as ReaderT<string, string, number>).execute("5"));
  console.log('Transformed reader with input "-1":', (transformedReader as ReaderT<string, string, number>).execute("-1"));
}

// Run the examples
if (require.main === module) {
  demonstrateBifunctor();
  demonstrateTrifunctor();
}
