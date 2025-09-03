/** @math TOP-PRODUCT-CONT */

import { describe, it, expect } from "vitest";
import { SetObj } from "../catkit-kan.js";
import {
  discrete, 
  productTopology, 
  isContinuous,
  productCarrier, 
  subset, 
  rectangle, 
  pr1, 
  pr2,
  verifyProductUniversalProperty
} from "../topology.js";

// Boolean "and" as a map (2×2) → 2
const boolAnd = (p: [boolean, boolean]) => p[0] && p[1];

describe("Finite product topology", () => {
  it("projections are continuous; and : 2×2→2 is continuous (discrete case)", () => {
    const Two: SetObj<boolean> = {
      id: "2",
      elems: [false, true],
      eq: (a, b) => a === b
    };
    
    const Td = discrete(Two);

    console.log('     Testing product topology with discrete 2×2:');
    console.log('       Base space: 2 = {false, true} (discrete)');

    const prod = productTopology(Td, Td);   // 2×2 with product(discrete,discrete)
    const andCod = Td;                      // codomain = (2, discrete)

    console.log(`       Product space: 2×2 (${prod.carrier.elems.length} elements)`);
    console.log(`       Product topology: ${prod.opens.size} open sets`);

    // Projections should be continuous
    const proj1Continuous = isContinuous(prod, Td, pr1);
    const proj2Continuous = isContinuous(prod, Td, pr2);
    
    console.log(`       π₁: 2×2 → 2 continuous: ${proj1Continuous ? '✅' : '❌'}`);
    console.log(`       π₂: 2×2 → 2 continuous: ${proj2Continuous ? '✅' : '❌'}`);

    expect(proj1Continuous).toBe(true);
    expect(proj2Continuous).toBe(true);

    // Boolean AND should be continuous (discrete codomain ⇒ all maps continuous)
    const andContinuous = isContinuous(prod, andCod, boolAnd);
    console.log(`       ∧: 2×2 → 2 continuous: ${andContinuous ? '✅' : '❌'}`);
    
    expect(andContinuous).toBe(true);
  });

  it("universal property (⇐ direction): if π₁∘f and π₂∘f are continuous ⇒ f is continuous", () => {
    // Z has 3 points; X=Y=2 (discrete)
    const Z: SetObj<number> = {
      id: "Z",
      elems: [0, 1, 2],
      eq: (a, b) => a === b
    };
    
    const Two: SetObj<boolean> = {
      id: "2",
      elems: [false, true],
      eq: (a, b) => a === b
    };

    const Tz = discrete(Z);
    const Td = discrete(Two);
    const XY = productTopology(Td, Td);

    console.log('     Testing universal property:');
    console.log('       Z = {0, 1, 2} (discrete)');
    console.log('       X = Y = {false, true} (discrete)');

    // Arbitrary f : Z → 2×2
    const f = (z: number): [boolean, boolean] => [z % 2 === 0, z === 2];

    console.log('       f(z) = [z%2==0, z==2]');
    console.log('       f(0) = [true, false]');
    console.log('       f(1) = [false, false]');  
    console.log('       f(2) = [true, true]');

    const universalProperty = verifyProductUniversalProperty(Tz, Td, Td, f);

    console.log(`       π₁∘f continuous: ${universalProperty.proj1Continuous ? '✅' : '❌'}`);
    console.log(`       π₂∘f continuous: ${universalProperty.proj2Continuous ? '✅' : '❌'}`);
    console.log(`       f continuous: ${universalProperty.fContinuous ? '✅' : '❌'}`);
    console.log(`       Universal property: ${universalProperty.universalPropertyHolds ? '✅' : '❌'}`);

    expect(universalProperty.proj1Continuous).toBe(true);
    expect(universalProperty.proj2Continuous).toBe(true);
    expect(universalProperty.fContinuous).toBe(true);
    expect(universalProperty.universalPropertyHolds).toBe(true);
  });

  it("product carrier and rectangle construction work correctly", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["a", "b"],
      eq: (x, y) => x === y
    };
    
    const B: SetObj<number> = {
      id: "B", 
      elems: [1, 2, 3],
      eq: (x, y) => x === y
    };

    console.log('     Testing product construction:');
    console.log(`       A = {${A.elems.join(', ')}}`);
    console.log(`       B = {${B.elems.join(', ')}}`);

    const AxB = productCarrier(A, B);
    
    console.log(`       A×B has ${AxB.elems.length} elements (expected: ${A.elems.length * B.elems.length})`);
    expect(AxB.elems.length).toBe(A.elems.length * B.elems.length);

    // Test rectangle construction
    const U = subset(["a"]);
    const V = subset([1, 3]);
    const rect = rectangle(A, B, U, V);

    console.log(`       Rectangle {a} × {1,3}:`);
    console.log(`       Contains: {${[...rect].map(([a,b]) => `[${a},${b}]`).join(', ')}}`);
    
    expect(rect.size).toBe(U.size * V.size);
    
    // Check if rectangle contains the expected pairs (need to check by iteration since arrays are objects)
    const containsA1 = [...rect].some(([a, b]) => a === "a" && b === 1);
    const containsA3 = [...rect].some(([a, b]) => a === "a" && b === 3);
    const containsB1 = [...rect].some(([a, b]) => a === "b" && b === 1);
    
    expect(containsA1).toBe(true);
    expect(containsA3).toBe(true);
    expect(containsB1).toBe(false);
  });

  it("product topology has correct structure", () => {
    const Two: SetObj<boolean> = {
      id: "2",
      elems: [false, true],
      eq: (a, b) => a === b
    };

    const Td = discrete(Two);
    const prod = productTopology(Td, Td);

    console.log('     Testing product topology structure:');
    console.log(`       Base topology: discrete on 2 (${Td.opens.size} opens)`);
    console.log(`       Product topology: discrete on 2×2 (${prod.opens.size} opens)`);

    // Product of discrete topologies should be discrete
    // So all subsets should be open
    const allSubsets = [];
    for (let mask = 0; mask < 16; mask++) { // 2^4 = 16 subsets of 2×2
      const s = new Set<[boolean, boolean]>();
      const pairs = prod.carrier.elems;
      for (let i = 0; i < pairs.length; i++) {
        if ((mask >> i) & 1) s.add(pairs[i]!);
      }
      allSubsets.push(s);
    }

    console.log(`       Testing ${allSubsets.length} subsets for openness:`);
    
    let allOpen = true;
    allSubsets.forEach((s, i) => {
      const isOpen = prod.isOpen(s);
      if (!isOpen) allOpen = false;
      if (i < 5) { // Show first few
        console.log(`         Subset ${i}: ${isOpen ? '✅' : '❌'}`);
      }
    });

    console.log(`       All subsets open (discrete): ${allOpen ? '✅' : '❌'}`);
    expect(allOpen).toBe(true);
  });

  it("Boolean operations are continuous in product topology", () => {
    const Two: SetObj<boolean> = {
      id: "2", 
      elems: [false, true],
      eq: (a, b) => a === b
    };

    const Td = discrete(Two);
    const prod = productTopology(Td, Td);

    console.log('     Testing Boolean operation continuity:');

    // Test various Boolean operations
    const operations = [
      { name: "AND", fn: (p: [boolean, boolean]) => p[0] && p[1] },
      { name: "OR", fn: (p: [boolean, boolean]) => p[0] || p[1] },
      { name: "XOR", fn: (p: [boolean, boolean]) => p[0] !== p[1] },
      { name: "NAND", fn: (p: [boolean, boolean]) => !(p[0] && p[1]) }
    ];

    operations.forEach(({ name, fn }) => {
      const continuous = isContinuous(prod, Td, fn);
      console.log(`       ${name}: 2×2 → 2 continuous: ${continuous ? '✅' : '❌'}`);
      expect(continuous).toBe(true);
    });
  });

  it("product topology satisfies expected properties", () => {
    const A: SetObj<string> = {
      id: "A",
      elems: ["x"],
      eq: (a, b) => a === b
    };
    
    const B: SetObj<number> = {
      id: "B",
      elems: [1, 2],
      eq: (a, b) => a === b
    };

    const Ta = discrete(A);
    const Tb = discrete(B);
    const Tprod = productTopology(Ta, Tb);

    console.log('     Testing product topology properties:');
    console.log(`       A = {${A.elems.join(', ')}}, B = {${B.elems.join(', ')}}`);
    console.log(`       Product A×B has ${Tprod.carrier.elems.length} elements`);

    // Test that basic rectangles are open
    const U = subset(["x"]);
    const V = subset([1]);
    const rect = rectangle(A, B, U, V);
    
    const rectOpen = Tprod.isOpen(rect);
    console.log(`       Rectangle {x}×{1} is open: ${rectOpen ? '✅' : '❌'}`);
    expect(rectOpen).toBe(true);

    // Test that projections are continuous
    const proj1Cont = isContinuous(Tprod, Ta, pr1);
    const proj2Cont = isContinuous(Tprod, Tb, pr2);
    
    console.log(`       π₁ continuous: ${proj1Cont ? '✅' : '❌'}`);
    console.log(`       π₂ continuous: ${proj2Cont ? '✅' : '❌'}`);
    
    expect(proj1Cont).toBe(true);
    expect(proj2Cont).toBe(true);
  });
});