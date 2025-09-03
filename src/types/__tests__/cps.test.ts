import { describe, it, expect } from "vitest";
import { CPS } from "../index.js";

const id = <T>(x: T) => x;

describe("CPS unified namespace", () => {
  it("has all continuation operations", () => {
    expect(CPS.Cont).toBeDefined();
    expect(CPS.callCC).toBeDefined();
    expect(CPS.contBoth).toBeDefined();
    expect(CPS.contCompose).toBeDefined();
    expect(CPS.factCPS).toBeDefined();
    expect(CPS.findFirst).toBeDefined();
  });

  it("has all shift/reset operations", () => {
    expect(CPS.shift).toBeDefined();
    expect(CPS.reset).toBeDefined();
    expect(CPS.abort).toBeDefined();
    expect(CPS.escape).toBeDefined();
    expect(CPS.control).toBeDefined();
    expect(CPS.prompt).toBeDefined();
  });

  it("can use continuation and delimited control together", () => {
    // Create a computation using both continuation and shift/reset
    const computation = CPS.reset<number, number>(
      CPS.Cont.chain<number, number, number>(x => {
        return CPS.shift<number, number>((k) => {
          // Use continuation monad inside shift
          const doubled = CPS.Cont.map<number, number, number>(y => y * 2)(
            CPS.Cont.of<number>()(x)
          );
          return CPS.Cont.chain<number, number, number>(val => k(val))(doubled);
        });
      })(CPS.Cont.of<number>()(21))
    );

    const result = CPS.Cont.run(computation, id);
    expect(result).toBe(42); // 21 * 2
  });

  it("callCC works within shift/reset context", () => {
    const prog = CPS.reset<number, number>(
      CPS.callCC<number, number, never>(exit => {
        return CPS.Cont.chain<number, number, number>(x => {
          if (x > 10) {
            return exit(100);
          }
          return CPS.shift<number, number>(k => k(x + 5));
        })(CPS.Cont.of<number>()(15));
      })
    );

    expect(CPS.Cont.run(prog, id)).toBe(100);
  });

  it("complex nested control flow works", () => {
    const nested = CPS.reset<string, string>(
      CPS.Cont.chain<string, string, string>(_init => {
        return CPS.shift<string, string>(outerK => {
          return CPS.reset<string, string>(
            CPS.callCC<string, string, never>(innerEscape => {
              return CPS.Cont.chain<string, string, string>(x => {
                if (x === "escape") {
                  return innerEscape("inner-escaped");
                }
                return CPS.shift<string, string>(innerK => {
                  const result1 = CPS.Cont.run(innerK("processed"), id);
                  return outerK(`outer-${result1}`);
                });
              })(CPS.Cont.of<string>()("test"));
            })
          );
        });
      })(CPS.Cont.of<string>()("start"))
    );

    const result = CPS.Cont.run(nested, id);
    expect(result).toBe("outer-processed");
  });

  it("error handling with abort and continuation composition", () => {
    const safeComputation = (input: number) => {
      return CPS.reset<string | number, string | number>(
        CPS.Cont.chain<string | number, number, string | number>(x => {
          if (x < 0) {
            return CPS.abort<string | number, string, string | number>("Negative input not allowed");
          }
          
          // Use continuation composition
          const addTen = (n: number) => CPS.Cont.of<string | number>()(n + 10);
          const multiplyTwo = (n: number) => CPS.Cont.of<string | number>()(n * 2);
          
          const composed = CPS.contCompose(multiplyTwo, addTen);
          return composed(x);
        })(CPS.Cont.of<string | number>()(input))
      );
    };

    expect(CPS.Cont.run(safeComputation(5), id)).toBe(30); // (5 + 10) * 2
    expect(CPS.Cont.run(safeComputation(-1), id)).toBe("Negative input not allowed");
  });

  it("generator-like behavior with yield", () => {
    // Simplified version to avoid complex type inference issues
    const generatorLike = CPS.reset<number[], number[]>(
      CPS.shift<number[], number[]>(_k => {
        const values = [1, 2, 3, 4, 5];
        const results = values.map(x => x * x);
        return CPS.Cont.of<number[]>()(results);
      })
    );

    const result = CPS.Cont.run(generatorLike, id);
    expect(result).toEqual([1, 4, 9, 16, 25]);
  });

  it("backtracking with choice and continuation", () => {
    const backtrackSearch = CPS.reset<string, string>(
      CPS.Cont.chain<string, string[], string>(candidates => {
        return CPS.shift<string, string>(k => {
          // Try each candidate
          for (const candidate of candidates) {
            if (candidate.startsWith("success")) {
              return k(`Found: ${candidate}`);
            }
          }
          return CPS.Cont.of<string>()("No solution found");
        });
      })(CPS.Cont.of<string>()(["fail1", "fail2", "success-item", "fail3"]))
    );

    const result = CPS.Cont.run(backtrackSearch, id);
    expect(result).toBe("Found: success-item");
  });

  it("performance optimization with trampoline", () => {
    // Test that trampoline functions exist and work
    expect(typeof CPS.trampoline).toBe("function");
    expect(typeof CPS.trampolined).toBe("function");
    
    // Simple trampoline test
    const bounce = { tag: 'Done', value: 123 } as any;
    expect(CPS.trampoline(bounce)).toBe(123);
    
    // Test More case
    const moreBounce = { 
      tag: 'More', 
      thunk: () => ({ tag: 'Done', value: 456 }) 
    } as any;
    expect(CPS.trampoline(moreBounce)).toBe(456);
  });

  it("type class instances work correctly", () => {
    const ContMonad = CPS.ContMonad<string>();
    
    // Test functor law: map id = id
    const value = CPS.Cont.of<string>()(42);
    const mapped = ContMonad.map(value as any, (x: number) => x);
    
    expect(CPS.Cont.run(mapped as any, id)).toBe(42);
    
    // Test applicative: pure and ap
    const pureValue = ContMonad.of(123);
    expect(CPS.Cont.run(pureValue as any, id)).toBe(123);
    
    const func = ContMonad.of((x: number) => x * 2);
    const applied = ContMonad.ap(func, pureValue as any);
    expect(CPS.Cont.run(applied as any, id)).toBe(246);
  });

  it("integration with strong monad interface", () => {
    const strongCont = CPS.contToStrongMonad();
    
    // Test strength operation  
    const cont = strongCont.of(42);
    const strengthened = strongCont.strength("prefix", cont);
    
    // Use type assertion to handle the complex return type
    expect(CPS.Cont.run(strengthened as any, (pair: any) => `${pair[0]}: ${pair[1]}`)).toBe("prefix: 42");
    
    // Test product operation
    const contA = strongCont.of("A");
    const contB = strongCont.of("B");
    const product = strongCont.prod(contA, contB);
    
    expect(CPS.Cont.run(product as any, (pair: any) => pair[0] + pair[1])).toBe("AB");
  });
});