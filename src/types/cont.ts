// cont.ts
// Continuation Monad: Cont<R, A> = (k: (a: A) => R) => R
// Provides continuation-passing style computation with callCC and delimited control

import { HKT, URItoKind } from './hkt.js';
import { Functor, Applicative, Monad } from './functors.js';

/************ Core Continuation Type ************/
export type Cont<R, A> = (k: (a: A) => R) => R;

/************ HKT Encoding for Cont ************/
// Register the Cont type in the HKT system
declare module './hkt.js' {
  interface URItoKind<A> {
    readonly 'Cont': Cont<any, A>;
  }
}

// Type alias for cleaner usage with HKT
export type ContHKT<A> = HKT<'Cont', A>;

/************ Core Constructors & Combinators ************/
export const Cont = {
  // Pure value: return a value in continuation monad
  of: <R>() => <A>(a: A): Cont<R, A> => 
    k => k(a),

  // Functor map: transform the value inside continuation
  map: <R, A, B>(f: (a: A) => B) => 
    (ma: Cont<R, A>): Cont<R, B> => 
    k => ma(a => k(f(a))),

  // Monadic bind: sequence continuation computations
  chain: <R, A, B>(f: (a: A) => Cont<R, B>) => 
    (ma: Cont<R, A>): Cont<R, B> => 
    k => ma(a => f(a)(k)),

  // Applicative apply: apply function in continuation to value in continuation
  ap: <R, A, B>(mf: Cont<R, (a: A) => B>) => 
    (ma: Cont<R, A>): Cont<R, B> => 
    k => mf(f => ma(a => k(f(a)))),

  // Run continuation with explicit continuation
  run: <R, A>(ma: Cont<R, A>, k: (a: A) => R): R => ma(k),

  // Evaluate delimited continuation using identity continuation
  eval: <A>(ma: Cont<A, A>): A => ma(x => x),

  // Lift a regular value into continuation monad
  pure: <R, A>(a: A): Cont<R, A> => k => k(a),

  // Lift a function to work on continuations
  liftA2: <R, A, B, C>(f: (a: A, b: B) => C) => 
    (ma: Cont<R, A>, mb: Cont<R, B>): Cont<R, C> => 
    k => ma(a => mb(b => k(f(a, b)))),
};

/************ Control Flow Operations ************/

/**
 * Call with current continuation (escape continuations)
 * 
 * @math THM-SHIFT-RESET @law LAW-MONAD-LAWS
 */
export const callCC = <R, A, B>(
  f: (escape: (a: A) => Cont<R, B>) => Cont<R, A>
): Cont<R, A> => 
  k => {
    // The escape continuation ignores the rest of the computation
    const escape = (a: A): Cont<R, B> => _k => k(a);
    return f(escape)(k);
  };

// Shift/Reset for delimited continuations (simplified version)
// Note: These are simplified implementations for demonstration
export const shift = <R, A>(
  f: (k: (a: A) => Cont<R, R>) => Cont<R, R>
): Cont<R, A> => 
  k => {
    const delimited = (a: A): Cont<R, R> => k2 => k2(k(a));
    return f(delimited)(x => x);
  };

export const reset = <A>(ma: Cont<A, A>): Cont<A, A> => 
  k => k(Cont.eval(ma));

/************ Type Class Instances ************/

// Create a parameterized functor instance for a fixed R type
export const ContFunctor = <R>(): Functor<'Cont'> => ({
  map: <A, B>(fa: HKT<'Cont', A>, f: (a: A) => B): HKT<'Cont', B> => {
    const cont = fa as unknown as Cont<R, A>;
    return Cont.map<R, A, B>(f)(cont) as unknown as HKT<'Cont', B>;
  }
});

// Create a parameterized applicative instance for a fixed R type
export const ContApplicative = <R>(): Applicative<'Cont'> => ({
  ...ContFunctor<R>(),
  of: <A>(a: A): HKT<'Cont', A> => 
    Cont.of<R>()(a) as unknown as HKT<'Cont', A>,
  ap: <A, B>(ff: HKT<'Cont', (a: A) => B>, fa: HKT<'Cont', A>): HKT<'Cont', B> => {
    const contF = ff as unknown as Cont<R, (a: A) => B>;
    const contA = fa as unknown as Cont<R, A>;
    return Cont.ap<R, A, B>(contF)(contA) as unknown as HKT<'Cont', B>;
  }
});

// Create a parameterized monad instance for a fixed R type
export const ContMonad = <R>(): Monad<'Cont'> => ({
  ...ContApplicative<R>(),
  chain: <A, B>(fa: HKT<'Cont', A>, f: (a: A) => HKT<'Cont', B>): HKT<'Cont', B> => {
    const cont = fa as unknown as Cont<R, A>;
    const contF = (a: A) => f(a) as unknown as Cont<R, B>;
    return Cont.chain<R, A, B>(contF)(cont) as unknown as HKT<'Cont', B>;
  }
});

/************ Utility Functions ************/

// Convert a regular function to CPS style
export const cps = <A, B, R>(f: (a: A) => B) => 
  (a: A): Cont<R, B> => 
  k => k(f(a));

// Convert a continuation to a regular function (if possible)
export const uncps = <A>(ma: Cont<A, A>): A => Cont.eval(ma);

// Compose continuations (right-to-left)
export const contCompose = <R, A, B, C>(
  g: (b: B) => Cont<R, C>,
  f: (a: A) => Cont<R, B>
) => (a: A): Cont<R, C> => 
  Cont.chain<R, B, C>(g)(f(a));

// Parallel composition (both continuations must succeed)
export const contBoth = <R, A, B>(
  ma: Cont<R, A>,
  mb: Cont<R, B>
): Cont<R, [A, B]> => 
  k => ma(a => mb(b => k([a, b])));

// Choice composition (first continuation to succeed wins)
export const contEither = <R, A>(
  ma: Cont<R, A>,
  mb: Cont<R, A>
): Cont<R, A> => 
  k => {
    let done = false;
    const guard = (a: A): R => {
      if (!done) {
        done = true;
        return k(a);
      }
      return k(a); // This shouldn't happen in well-formed code
    };
    // Try first continuation
    try {
      return ma(guard);
    } catch {
      // If first fails, try second
      return mb(guard);
    }
  };

/************ Performance Optimization Helpers ************/

// Trampoline to avoid stack overflow in deep continuations
export type Bounce<A> = 
  | { tag: 'Done', value: A }
  | { tag: 'More', thunk: () => Bounce<A> };

export const trampoline = <A>(bounce: Bounce<A>): A => {
  let current = bounce;
  while (current.tag === 'More') {
    current = current.thunk();
  }
  return current.value;
};

// Convert continuation to trampolined version
export const trampolined = <R, A>(ma: Cont<R, A>): Cont<Bounce<R>, A> => 
  k => ({ tag: 'More', thunk: () => ({ tag: 'Done', value: ma(a => trampoline(k(a))) }) });

/************ Integration with Existing Infrastructure ************/

// Convert to/from existing Strong monad interface
export const contToStrongMonad = <R>() => ({
  of: <A>(a: A) => Cont.of<R>()(a),
  map: <A, B>(ta: Cont<R, A>, f: (a: A) => B) => Cont.map<R, A, B>(f)(ta),
  chain: <A, B>(ta: Cont<R, A>, k: (a: A) => Cont<R, B>) => Cont.chain<R, A, B>(k)(ta),
  
  // Strong monad operations (trivial for Cont since it's naturally strong)
  strength: <A, B>(a: A, tb: Cont<R, B>): Cont<R, [A, B]> => 
    k => tb(b => k([a, b])),
  
  prod: <A, B>(ta: Cont<R, A>, tb: Cont<R, B>): Cont<R, [A, B]> => 
    contBoth(ta, tb),
  
  ap: <A, B>(tf: Cont<R, (a: A) => B>, ta: Cont<R, A>): Cont<R, B> => 
    Cont.ap<R, A, B>(tf)(ta)
});

/************ Examples and Demonstrations ************/

// Simple example: CPS factorial
export const factCPS = (n: number): Cont<number, number> => 
  n <= 1 
    ? Cont.of<number>()(1)
    : Cont.chain<number, number, number>(prev => 
        Cont.of<number>()(n * prev)
      )(factCPS(n - 1));

// Example with callCC: early exit from computation
export const findFirst = <A>(
  predicate: (a: A) => boolean,
  items: A[]
): Cont<A | undefined, A | undefined> => 
  callCC<A | undefined, A | undefined, A | undefined>(escape => {
    for (const item of items) {
      if (predicate(item)) {
        return escape(item);
      }
    }
    return Cont.of<A | undefined>()(undefined);
  });

// Demonstration function
export function demonstrateCont(): void {
  console.log('='.repeat(60));
  console.log('CONTINUATION MONAD DEMO');
  console.log('='.repeat(60));

  // Basic continuation usage
  const simple = Cont.chain<string, number, string>(n => 
    Cont.of<string>()(`Result: ${n}`)
  )(Cont.of<string>()(42));
  
  console.log('\n1. BASIC CONTINUATION:');
  console.log('  Input: 42');
  console.log('  Result:', Cont.run(simple, x => x));

  // Factorial example
  console.log('\n2. CPS FACTORIAL:');
  const fact5 = factCPS(5);
  console.log('  5! =', Cont.run(fact5, x => x));

  // CallCC example
  console.log('\n3. CALL/CC EARLY EXIT:');
  const numbers = [1, 3, 5, 8, 9, 12];
  const firstEven = findFirst((n: number) => n % 2 === 0, numbers);
  console.log('  First even in [1,3,5,8,9,12]:', Cont.run(firstEven, x => x));

  // Function composition
  console.log('\n4. CONTINUATION COMPOSITION:');
  const addOne = (n: number): Cont<number, number> => Cont.of<number>()(n + 1);
  const double = (n: number): Cont<number, number> => Cont.of<number>()(n * 2);
  const composed = contCompose(double, addOne);
  const result = Cont.run(composed(5), x => x); // (5 + 1) * 2 = 12
  console.log('  (5 + 1) * 2 =', result);

  console.log('\n' + '='.repeat(60));
  console.log('CONTINUATION FEATURES:');
  console.log('✓ Pure continuation monad implementation');
  console.log('✓ Call/CC for escape continuations');
  console.log('✓ Shift/Reset for delimited continuations');
  console.log('✓ Type class instances (Functor, Applicative, Monad)');
  console.log('✓ Integration with existing Strong monad infrastructure');
  console.log('✓ Trampoline support for stack safety');
  console.log('✓ CPS conversion utilities');
  console.log('='.repeat(60));
}