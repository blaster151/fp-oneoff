/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// cps-shift-reset-worked-examples.ts
// Comprehensive worked examples of continuation monad and delimited continuations
// Perfect for documentation and educational purposes

import { Cont, callCC, factCPS, findFirst, contBoth, cps } from "../types/cont.js";
import { reset, shift, abort, safeDiv, escape } from "../types/shift-reset.js";

const id = <T>(x: T) => x;

console.log('='.repeat(80));
console.log('📚 CPS & SHIFT/RESET WORKED EXAMPLES FOR DOCUMENTATION');
console.log('='.repeat(80));

// ============================================================================
// SECTION 1: Basic Continuation Monad Operations
// ============================================================================

console.log('\n📖 SECTION 1: BASIC CONTINUATION MONAD');
console.log('-'.repeat(50));

// Example 1.1: Simple continuation with map
console.log('\n🔹 Example 1.1: Basic continuation operations');
const simple = Cont.chain<number, number, string>(x => 
  Cont.of<number>()(x.toString() + "!")
)(Cont.of<number>()(42));

const result1 = Cont.run(simple, id);
console.log(`   Cont.of(42) >>= (x => return x.toString() + "!")`)
console.log(`   Result: "${result1}"`);

// Example 1.2: Continuation composition
console.log('\n🔹 Example 1.2: Continuation composition');
const addTen = (n: number) => Cont.of<string>()(n + 10);
const toString = (n: number) => Cont.of<string>()(n.toString());

const composed = Cont.chain<string, number, string>(toString)(addTen(32));
const result2 = Cont.run(composed, id);
console.log(`   32 |> addTen |> toString = "${result2}"`);

// Example 1.3: CPS factorial (recursive continuation)
console.log('\n🔹 Example 1.3: CPS factorial (recursive)');
const fact5 = factCPS(5);
const fact7 = factCPS(7);
console.log(`   factCPS(5) = ${Cont.run(fact5, id)}`);
console.log(`   factCPS(7) = ${Cont.run(fact7, id)}`);

// ============================================================================
// SECTION 2: Call/CC (Call with Current Continuation)
// ============================================================================

console.log('\n📖 SECTION 2: CALL/CC - ESCAPE CONTINUATIONS');
console.log('-'.repeat(50));

// Example 2.1: Early exit with callCC
console.log('\n🔹 Example 2.1: Early exit pattern');
const earlyExit = callCC<string, string, never>(escape => {
  return Cont.chain<string, number, string>(x => {
    if (x > 10) {
      return escape(`Early exit with ${x}!`);
    }
    return Cont.of<string>()(`Normal completion: ${x}`);
  })(Cont.of<string>()(15));
});

const result3 = Cont.run(earlyExit, id);
console.log(`   if (15 > 10) then escape("Early exit!") else continue`);
console.log(`   Result: "${result3}"`);

// Example 2.2: Search with early termination
console.log('\n🔹 Example 2.2: Search with early termination');
const numbers = [1, 3, 5, 8, 9, 12, 15];
const firstEven = findFirst((n: number) => n % 2 === 0, numbers);
const firstBig = findFirst((n: number) => n > 100, numbers);

console.log(`   Find first even in [${numbers.join(', ')}]:`);
console.log(`   Result: ${Cont.run(firstEven, x => x ?? 'none')}`);
console.log(`   Find first > 100: ${Cont.run(firstBig, x => x ?? 'none')}`);

// Example 2.3: Exception-like behavior
console.log('\n🔹 Example 2.3: Exception-like control flow');
const safeOperation = callCC<string, number, string>(throwError => {
  return Cont.chain<string, number, number>(x => {
    if (x < 0) {
      return throwError("Negative numbers not allowed!");
    }
    return Cont.chain<string, number, number>(y => {
      if (y === 0) {
        return throwError("Division by zero!");
      }
      return Cont.of<string>()(100 / y);
    })(Cont.of<string>()(x));
  })(Cont.of<string>()(-5)); // Try with -5, then 0, then 4
});

const result4 = Cont.run(safeOperation, x => typeof x === 'string' ? `Error: ${x}` : `Success: ${x}`);
console.log(`   Safe operation with input -5: ${result4}`);

// ============================================================================
// SECTION 3: Delimited Continuations - Reset/Shift
// ============================================================================

console.log('\n📖 SECTION 3: DELIMITED CONTINUATIONS - SHIFT/RESET');
console.log('-'.repeat(50));

// Example 3.1: Classic shift/reset - compute 1 + (captured continuation applied to 5)
console.log('\n🔹 Example 3.1: Classic shift/reset example');
const prog = reset<number, number>(
  Cont.chain<number, number, number>(x => Cont.of<number>()(x + 1))(
    shift<number, number>(k => k(5))
  )
);

const result5 = Cont.run(prog, id);
console.log(`   reset(shift k -> k(5) >>= (x -> x + 1))`);
console.log(`   Result: ${result5} (5 + 1 = 6)`);

// Example 3.2: Capturing and reusing continuations
console.log('\n🔹 Example 3.2: Capturing and reusing continuations');
const multiUse = reset<number, number>(
  Cont.chain<number, number, number>(x => Cont.of<number>()(x * 10))(
    shift<number, number>(k => {
      // Use the captured continuation multiple times
      const result1 = Cont.run(k(3), id);  // 3 * 10 = 30
      const result2 = Cont.run(k(7), id);  // 7 * 10 = 70
      return Cont.of<number>()(result1 + result2); // 30 + 70 = 100
    })
  )
);

const result6 = Cont.run(multiUse, id);
console.log(`   Capture continuation k, use k(3) and k(7), sum results`);
console.log(`   k(3) = 30, k(7) = 70, total = ${result6}`);

// Example 3.3: Nested shift/reset operations
console.log('\n🔹 Example 3.3: Nested shift/reset operations');
const nested = reset<string, string>(
  Cont.chain<string, number, string>(x => {
    return shift<string, string>(outerK => {
      return reset<string, string>(
        Cont.chain<string, number, string>(y => {
          return shift<string, string>(innerK => {
            const inner = Cont.run(innerK(y * 2), id);
            return outerK(`outer(${inner})`);
          });
        })(Cont.of<string>()(x))
      );
    });
  })(Cont.of<string>()(5))
);

const result7 = Cont.run(nested, id);
console.log(`   Nested shift/reset with input 5: "${result7}"`);

// ============================================================================
// SECTION 4: Error Handling and Control Flow
// ============================================================================

console.log('\n📖 SECTION 4: ERROR HANDLING & CONTROL FLOW');
console.log('-'.repeat(50));

// Example 4.1: Abort for early termination
console.log('\n🔹 Example 4.1: Abort for early termination');
const computation = (input: number) => reset<string | number, string | number>(
  Cont.chain<string | number, number, string | number>(x => {
    if (x < 0) {
      return abort<string | number, string, string | number>("Negative input rejected");
    }
    if (x === 0) {
      return abort<string | number, string, string | number>("Zero input rejected");
    }
    return Cont.of<string | number>()(x * x);
  })(Cont.of<string | number>()(input))
);

console.log(`   computation(-3): ${Cont.run(computation(-3), x => x)}`);
console.log(`   computation(0):  ${Cont.run(computation(0), x => x)}`);
console.log(`   computation(4):  ${Cont.run(computation(4), x => x)}`);

// Example 4.2: Safe division with error handling
console.log('\n🔹 Example 4.2: Safe division with error handling');
const division1 = reset(safeDiv(15, 3) as any);
const division2 = reset(safeDiv(10, 0) as any);

console.log(`   safeDiv(15, 3): ${Cont.run(division1, x => x)}`);
console.log(`   safeDiv(10, 0): ${Cont.run(division2, x => x)}`);

// Example 4.3: Multiple exit points
console.log('\n🔹 Example 4.3: Multiple exit points');
const multiExit = (input: string) => reset<string, string>(
  Cont.chain<string, string, string>(x => {
    if (x === "early") {
      return escape<string, string, string>("Early exit taken");
    }
    if (x === "abort") {
      return abort<string, string, string>("Aborted by user");
    }
    if (x === "error") {
      return Cont.of<string>()("Error: invalid input");
    }
    return Cont.of<string>()(`Normal processing: ${x}`);
  })(Cont.of<string>()(input))
);

console.log(`   multiExit("early"): ${Cont.run(multiExit("early"), id)}`);
console.log(`   multiExit("abort"): ${Cont.run(multiExit("abort"), id)}`);
console.log(`   multiExit("normal"): ${Cont.run(multiExit("normal"), id)}`);

// ============================================================================
// SECTION 5: Advanced Patterns
// ============================================================================

console.log('\n📖 SECTION 5: ADVANCED PATTERNS');
console.log('-'.repeat(50));

// Example 5.1: Generator-like behavior
console.log('\n🔹 Example 5.1: Generator-like yielding');
const generator = reset<number[], number[]>(
  shift<number[], number[]>(_k => {
    // Simulate yielding multiple values
    const values = [1, 4, 9, 16, 25]; // squares
    return Cont.of<number[]>()(values);
  })
);

const result8 = Cont.run(generator, id);
console.log(`   Generator yields: [${result8.join(', ')}]`);

// Example 5.2: Backtracking search
console.log('\n🔹 Example 5.2: Backtracking search pattern');
const backtrack = (candidates: string[]) => reset<string, string>(
  shift<string, string>(k => {
    for (const candidate of candidates) {
      if (candidate.includes("success")) {
        return k(`Found solution: ${candidate}`);
      }
    }
    return Cont.of<string>()("No solution found");
  })
);

const searchResult = backtrack(["fail1", "fail2", "success-A", "fail3"]);
console.log(`   Backtrack search: ${Cont.run(searchResult, id)}`);

// Example 5.3: Continuation combination
console.log('\n🔹 Example 5.3: Continuation combination');
const contA = Cont.of<string>()("Hello");
const contB = Cont.of<string>()("World");
const combined = contBoth(contA, contB);

const result9 = Cont.run(combined, ([a, b]) => `${a}, ${b}!`);
console.log(`   contBoth("Hello", "World"): "${result9}"`);

// Example 5.4: CPS conversion
console.log('\n🔹 Example 5.4: CPS conversion');
const square = (n: number) => n * n;
const cpsSquare = cps(square);

const result10 = Cont.run(cpsSquare(8), id);
console.log(`   cps(square)(8): ${result10}`);

// ============================================================================
// SECTION 6: Practical Applications
// ============================================================================

console.log('\n📖 SECTION 6: PRACTICAL APPLICATIONS');
console.log('-'.repeat(50));

// Example 6.1: Async-like sequential operations (simulation)
console.log('\n🔹 Example 6.1: Sequential operation simulation');
const asyncLike = reset<string, string>(
  Cont.chain<string, string, string>(step1 => {
    return Cont.chain<string, string, string>(step2 => {
      return Cont.chain<string, string, string>(step3 => {
        return Cont.of<string>()(`Pipeline: ${step1} -> ${step2} -> ${step3}`);
      })(Cont.of<string>()("step3"));
    })(Cont.of<string>()("step2"));
  })(Cont.of<string>()("step1"))
);

const result11 = Cont.run(asyncLike, id);
console.log(`   Sequential pipeline: "${result11}"`);

// Example 6.2: State machine simulation
console.log('\n🔹 Example 6.2: State machine with continuations');
const stateMachine = (initialState: string) => reset<string, string>(
  Cont.chain<string, string, string>(state => {
    return shift<string, string>(k => {
      switch (state) {
        case "start":
          return k("processing");
        case "processing":
          return k("completed");
        case "completed":
          return Cont.of<string>()("State machine finished");
        default:
          return Cont.of<string>()(`Unknown state: ${state}`);
      }
    });
  })(Cont.of<string>()(initialState))
);

const result12 = Cont.run(stateMachine("start"), id);
console.log(`   State machine from "start": "${result12}"`);

// Example 6.3: Resource management pattern
console.log('\n🔹 Example 6.3: Resource management simulation');
const withResource = <T>(resource: string, computation: (r: string) => Cont<T, T>) => 
  reset<T, T>(
    Cont.chain<T, string, T>(r => {
      console.log(`     [Resource] Acquired: ${r}`);
      return Cont.chain<T, T, T>(result => {
        console.log(`     [Resource] Released: ${r}`);
        return Cont.of<T>()(result);
      })(computation(r));
    })(Cont.of<T>()(resource))
  );

const resourceResult = withResource("database-connection", (conn) => 
  Cont.of<string>()(`Query result using ${conn}`)
);

console.log(`   Resource management example:`);
const result13 = Cont.run(resourceResult, id);
console.log(`   Final result: "${result13}"`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📋 SUMMARY OF WORKED EXAMPLES');
console.log('='.repeat(80));

console.log(`
✅ CONTINUATION MONAD PATTERNS:
   • Basic operations: of, map, chain, ap
   • Composition and sequencing
   • CPS factorial and recursive patterns
   
✅ CALL/CC PATTERNS:
   • Early exit and exception-like control
   • Search with termination
   • Multiple exit points
   
✅ SHIFT/RESET PATTERNS:
   • Delimited control boundaries
   • Continuation capture and reuse
   • Nested delimited operations
   
✅ ERROR HANDLING:
   • Abort for early termination
   • Safe operations with error propagation
   • Multiple error handling strategies
   
✅ ADVANCED PATTERNS:
   • Generator-like yielding
   • Backtracking search
   • Continuation combination
   • CPS conversion utilities
   
✅ PRACTICAL APPLICATIONS:
   • Sequential operation pipelines
   • State machine simulation
   • Resource management patterns
   
🎓 EDUCATIONAL VALUE:
   • Clear progression from basic to advanced
   • Real-world applicable patterns
   • Comprehensive coverage of continuation concepts
   • Perfect for documentation and tutorials
`);

console.log('='.repeat(80));