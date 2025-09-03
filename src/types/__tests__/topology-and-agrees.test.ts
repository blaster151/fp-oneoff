/** @math TOP-PRODUCT-CONT */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import { discrete, productTopology, isContinuous, pr1, pr2 } from "../topology.js";
import { and2, BoolMorphisms } from "../mini-finset.js";

describe("and map continuity agrees with miniFinSet.and2", () => {
  const Two: SetObj<boolean> = {
    id: "2",
    elems: [false, true],
    eq: (a, b) => a === b
  };
  
  const Td = discrete(Two);
  const prod = productTopology(Td, Td);

  const andFn = (p: [boolean, boolean]) => p[0] && p[1];

  it("continuous and same truth table", () => {
    console.log('     Testing AND operation agreement:');
    console.log('       Topology AND vs Categorical AND');

    // Test continuity
    const continuous = isContinuous(prod, Td, andFn);
    console.log(`       AND: 2×2 → 2 is continuous: ${continuous ? '✅' : '❌'}`);
    expect(continuous).toBe(true);

    // Test truth table agreement
    const testCases: Array<[[boolean, boolean], boolean]> = [
      [[false, false], false],
      [[false, true], false],
      [[true, false], false],
      [[true, true], true],
    ];

    console.log('       Truth table comparison:');
    
    for (const [input, expected] of testCases) {
      const topologyResult = andFn(input);
      const categoricalResult = and2.fn(input);
      
      console.log(`         AND(${input[0]}, ${input[1]}): topology=${topologyResult}, categorical=${categoricalResult} ${topologyResult === expected && categoricalResult === expected ? '✅' : '❌'}`);
      
      expect(topologyResult).toBe(expected);
      expect(categoricalResult).toBe(expected);
      expect(topologyResult).toBe(categoricalResult);
    }
    
    console.log('       Perfect agreement between topology and category ✅');
  });

  it("all Boolean morphisms agree with topological operations", () => {
    console.log('     Testing all Boolean morphisms for continuity:');

    const operations = [
      { 
        name: "AND", 
        topFn: (p: [boolean, boolean]) => p[0] && p[1],
        catMor: BoolMorphisms.and2
      },
      { 
        name: "OR", 
        topFn: (p: [boolean, boolean]) => p[0] || p[1],
        catMor: BoolMorphisms.or2
      },
      { 
        name: "XOR", 
        topFn: (p: [boolean, boolean]) => p[0] !== p[1],
        catMor: BoolMorphisms.xor2
      },
      { 
        name: "NAND", 
        topFn: (p: [boolean, boolean]) => !(p[0] && p[1]),
        catMor: BoolMorphisms.nand2
      }
    ];

    operations.forEach(({ name, topFn, catMor }) => {
      // Test continuity
      const continuous = isContinuous(prod, Td, topFn);
      
      // Test agreement on all inputs
      const inputs: [boolean, boolean][] = [
        [false, false], [false, true], [true, false], [true, true]
      ];
      
      let agrees = true;
      for (const input of inputs) {
        const topResult = topFn(input);
        const catResult = catMor.fn(input);
        if (topResult !== catResult) {
          agrees = false;
          break;
        }
      }
      
      console.log(`       ${name}: continuous=${continuous ? '✅' : '❌'}, agrees=${agrees ? '✅' : '❌'}`);
      
      expect(continuous).toBe(true);
      expect(agrees).toBe(true);
    });
  });

  it("unary Boolean operations (NOT) are continuous", () => {
    const notFn = (b: boolean) => !b;
    const notContinuous = isContinuous(Td, Td, notFn);
    
    console.log('     Testing unary Boolean operations:');
    console.log(`       NOT: 2 → 2 continuous: ${notContinuous ? '✅' : '❌'}`);
    
    expect(notContinuous).toBe(true);

    // Test agreement with categorical NOT
    const inputs = [false, true];
    let agrees = true;
    
    for (const input of inputs) {
      const topResult = notFn(input);
      const catResult = BoolMorphisms.not2.fn(input);
      if (topResult !== catResult) {
        agrees = false;
        break;
      }
    }
    
    console.log(`       NOT agreement: ${agrees ? '✅' : '❌'}`);
    expect(agrees).toBe(true);
  });

  it("product topology enables Boolean algebra verification", () => {
    console.log('     Testing Boolean algebra via product topology:');

    // Test De Morgan law: ¬(A ∧ B) = (¬A) ∨ (¬B)
    const deMorganLHS = (p: [boolean, boolean]) => !andFn(p);
    const deMorganRHS = (p: [boolean, boolean]) => (!p[0]) || (!p[1]);

    const inputs: [boolean, boolean][] = [
      [false, false], [false, true], [true, false], [true, true]
    ];

    console.log('       De Morgan law: ¬(A ∧ B) = (¬A) ∨ (¬B)');
    
    let deMorganHolds = true;
    for (const input of inputs) {
      const lhs = deMorganLHS(input);
      const rhs = deMorganRHS(input);
      if (lhs !== rhs) deMorganHolds = false;
      
      console.log(`         [${input.join(',')}]: ¬(${input[0]}∧${input[1]})=${lhs}, (¬${input[0]})∨(¬${input[1]})=${rhs} ${lhs === rhs ? '✅' : '❌'}`);
    }

    expect(deMorganHolds).toBe(true);
    console.log('       De Morgan law verified via topology ✅');
  });

  it("product topology integrates with codensity infrastructure", () => {
    // This test shows that the topology module works well with our
    // existing categorical infrastructure
    
    console.log('     Testing integration with categorical infrastructure:');
    
    // Test that we can create product topologies
    const singleton: SetObj<null> = {
      id: "1",
      elems: [null],
      eq: (a, b) => a === b
    };
    
    const bool: SetObj<boolean> = {
      id: "2", 
      elems: [false, true],
      eq: (a, b) => a === b
    };

    const T1 = discrete(singleton);
    const T2 = discrete(bool);
    const T1x2 = productTopology(T1, T2);

    console.log(`       1×2 product topology: ${T1x2.carrier.elems.length} elements`);
    console.log(`       Opens in product: ${T1x2.opens.size}`);
    
    expect(T1x2.carrier.elems.length).toBe(2); // |1| × |2| = 1 × 2 = 2
    expect(T1x2.opens.size).toBeGreaterThan(0);

    // Test projections
    const proj1Cont = isContinuous(T1x2, T1, pr1);
    const proj2Cont = isContinuous(T1x2, T2, pr2);
    
    console.log(`       Projections continuous: π₁=${proj1Cont ? '✅' : '❌'}, π₂=${proj2Cont ? '✅' : '❌'}`);
    
    expect(proj1Cont).toBe(true);
    expect(proj2Cont).toBe(true);
    
    console.log('     Integration with categorical infrastructure ✅');
  });
});