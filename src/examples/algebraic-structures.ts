/**
 * Examples demonstrating algebraic structures
 * 
 * This shows how to implement and use Action, Algebra, Coalgebra,
 * LeftModule, and LeftComodule interfaces.
 */

import { Action, Algebra, Coalgebra, LeftModule, LeftComodule } from '../types';
import { HKT } from '../types';

// Example 1: Action of a monoid on a set
// Let's implement the action of the additive monoid (number, +, 0) on strings

const stringNumberAction: Action<number, string> = {
  act: (m: number, a: string) => {
    if (m === 0) return a; // act(one, a) = a
    return a.repeat(Math.abs(m)); // act(m, a) = a repeated m times
  }
};

// Example 2: Algebra for the List monad
// List<A> = [] | [A] | [A, A] | [A, A, A] | ...

interface ListHKT<A> extends HKT<'List', A> {}

// Concrete List type
type List<A> = A[];

const listAlgebra: Algebra<'List'> = {
  fold: <A>(ta: ListHKT<A>): A => {
    const list = ta as unknown as List<A>;
    // For demonstration, we'll just return the first element
    // In practice, you'd have a more sophisticated folding operation
    if (list.length > 0) {
      return list[0] as A;
    } else {
      throw new Error('Cannot fold empty list');
    }
  }
};

// Example 3: Coalgebra for the Stream comonad
// Stream<A> = (A, Stream<A>) - infinite stream

interface StreamHKT<A> extends HKT<'Stream', A> {}

class Stream<A> implements StreamHKT<A> {
  readonly _URI = 'Stream' as const;
  readonly _A = undefined as A;
  
  constructor(
    public readonly head: A,
    public readonly tail: () => Stream<A>
  ) {}
}

const streamCoalgebra: Coalgebra<'Stream'> = {
  unfold: <A>(a: A): StreamHKT<A> => {
    // Create an infinite stream starting with 'a'
    const createStream = (value: A): Stream<A> => {
      return new Stream(value, () => createStream(value));
    };
    return createStream(a);
  }
};

// Example 4: Left Module - simplified example
// We'll create a simple left module for the Identity monad

interface IdentityHKT<A> extends HKT<'Identity', A> {}

class Identity<A> implements IdentityHKT<A> {
  readonly _URI = 'Identity' as const;
  readonly _A = undefined as A;
  
  constructor(public readonly value: A) {}
  
  map<B>(f: (a: A) => B): Identity<B> {
    return new Identity(f(this.value));
  }
}

const identityLeftModule: LeftModule<'Identity', 'Identity'> = {
  act: <A>(mta: HKT<'Identity', HKT<'Identity', A>>): HKT<'Identity', A> => {
    const outerIdentity = mta as Identity<Identity<A>>;
    return outerIdentity.value;
  }
};

// Example 5: Left Comodule - simplified example
// We'll create a simple left comodule for the Identity comonad

const identityLeftComodule: LeftComodule<'Identity', 'Identity'> = {
  coact: <A>(ma: HKT<'Identity', A>): HKT<'Identity', HKT<'Identity', A>> => {
    const identity = ma as Identity<A>;
    return new Identity(identity);
  }
};

// Usage examples
export function demonstrateAction() {
  console.log('=== Action Examples ===');
  
  console.log('String number action:');
  console.log('act(0, "hello") =', stringNumberAction.act(0, 'hello'));
  console.log('act(3, "hi") =', stringNumberAction.act(3, 'hi'));
  console.log('act(2, "x") =', stringNumberAction.act(2, 'x'));
}

export function demonstrateAlgebra() {
  console.log('\n=== Algebra Examples ===');
  
  const list: List<number> = [1, 2, 3, 4, 5];
  const result = listAlgebra.fold(list as unknown as ListHKT<number>);
  
  console.log('List algebra fold on [1,2,3,4,5]:', result);
}

export function demonstrateCoalgebra() {
  console.log('\n=== Coalgebra Examples ===');
  
  const stream = streamCoalgebra.unfold('hello') as Stream<string>;
  
  console.log('Stream coalgebra unfold from "hello":');
  console.log('head:', stream.head);
  console.log('tail().head:', stream.tail().head);
  console.log('tail().tail().head:', stream.tail().tail().head);
}

export function demonstrateLeftModule() {
  console.log('\n=== Left Module Examples ===');
  
  const innerIdentity = new Identity<number>(42);
  const outerIdentity = new Identity<Identity<number>>(innerIdentity);
  
  const result = identityLeftModule.act(outerIdentity);
  console.log('Identity left module act result:', result);
}

export function demonstrateLeftComodule() {
  console.log('\n=== Left Comodule Examples ===');
  
  const identity = new Identity<string>('hello');
  const coacted = identityLeftComodule.coact(identity) as Identity<Identity<string>>;
  
  console.log('Identity left comodule coact result:', coacted);
  console.log('Coacted value:', coacted.value.value);
}

// Run the examples
if (require.main === module) {
  demonstrateAction();
  demonstrateAlgebra();
  demonstrateCoalgebra();
  demonstrateLeftModule();
  demonstrateLeftComodule();
}
