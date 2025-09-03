/** @math EX-DOUBLE-DUALIZATION */

import { describe, it, expect } from "vitest";
import { 
  FinVect, 
  Bit,
  doubleDual, 
  evalIso, 
  basis, 
  zeros,
  createFinVect,
  demonstrateDoubleDual
} from "../finvect.js";

describe("Finite-dimensional double dualization over F2", () => {
  it("V ≅ V** (same dimension; eval is bijection on standard basis)", () => {
    const V: FinVect = createFinVect(3, "V");
    const Vdd = doubleDual(V);
    
    // Dimensions must match
    expect(Vdd.dim).toBe(V.dim);

    const { forward, backward, isIso } = evalIso(V);
    expect(isIso).toBe(true);

    // Test on standard basis vectors
    const e = basis(3); // e1, e2, e3
    for (const row of e) {
      const toDD = forward(row);
      const back = backward(toDD);
      expect(back.join("")).toBe(row.join(""));
    }

    // Test on zero vector
    const zero = zeros(3);
    expect(backward(forward(zero)).join("")).toBe(zero.join(""));
  });

  it("demonstrates finite dimension isomorphism", () => {
    const dimensions = [1, 2, 3, 4];
    
    dimensions.forEach(dim => {
      const V = createFinVect(dim, `V${dim}`);
      const Vdd = doubleDual(V);
      const { isIso } = evalIso(V);
      
      console.log(`dim(V) = ${dim}: V ≅ V** = ${isIso}`);
      expect(Vdd.dim).toBe(V.dim);
      expect(isIso).toBe(true);
    });
  });

  it("runs complete demonstration", () => {
    // This runs the educational demonstration
    demonstrateDoubleDual();
    
    // Verify the demonstration runs without errors
    expect(true).toBe(true);
  });

  it("verifies evaluation map properties", () => {
    const V = createFinVect(2, "F2²");
    const { forward, backward } = evalIso(V);
    
    // Test all vectors in F₂²
    const allVectors = [
      [0, 0] as Bit[],
      [0, 1] as Bit[],
      [1, 0] as Bit[],
      [1, 1] as Bit[]
    ];
    
    allVectors.forEach(vec => {
      const roundTrip = backward(forward(vec));
      expect(roundTrip).toEqual(vec);
    });
    
    console.log("✅ Evaluation map V → V** is bijective on all vectors");
  });
});