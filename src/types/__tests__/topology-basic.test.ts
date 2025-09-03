import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { 
  discrete, 
  indiscrete, 
  isContinuous, 
  subset, 
  demonstrateTopology, 
  fromOpens,
  isT0,
  isHausdorff,
  isCompact 
} from "../topology.js";

describe("Finite topology basics", () => {
  it("discrete has all subsets open; indiscrete has only ∅ and A", () => {
    const A: SetObj<number> = {
      id: "A",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const Td = discrete(A);
    const Ti = indiscrete(A);

    // All subsets open in discrete
    const subs = [[], [0], [1], [2], [0,1], [0,2], [1,2], [0,1,2]].map(subset);
    
    console.log('     Testing discrete topology (all subsets open):');
    for (const S of subs) {
      const isOpen = Td.isOpen(S);
      console.log(`       {${[...S].join(', ')}} open: ${isOpen ? '✅' : '❌'}`);
      expect(isOpen).toBe(true);
    }

    console.log('     Testing indiscrete topology (only ∅ and A open):');
    for (const S of subs) {
      const shouldBeOpen = (S.size === 0) || (S.size === 3);
      const isOpen = Ti.isOpen(S);
      console.log(`       {${[...S].join(', ')}} open: ${isOpen} ${isOpen === shouldBeOpen ? '✅' : '❌'}`);
      expect(isOpen).toBe(shouldBeOpen);
    }
  });

  it("continuity: any map from discrete is continuous; any map into indiscrete is continuous", () => {
    const A: SetObj<number> = {
      id: "A", 
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const B: SetObj<string> = {
      id: "B",
      elems: ["x", "y"],
      eq: (a, b) => a === b
    };
    
    const Td_A = discrete(A);
    const Td_B = discrete(B);
    const Ti_B = indiscrete(B);

    const f = (a: number) => (a % 2 ? "x" : "y");

    console.log('     Testing continuity properties:');
    console.log('       Function f(a) = a % 2 ? "x" : "y"');

    // From discrete domain - should always be continuous
    const discreteToContinuous = isContinuous(Td_A, Td_B, f);
    console.log(`       discrete(A) → discrete(B): ${discreteToContinuous ? '✅' : '❌'}`);
    expect(discreteToContinuous).toBe(true);

    // Into indiscrete codomain - should always be continuous
    const intoIndiscreteContinuous = isContinuous(discrete(A), Ti_B, f);
    console.log(`       discrete(A) → indiscrete(B): ${intoIndiscreteContinuous ? '✅' : '❌'}`);
    expect(intoIndiscreteContinuous).toBe(true);
    
    // Test specific preimages
    const openX = subset(["x"]);
    const preimageX = new Set<number>();
    for (const a of A.elems) {
      if (f(a) === "x") preimageX.add(a);
    }
    
    console.log(`       f^{-1}({x}) = {${[...preimageX].join(', ')}}`);
    console.log(`       Preimage is open in discrete: ${Td_A.isOpen(preimageX) ? '✅' : '❌'}`);
  });

  it("topological properties work correctly", () => {
    const A: SetObj<boolean> = {
      id: "A",
      elems: [false, true], 
      eq: (a, b) => a === b
    };

    const Td = discrete(A);
    const Ti = indiscrete(A);

    console.log('     Testing topological properties:');

    // Use imported property checking functions

    // Discrete topology properties
    const discreteT0 = isT0(Td);
    const discreteHausdorff = isHausdorff(Td);
    const discreteCompact = isCompact(Td);

    console.log(`       Discrete is T₀: ${discreteT0 ? '✅' : '❌'}`);
    console.log(`       Discrete is Hausdorff: ${discreteHausdorff ? '✅' : '❌'}`);
    console.log(`       Discrete is compact: ${discreteCompact ? '✅' : '❌'}`);

    expect(discreteT0).toBe(true);
    expect(discreteHausdorff).toBe(true);
    expect(discreteCompact).toBe(true);

    // Indiscrete topology properties  
    const indiscreteT0 = isT0(Ti);
    const indiscreteCompact = isCompact(Ti);

    console.log(`       Indiscrete is T₀: ${indiscreteT0 ? '✅' : '❌'}`);
    console.log(`       Indiscrete is compact: ${indiscreteCompact ? '✅' : '❌'}`);

    // Indiscrete with >1 element is not T₀
    expect(indiscreteT0).toBe(A.elems.length <= 1);
    expect(indiscreteCompact).toBe(true);
  });

  it("custom topology from open sets works", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["a", "b"],
      eq: (a, b) => a === b
    };

    // Create custom topology with opens: ∅, {a}, A
    const customOpens = [
      subset<string>([]),      // ∅
      subset(["a"]),           // {a}
      subset(["a", "b"])       // A
    ];

    const customTopology = fromOpens(A, customOpens);

    console.log('     Testing custom topology:');
    console.log('       Open sets: ∅, {a}, {a,b}');

    expect(customTopology.isOpen(subset([]))).toBe(true);
    expect(customTopology.isOpen(subset(["a"]))).toBe(true);
    expect(customTopology.isOpen(subset(["b"]))).toBe(false);
    expect(customTopology.isOpen(subset(["a", "b"]))).toBe(true);

    console.log(`       ∅ open: ✅`);
    console.log(`       {a} open: ✅`);
    console.log(`       {b} open: ❌ (as expected)`);
    console.log(`       {a,b} open: ✅`);
  });

  it("demonstration function runs without errors", () => {
    expect(() => {
      demonstrateTopology();
    }).not.toThrow();
  });
});