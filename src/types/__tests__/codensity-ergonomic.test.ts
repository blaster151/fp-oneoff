import { describe, it, expect } from "vitest";
import { 
  mkCodensityMonad,
  terminalCodensity,
  discreteCodensity,
  demonstrateCodensityMonad
} from "../codensity-monad.js";
import { SmallCategory } from "../category-to-nerve-sset.js";
import { SetFunctor, SetObj, HasHom } from "../catkit-kan.js";

describe("Ergonomic codensity monad interface (of/map/chain/ap)", () => {
  it("terminal codensity provides familiar monadic operations", () => {
    const G: SetObj<number> = {
      id: "G(*)",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    // Verify all operations are available
    expect(typeof codensity.of).toBe("function");
    expect(typeof codensity.map).toBe("function");
    expect(typeof codensity.chain).toBe("function");
    expect(typeof codensity.ap).toBe("function");
    expect(typeof codensity.run).toBe("function");
    expect(typeof codensity.pure).toBe("function");
    
    // Test basic of operation
    const A: SetObj<string> = {
      id: "A",
      elems: ["test"],
      eq: (a, b) => a === b
    };
    
    const pureTest = codensity.of(A)("test");
    expect(pureTest).toBeDefined();
    expect(pureTest.type).toBe("unit");
    expect(pureTest.value).toBe("test");
    
    console.log('     Terminal codensity operations: ✅');
  });

  it("discrete codensity handles multiple objects", () => {
    const objects = ["A", "B"] as const;
    const G = (b: "A" | "B") => 
      b === "A" 
        ? { id: "G(A)", elems: [1, 2], eq: (a: any, b: any) => a === b }
        : { id: "G(B)", elems: ["x", "y"], eq: (a: any, b: any) => a === b };
    
    const codensity = discreteCodensity(objects, G);
    
    expect(typeof codensity.of).toBe("function");
    expect(typeof codensity.map).toBe("function");
    expect(typeof codensity.chain).toBe("function");
    expect(typeof codensity.ap).toBe("function");
    
    console.log('     Discrete codensity operations: ✅');
    console.log('     G(A) = {1, 2}, G(B) = {x, y}');
  });

  it("of operation creates unit elements correctly", () => {
    const G: SetObj<boolean> = {
      id: "G(*)",
      elems: [true, false],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    const A: SetObj<number> = {
      id: "A",
      elems: [42, 43],
      eq: (a, b) => a === b
    };
    
    const pure42 = codensity.of(A)(42);
    const pure43 = codensity.of(A)(43);
    
    expect(pure42.type).toBe("unit");
    expect(pure43.type).toBe("unit");
    expect(pure42.value).toBe(42);
    expect(pure43.value).toBe(43);
    
    console.log('     of(42) and of(43) created with correct values ✅');
  });

  it("run operation extracts values via continuations", () => {
    const G: SetObj<string> = {
      id: "G(*)",
      elems: ["output1", "output2"],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    const A: SetObj<number> = {
      id: "A",
      elems: [10],
      eq: (a, b) => a === b
    };
    
    const pure10 = codensity.of(A)(10);
    
    // Test with different continuations
    const result1 = codensity.run(A)(pure10)((x: number) => x * 2);
    const result2 = codensity.run(A)(pure10)((x: number) => x.toString());
    
    console.log(`     run(of(10))(x => x * 2) = ${result1}`);
    console.log(`     run(of(10))(toString) = ${result2}`);
    
    // Should implement η(a)(k) = k(a)
    expect(result1).toBe(20); // 10 * 2
    expect(result2).toBe("10"); // 10.toString()
    
    console.log('     Continuation evaluation η(a)(k) = k(a): ✅');
  });

  it("map operation transforms values functorially", () => {
    const G: SetObj<number> = {
      id: "G(*)",
      elems: [0, 1],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    const A: SetObj<string> = {
      id: "A",
      elems: ["hello"],
      eq: (a, b) => a === b
    };
    
    const B: SetObj<number> = {
      id: "B",
      elems: [5],
      eq: (a, b) => a === b
    };
    
    const pureHello = codensity.of(A)("hello");
    const mapped = codensity.map(A, B)((s: string) => s.length)(pureHello);
    
    expect(mapped).toBeDefined();
    expect(mapped.type).toBe("mapped");
    
    // Test that mapping preserves continuation structure
    const result = codensity.run(B)(mapped)((n: number) => n * 2);
    console.log(`     map(length)("hello") then double = ${result}`);
    
    // Should be: map(length)(of("hello")) = of(5), then run with (*2) = 10
    expect(result).toBe(10); // "hello".length * 2 = 5 * 2 = 10
    
    console.log('     Functorial mapping: ✅');
  });

  it("chain operation implements monadic bind", () => {
    const G: SetObj<string> = {
      id: "G(*)",
      elems: ["result"],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    const A: SetObj<number> = {
      id: "A",
      elems: [7],
      eq: (a, b) => a === b
    };
    
    const B: SetObj<string> = {
      id: "B", 
      elems: ["output"],
      eq: (a, b) => a === b
    };
    
    const pure7 = codensity.of(A)(7);
    const chained = codensity.chain(A, B)((x: number) => 
      codensity.of(B)(`result-${x}`)
    )(pure7);
    
    expect(chained).toBeDefined();
    expect(chained.type).toBe("multiplication");
    
    console.log('     chain(x => of("result-" + x))(of(7)): ✅');
    console.log('     Monadic bind structure: ✅');
  });

  it("pure is alias for of", () => {
    const G: SetObj<number> = {
      id: "G(*)",
      elems: [1],
      eq: (a, b) => a === b
    };
    
    const codensity = terminalCodensity(G);
    
    const A: SetObj<string> = {
      id: "A",
      elems: ["test"],
      eq: (a, b) => a === b
    };
    
    const ofResult = codensity.of(A)("test");
    const pureResult = codensity.pure(A)("test");
    
    expect(ofResult.type).toBe(pureResult.type);
    expect(ofResult.value).toBe(pureResult.value);
    
    console.log('     pure is alias for of: ✅');
  });

  it("integrates with existing categorical infrastructure", () => {
    // Test that we can create codensity monads using existing SmallCategory
    type BObj = "*";
    type BM = { tag: "id" };
    
    const B: SmallCategory<BObj, BM> & { objects: BObj[]; morphisms: BM[] } & HasHom<BObj, BM> = {
      objects: ["*"],
      morphisms: [{ tag: "id" }],
      id: (_: BObj) => ({ tag: "id" }),
      src: (_: BM) => "*",
      dst: (_: BM) => "*",
      comp: (_g: BM, _f: BM) => ({ tag: "id" }),
      hom: (_x: BObj, _y: BObj) => [{ tag: "id" }]
    };

    const G: SetFunctor<BObj, BM> = {
      obj: (_: BObj) => ({ id: "G(*)", elems: [0], eq: (a, b) => a === b }),
      map: (_: BM) => (x: any) => x
    };

    expect(() => {
      const codensity = mkCodensityMonad(B, G);
      expect(codensity.T).toBeDefined();
      expect(codensity.eta).toBeDefined();
      expect(codensity.mu).toBeDefined();
      expect(codensity.of).toBeDefined();
    }).not.toThrow();
    
    console.log('     Integration with SmallCategory: ✅');
    console.log('     Integration with SetFunctor: ✅');
    console.log('     Integration with HasHom: ✅');
  });

  it("demonstration function runs without errors", () => {
    expect(() => {
      demonstrateCodensityMonad();
    }).not.toThrow();
  });
});