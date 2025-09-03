/**
 * Developer Demo:
 * - This file is not part of the library build.
 * - Do not import it from 'src/index.ts' or 'src/types/index.ts'.
 */

// shift-reset-demo.ts
// Comprehensive demonstration of delimited continuations

import { Cont, ShiftReset, CPS } from '../types/index.js';

function runShiftResetDemo() {
  console.log('='.repeat(80));
  console.log('🎭 DELIMITED CONTINUATIONS COMPREHENSIVE DEMO');
  console.log('='.repeat(80));

  // 1. Basic shift/reset mechanics
  console.log('\n📍 1. BASIC SHIFT/RESET MECHANICS:');
  
  // Simple computation with reset
  const basicReset = ShiftReset.reset<string, number>(
    Cont.Cont.map<number, number, number>(x => x * 3)(
      Cont.Cont.of<number>()(7)
    )
  );
  
  const resetResult = Cont.Cont.run(basicReset, x => `Result: ${x}`);
  console.log('   7 * 3 through reset:', resetResult);

  // 2. Capturing continuations with shift
  console.log('\n🔄 2. CAPTURING CONTINUATIONS:');
  
  const captureDemo = ShiftReset.reset<string, number>(
    Cont.Cont.chain<number, number, number>(x => {
      return ShiftReset.shift<number, number>((k) => {
        // We have captured the continuation k
        // Let's use it twice with different values
        return Cont.Cont.chain<number, number, number>(r1 =>
          Cont.Cont.map<number, number, number>(r2 => r1 + r2)(k(x + 10))
        )(k(x + 5));
      });
    })(Cont.Cont.of<number>()(3))
  );
  
  const captureResult = Cont.Cont.run(captureDemo, x => `Combined: ${x}`);
  console.log('   Captured continuation used twice:', captureResult);

  // 3. Abort/Escape patterns
  console.log('\n🛑 3. ABORT/ESCAPE PATTERNS:');
  
  const abortDemo = ShiftReset.reset<string, string>(
    Cont.Cont.chain<string, string, string>(x => {
      if (x === "error") {
        return ShiftReset.abort<string, string, string>("Computation aborted!");
      }
      return Cont.Cont.of<string>()(`Success: ${x}`);
    })(Cont.Cont.of<string>()("error"))
  );
  
  const abortResult = Cont.Cont.run(abortDemo, x => x);
  console.log('   Abort example:', abortResult);

  // 4. Safe division with error handling
  console.log('\n🔢 4. SAFE DIVISION WITH ERROR HANDLING:');
  
  const testDivision = (x: number, y: number) => {
    const result = ShiftReset.reset(ShiftReset.safeDiv(x, y) as any);
    return Cont.Cont.run(result, (r: any) => r);
  };
  
  console.log('   10 / 2 =', testDivision(10, 2));
  console.log('   10 / 0 =', testDivision(10, 0));
  console.log('   15 / 3 =', testDivision(15, 3));

  // 5. Nested shift/reset operations
  console.log('\n🎯 5. NESTED SHIFT/RESET:');
  
  const nestedDemo = ShiftReset.reset<number, number>(
    Cont.Cont.chain<number, number, number>(x => {
      return ShiftReset.shift<number, number>((outerK) => {
        return ShiftReset.reset<number, number>(
          Cont.Cont.chain<number, number, number>(y => {
            return ShiftReset.shift<number, number>((innerK) => {
              // Use both continuations
              return Cont.Cont.chain<number, number, number>(inner =>
                outerK(inner + 100)
              )(innerK(y * 2));
            });
          })(Cont.Cont.of<number>()(x + 1))
        );
      });
    })(Cont.Cont.of<number>()(5))
  );
  
  const nestedResult = Cont.Cont.run(nestedDemo, x => x);
  console.log('   Nested shift/reset result:', nestedResult);

  // 6. Generator-like behavior
  console.log('\n🔁 6. GENERATOR-LIKE BEHAVIOR:');
  
  const generatorDemo = ShiftReset.reset<number[], number[]>(
    Cont.Cont.chain<number[], number[], number[]>(_init => {
      return ShiftReset.shift<number[], number[]>((k) => {
        // Simulate yielding multiple values
        const values = [1, 2, 3, 4, 5];
        return Cont.Cont.of<number[]>()(values);
      });
    })(Cont.Cont.of<number[]>()([]))
  );
  
  const genResult = Cont.Cont.run(generatorDemo, x => x);
  console.log('   Generator-like result:', genResult);

  // 7. Backtracking search simulation
  console.log('\n🔍 7. BACKTRACKING SEARCH:');
  
  const backtrackDemo = ShiftReset.reset<string, string>(
    Cont.Cont.chain<string, string, string>(x => {
      const options = ["option1", "option2", "option3"];
      return ShiftReset.shift<string, string>((k) => {
        // Try each option until one succeeds
        for (const option of options) {
          if (option === "option2") {
            return k(`Found: ${option}`);
          }
        }
        return Cont.Cont.of<string>()("No options worked");
      });
    })(Cont.Cont.of<string>()("start"))
  );
  
  const backtrackResult = Cont.Cont.run(backtrackDemo, x => x);
  console.log('   Backtracking result:', backtrackResult);

  // 8. Using the CPS namespace
  console.log('\n🌐 8. USING CPS NAMESPACE:');
  
  const cpsDemo = CPS.reset<string, number>(
    CPS.Cont.chain<number, number, number>(x => {
      return CPS.shift<number, number>((k) => {
        return k(x * x);
      });
    })(CPS.Cont.of<number>()(4))
  );
  
  const cpsResult = CPS.Cont.run(cpsDemo, x => `CPS Result: ${x}`);
  console.log('   CPS namespace usage:', cpsResult);

  // 9. Control flow with multiple exits
  console.log('\n🚪 9. MULTIPLE EXIT POINTS:');
  
  const multiExitDemo = (input: string) => {
    const computation = ShiftReset.reset<string, string>(
      Cont.Cont.chain<string, string, string>(x => {
        if (x === "early") {
          return ShiftReset.escape<string, string, string>("Early exit!");
        }
        if (x === "middle") {
          return ShiftReset.abort<string, string, string>("Middle abort!");
        }
        return Cont.Cont.of<string>()(`Normal completion: ${x}`);
      })(Cont.Cont.of<string>()(input))
    );
    
    return Cont.Cont.run(computation, x => x);
  };
  
  console.log('   Input "normal":', multiExitDemo("normal"));
  console.log('   Input "early":', multiExitDemo("early"));
  console.log('   Input "middle":', multiExitDemo("middle"));

  console.log('\n' + '='.repeat(80));
  console.log('✅ DELIMITED CONTINUATIONS FEATURES DEMONSTRATED:');
  console.log('   🔹 Basic shift/reset mechanics and delimiter boundaries');
  console.log('   🔹 Continuation capture and reuse with different values');
  console.log('   🔹 Abort/escape patterns for early termination');
  console.log('   🔹 Safe computation with error handling');
  console.log('   🔹 Nested delimited control operations');
  console.log('   🔹 Generator-like yielding behavior');
  console.log('   🔹 Backtracking and search patterns');
  console.log('   🔹 Multiple exit points and control flow');
  console.log('   🔹 Integration with existing continuation infrastructure');
  console.log('='.repeat(80));
}

// Export for potential use
export { runShiftResetDemo };

// Run if executed directly
if (require.main === module) {
  runShiftResetDemo();
}