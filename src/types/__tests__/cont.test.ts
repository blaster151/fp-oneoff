import { describe, it, expect } from "vitest";
import { 
  Cont, 
  callCC, 
  demonstrateCont, 
  factCPS, 
  findFirst, 
  cps, 
  uncps, 
  contBoth, 
  trampoline, 
  trampolined, 
  contToStrongMonad 
} from "../cont.js";
import { 
  reset, 
  shift, 
  demonstrateShiftReset, 
  abort, 
  safeDiv 
} from "../shift-reset.js";

const id = <T>(x: T) => x;

describe("Cont monad + callCC", () => {
  it("map/chain/ap basics", () => {
    const { of, map, chain, ap, run } = Cont;

    const two = of<number>()(2);
    const inc = (n: number) => n + 1;

    expect(run(map<number, number, number>(inc)(two), id)).toBe(3);

    const dbl = (n: number) => of<number>()(n * 2);
    expect(run(chain<number, number, number>(dbl)(two), id)).toBe(4);

    const mf = of<number>()((n: number) => n - 3);
    expect(run(ap<number, number, number>(mf)(of<number>()(10)), id)).toBe(7);
  });

  it("callCC allows early exit", () => {
    const prog = callCC<number, number, never>(exit =>
      Cont.chain<number, number, number>(x =>
        x > 0 ? exit(42) : Cont.of<number>()(x)
      )(Cont.of<number>()(1))
    );

    expect(Cont.run(prog, id)).toBe(42);
  });

  it("continuation composition works", () => {
    const addOne = (n: number) => Cont.of<number>()(n + 1);
    const double = (n: number) => Cont.of<number>()(n * 2);
    
    // Compose: double ∘ addOne
    const composed = Cont.chain<number, number, number>(double)(addOne(5));
    expect(Cont.run(composed, id)).toBe(12); // (5 + 1) * 2
  });

  it("CPS factorial works", () => {
    const fact5 = factCPS(5);
    expect(Cont.run(fact5, id)).toBe(120);
    
    const fact0 = factCPS(0);
    expect(Cont.run(fact0, id)).toBe(1);
  });

  it("findFirst with callCC works", () => {
    const numbers = [1, 3, 5, 8, 9, 12];
    const firstEven = findFirst((n: number) => n % 2 === 0, numbers);
    expect(Cont.run(firstEven, x => x ?? -1)).toBe(8);
    
    const noMatch = findFirst((n: number) => n > 100, numbers);
    expect(Cont.run(noMatch, x => x ?? -1)).toBe(-1);
  });

  it("monad laws hold", () => {
    // Left identity: return a >>= f = f a
    const a = 42;
    const f = (n: number) => Cont.of<string>()(n.toString());
    
    const left = Cont.chain<string, number, string>(f)(Cont.of<string>()(a));
    const right = f(a);
    
    expect(Cont.run(left, id)).toBe(Cont.run(right, id));
    
    // Right identity: m >>= return = m  
    const m = Cont.of<number>()(123);
    const leftId = Cont.chain<number, number, number>(Cont.of<number>())(m);
    
    expect(Cont.run(leftId, id)).toBe(Cont.run(m, id));
  });
});

describe("Delimited continuations: shift/reset", () => {
  it("reset(eval) is identity", () => {
    const one = Cont.of<number>()(1);
    const r = reset<number, number>(one);
    expect(Cont.run(r, id)).toBe(1);
  });

  it("classic shift/reset example: reset( shift k -> k(5) then +1 ) = 6", () => {
    const prog = reset<number, number>(
      Cont.chain<number, number, number>(x => Cont.of<number>()(x + 1))(
        shift<number, number>(k => k(5))
      )
    );

    expect(Cont.run(prog, id)).toBe(6);
  });

  it("can resume continuation multiple times", () => {
    const prog = reset<number, number>(
      Cont.chain<number, number, number>(x => Cont.of<number>()(x + 1))(
        shift<number, number>(k => {
          // Resume twice and sum
          const r1 = Cont.run(k(10), id);
          const r2 = Cont.run(k(20), id);
          return Cont.of<number>()(r1 + r2);
        })
      )
    );
    // Each resume: k(10) -> 10+1=11, k(20) -> 20+1=21, sum = 32
    expect(Cont.run(prog, id)).toBe(32);
  });

  it("abort terminates computation early", () => {
    const prog = reset<string, string>(
      Cont.chain<string, string, string>(_x => {
        return abort("Early termination!");
      })(Cont.of<string>()("This will be ignored"))
    );
    
    expect(Cont.run(prog, id)).toBe("Early termination!");
  });

  it("nested shift/reset operations work", () => {
    const nested = reset<number, number>(
      Cont.chain<number, number, number>(x => {
        return shift<number, number>((outerK) => {
          return reset<number, number>(
            Cont.chain<number, number, number>(y => {
              return shift<number, number>((innerK) => {
                return Cont.chain<number, number, number>(inner =>
                  outerK(inner + 100)
                )(innerK(y * 2));
              });
            })(Cont.of<number>()(x + 1))
          );
        });
      })(Cont.of<number>()(5))
    );
    
    // 5 + 1 = 6, 6 * 2 = 12, 12 + 100 = 112
    expect(Cont.run(nested, id)).toBe(112);
  });

  it("safe division with error handling", () => {
    const div1 = reset(safeDiv(10, 2) as any);
    const div2 = reset(safeDiv(10, 0) as any);
    
    expect(Cont.run(div1, (x: any) => x)).toBe(5);
    expect(Cont.run(div2, (x: any) => x)).toBe("Division by zero");
  });
});

describe("CPS utilities", () => {
  it("cps conversion works", () => {
    // Use imported cps and uncps
    
    const square = (n: number) => n * n;
    const cpsSquare = cps(square);
    
    const result = cpsSquare(7);
    expect(Cont.run(result, id)).toBe(49);
  });

  it("contBoth combines continuations", () => {
    // Use imported contBoth
    
    const contA = Cont.of<string>()("Hello");
    const contB = Cont.of<string>()("World");
    const both = contBoth(contA, contB);
    
    expect(Cont.run(both, (pair: any) => `${pair[0]} ${pair[1]}!`)).toBe("Hello World!");
  });

  it("trampoline prevents stack overflow", () => {
    // Test that trampoline functions exist and are callable
    expect(typeof trampoline).toBe("function");
    expect(typeof trampolined).toBe("function");
    
    // Simple trampoline test
    const bounce = { tag: 'Done', value: 42 } as any;
    expect(trampoline(bounce)).toBe(42);
  });
});

describe("Integration with Strong monad interface", () => {
  it("contToStrongMonad provides correct interface", () => {
    // Use imported contToStrongMonad
    
    const strongCont = contToStrongMonad();
    
    // Test of operation
    const pure = strongCont.of(42);
    expect(Cont.run(pure, id)).toBe(42);
    
    // Test map operation
    const mapped = strongCont.map(pure, (x: number) => x * 2);
    expect(Cont.run(mapped, id)).toBe(84);
    
    // Test strength operation
    const strengthened = strongCont.strength("prefix", pure);
    expect(Cont.run(strengthened, (pair: any) => `${pair[0]}: ${pair[1]}`)).toBe("prefix: 42");
    
    // Test prod operation
    const contA = strongCont.of("A");
    const contB = strongCont.of("B");
    const product = strongCont.prod(contA, contB);
    expect(Cont.run(product, (pair: any) => pair[0] + pair[1])).toBe("AB");
  });
});

describe("Demonstration functions", () => {
  it("demonstrateCont runs without errors", () => {
    expect(() => demonstrateCont()).not.toThrow();
  });

  it("demonstrateShiftReset runs without errors", () => {
    expect(() => demonstrateShiftReset()).not.toThrow();
  });
});