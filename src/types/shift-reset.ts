// shift-reset.ts
// Delimited continuations with shift/reset operators
// Implements Danvy-Filinski style delimited control for Set-level computations

import { Cont } from './cont.js';

/************ Delimited Continuation Types ************/

// A delimited continuation computation
export type DelimCont<R, A> = Cont<R, A>;

// The type of captured continuations in shift
export type CapturedCont<R, A> = (a: A) => Cont<R, R>;

/************ Core Delimited Control Operators ************/

/**
 * reset : Cont<A, A> -> Cont<R, A>
 * 
 * Closes the current delimited continuation by evaluating the inner CPS 
 * computation with the identity continuation and passing the result to 
 * the outer continuation.
 * 
 * The reset operator establishes a delimiter/boundary for control effects.
 * Any shift operations inside will only capture continuations up to this point.
 */
export const reset = <R, A>(m: Cont<A, A>): Cont<R, A> =>
  k => k(Cont.eval(m));

/**
 * shift : ((A -> Cont<R, R>) -> Cont<R, R>) -> Cont<R, A>
 * 
 * Captures the current continuation up to the nearest reset boundary,
 * reifies it as a function k: A -> Cont<R, R>, and lets the function 'f' 
 * decide how/if to resume it.
 * 
 * This implements Danvy-Filinski style shift with one delimiter level,
 * which is sufficient for most Set-level categorical computations.
 * 
 * @param f - Function that receives the captured continuation and produces a result
 * @returns A delimited continuation that can be used within a reset boundary
 */
export const shift = <R, A>(
  f: (k: CapturedCont<R, A>) => Cont<R, R>
): Cont<R, A> =>
  k => {
    // Give 'f' the current continuation as a function A -> Cont<R,R>
    // The captured continuation 'k' is wrapped to fit the expected type
    const capturedK: CapturedCont<R, A> = (a: A) => {
      // Resume the captured continuation k with value 'a'
      // Wrap the result in a continuation that returns it directly
      return Cont.of<R>()(k(a));
    };
    
    // Evaluate the result of f(capturedK) at the delimiter boundary
    return Cont.eval(f(capturedK));
  };

/************ Utility Operators ************/

/**
 * control : ((A -> Cont<R, R>) -> Cont<R, R>) -> Cont<R, A>
 * 
 * Alias for shift - some literature uses 'control' instead of 'shift'
 */
export const control = shift;

/**
 * prompt : Cont<A, A> -> Cont<R, A>
 * 
 * Alias for reset - some literature uses 'prompt' instead of 'reset'
 */
export const prompt = reset;

/************ Higher-Level Delimited Control Patterns ************/

/**
 * abort : A -> Cont<R, B>
 * 
 * Abort the current computation and return the given value,
 * discarding the rest of the computation up to the nearest reset.
 */
export const abort = <R, A, B>(a: A): Cont<R, B> =>
  shift<R, B>((_k: CapturedCont<R, B>) => Cont.of<R>()(a as unknown as R));

/**
 * yield : A -> Cont<R, A>
 * 
 * Yield a value and continue with the current computation.
 * This is useful for implementing generators or iterators.
 */
export const yield_ = <R, A>(a: A): Cont<R, A> =>
  shift<R, A>((k: CapturedCont<R, A>) => 
    Cont.chain<R, R, R>((r: R) => Cont.of<R>()(r))(k(a))
  );

/**
 * escape : A -> Cont<R, B>
 * 
 * Escape from the current computation with the given value,
 * similar to abort but with clearer semantics for error handling.
 */
export const escape = <R, A, B>(a: A): Cont<R, B> => abort<R, A, B>(a);

/************ Delimited Continuation Combinators ************/

/**
 * pushPrompt : Cont<A, A> -> Cont<A, A>
 * 
 * Push a new prompt/delimiter without changing the continuation type.
 * Useful for nested delimited control.
 */
export const pushPrompt = <A>(m: Cont<A, A>): Cont<A, A> =>
  reset(m);

/**
 * withSubCont : ((A -> Cont<R, R>) -> Cont<R, R>) -> Cont<R, A>
 * 
 * Alias for shift with more descriptive name for subcontinuation capture.
 */
export const withSubCont = shift;

/**
 * composeContinuations : CapturedCont<R, A> -> CapturedCont<R, B> -> CapturedCont<R, A>
 * 
 * Compose two captured continuations in sequence.
 */
export const composeContinuations = <R, A, B>(
  k1: CapturedCont<R, A>,
  k2: CapturedCont<R, B>
) => (a: A): Cont<R, R> =>
  Cont.chain<R, R, R>((r: R) => k2(r as unknown as B))(k1(a));

/************ Integration with Existing Continuation Infrastructure ************/

/**
 * Convert regular continuation to delimited continuation
 */
export const toDelimited = <R, A>(m: Cont<R, A>): DelimCont<R, A> => m;

/**
 * Convert delimited continuation to regular continuation
 */
export const fromDelimited = <R, A>(m: DelimCont<R, A>): Cont<R, A> => m;

/**
 * Run a delimited continuation with explicit reset
 */
export const runDelimited = <A>(m: DelimCont<A, A>): A =>
  Cont.eval(reset(m));

/************ Examples and Demonstrations ************/

/**
 * Example: Simple generator using shift/reset
 */
export const simpleGenerator = function*(): Generator<number, void, unknown> {
  // This would be implemented using shift/reset in a real generator system
  // Here we show the conceptual structure
  yield 1;
  yield 2;
  yield 3;
};

/**
 * Example: Exception handling with delimited continuations
 */
export const safeDiv = (x: number, y: number): Cont<string | number, number> =>
  y === 0 
    ? abort<string | number, string, number>("Division by zero")
    : Cont.of<string | number>()(x / y);

/**
 * Example: Backtracking search with shift/reset
 */
export const choose = <R, A>(options: A[]): Cont<R, A> =>
  shift<R, A>((k: CapturedCont<R, A>) => {
    // Try each option and collect results
    const tryOption = (opts: A[]): Cont<R, R> => {
      if (opts.length === 0) {
        return Cont.of<R>()(undefined as unknown as R);
      }
      const [first, ...rest] = opts;
      return Cont.chain<R, R, R>((result: R) => 
        result !== undefined ? Cont.of<R>()(result) : tryOption(rest)
      )(k(first!));
    };
    return tryOption(options);
  });

/************ Demonstration Function ************/

export function demonstrateShiftReset(): void {
  console.log('='.repeat(70));
  console.log('🎭 DELIMITED CONTINUATIONS (SHIFT/RESET) DEMO');
  console.log('='.repeat(70));

  // 1. Basic reset operation
  console.log('\n📍 1. BASIC RESET:');
  const simple = Cont.chain<number, number, number>(x => 
    Cont.of<number>()(x * 2)
  )(Cont.of<number>()(21));
  
  const resetResult = Cont.run(reset(simple), x => x);
  console.log('   21 * 2 through reset =', resetResult);

  // 2. Simple shift example
  console.log('\n🔄 2. SIMPLE SHIFT:');
  const shiftExample = reset<string, number>(
    Cont.chain<number, number, number>(x => {
      return shift<number, number>((k: CapturedCont<number, number>) => {
        // Double the value before passing to continuation
        return k(x * 2);
      });
    })(Cont.of<number>()(5))
  );
  
  const shiftResult = Cont.run(shiftExample, x => x.toString());
  console.log('   5 doubled through shift =', shiftResult);

  // 3. Abort example
  console.log('\n🛑 3. ABORT EXAMPLE:');
  const abortExample = reset<string, string>(
    Cont.chain<string, string, string>(_x => {
      return abort<string, string, string>("Aborted!");
    })(Cont.of<string>()("This will be ignored"))
  );
  
  const abortResult = Cont.run(abortExample, x => x);
  console.log('   Abort result:', abortResult);

  // 4. Safe division with error handling
  console.log('\n🔢 4. SAFE DIVISION:');
  const div1 = reset(safeDiv(10, 2) as Cont<string | number, string | number>);
  const div2 = reset(safeDiv(10, 0) as Cont<string | number, string | number>);
  
  const result1 = Cont.run(div1, x => `Result: ${x}`);
  const result2 = Cont.run(div2, x => `Result: ${x}`);
  
  console.log('   10 / 2 =', result1);
  console.log('   10 / 0 =', result2);

  // 5. Multiple shift operations
  console.log('\n🎯 5. MULTIPLE SHIFTS:');
  const multiShift = reset<number, number>(
    Cont.chain<number, number, number>(x => 
      shift<number, number>((k1: CapturedCont<number, number>) =>
        shift<number, number>((k2: CapturedCont<number, number>) => {
          // Apply both continuations
          return Cont.chain<number, number, number>((r1: number) =>
            k2(r1 + 1)
          )(k1(x + 10));
        })
      )
    )(Cont.of<number>()(5))
  );
  
  const multiResult = Cont.run(multiShift, x => x);
  console.log('   Multiple shifts on 5 =', multiResult);

  console.log('\n' + '='.repeat(70));
  console.log('✅ DELIMITED CONTINUATION FEATURES:');
  console.log('   🔹 Reset: Establishes delimiter boundaries');
  console.log('   🔹 Shift: Captures continuations up to nearest reset');
  console.log('   🔹 Abort: Early exit with value');
  console.log('   🔹 Composition: Multiple delimited operations');
  console.log('   🔹 Error handling: Safe computation patterns');
  console.log('   🔹 Integration: Works with existing Cont infrastructure');
  console.log('='.repeat(70));
}