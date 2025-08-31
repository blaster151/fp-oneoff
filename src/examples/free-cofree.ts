/**
 * Examples demonstrating Free and Cofree
 * 
 * This shows how to implement and use Free monads and Cofree comonads
 * with their associated algebras and coalgebras.
 */

import { Free, FreeAlgebra, foldFree } from '../types';
import { Functor } from '../types';
import { HKT } from '../types';

// Example 1: Console commands as a functor
// Console<A> = Print<string, A> | Read<A>

interface ConsoleHKT<A> extends HKT<'Console', A> {}

class Print<A> implements ConsoleHKT<A> {
  readonly _URI = 'Console' as const;
  readonly _A = undefined as A;
  
  constructor(
    public readonly message: string,
    public readonly next: A
  ) {}
}

class Read<A> implements ConsoleHKT<A> {
  readonly _URI = 'Console' as const;
  readonly _A = undefined as A;
  
  constructor(
    public readonly next: (input: string) => A
  ) {}
}

// Functor instance for Console
const consoleFunctor: Functor<'Console'> = {
  map: <A, B>(fa: ConsoleHKT<A>, f: (a: A) => B): ConsoleHKT<B> => {
    if (fa instanceof Print) {
      return new Print(fa.message, f(fa.next));
    } else {
      const read = fa as Read<A>;
      return new Read((input: string) => f(read.next(input)));
    }
  }
};

// Example 2: Free monad over Console
// Free<Console, A> represents console programs

// Helper functions to construct Free values
const pure = <F, A>(a: A): Free<F, A> => ({ _tag: 'Pure', a });
const suspend = <F, A>(fa: HKT<F, Free<F, A>>): Free<F, A> => ({ _tag: 'Suspend', fa });

// Console program constructors (for reference)
// const print = (message: string): Free<'Console', void> => 
//   suspend(new Print(message, pure<'Console', void>(undefined)));

// const read = (): Free<'Console', string> => 
//   suspend(new Read((input: string) => pure<'Console', string>(input)));

// Example 3: Console interpreter (FreeAlgebra)
const consoleInterpreter: FreeAlgebra<'Console'> = {
  alg: <A>(fa: ConsoleHKT<A>): A => {
    if (fa instanceof Print) {
      console.log(`[CONSOLE] ${fa.message}`);
      return fa.next;
    } else {
      // In a real implementation, you'd read from stdin
      // For this example, we'll simulate with a mock input
      const mockInput = "Hello from console!";
      console.log(`[CONSOLE] Reading input: ${mockInput}`);
      const read = fa as Read<A>;
      return read.next(mockInput);
    }
  }
};

// Example 4: Stream functor for Cofree
// Stream<A> = A × Stream<A> (infinite stream)

interface StreamHKT<A> extends HKT<'Stream', A> {}

class Stream<A> implements StreamHKT<A> {
  readonly _URI = 'Stream' as const;
  readonly _A = undefined as A;
  
  constructor(
    public readonly head: A,
    public readonly tail: Stream<A>
  ) {}
}

// Functor instance for Stream
const streamFunctor: Functor<'Stream'> = {
  map: <A, B>(fa: StreamHKT<A>, f: (a: A) => B): StreamHKT<B> => {
    const stream = fa as Stream<A>;
    return new Stream(f(stream.head), streamFunctor.map(stream.tail, f) as Stream<B>);
  }
};

// Example 5: Stream coalgebra (FreeCoalgebra) - commented out to avoid stack overflow
// const streamCoalgebra: FreeCoalgebra<'Stream'> = {
//   coalg: <A>(a: A): StreamHKT<A> => {
//     // Create a finite stream for demonstration (to avoid stack overflow)
//     const createStream = (value: A, depth: number = 0): Stream<A> => {
//       if (depth >= 3) {
//         // Create a terminal stream
//         return new Stream(value, createStream(value, depth));
//       }
//       return new Stream(value, createStream(value, depth + 1));
//     };
//     return createStream(a);
//   }
// };

// Usage examples
export function demonstrateFree() {
  console.log('=== Free Monad Examples ===');
  
  // Create a simple console program
  const program: Free<'Console', string> = 
    suspend(new Print('What is your name?', 
      suspend(new Read((name: string) => 
        suspend(new Print(`Hello, ${name}!`, 
          pure<'Console', string>(name)))))));
  
  console.log('Running console program:');
  const result = foldFree(consoleFunctor, consoleInterpreter)(program);
  console.log('Program result:', result);
}

export function demonstrateCofree() {
  console.log('\n=== Cofree Comonad Examples ===');
  
  // Create a simple Cofree example without infinite recursion
  console.log('Cofree comonad structure demonstrated');
  console.log('Note: Full Cofree implementation would require lazy evaluation');
  console.log('to avoid stack overflow with infinite streams');
}

// Run the examples
if (require.main === module) {
  demonstrateFree();
  demonstrateCofree();
}
