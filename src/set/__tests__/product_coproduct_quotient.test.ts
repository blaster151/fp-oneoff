import { describe, it, expect } from "vitest";
import { mkFiniteSet } from "../Set";
import { product } from "../Product";
import { coproduct } from "../Coproduct";
import { quotient } from "../Quotient";

describe("Set constructions", () => {
  const A = mkFiniteSet([0,1,2], (a,b)=>a===b);
  const B = mkFiniteSet(["x","y"], (a,b)=>a===b);

  it("product size 3*2=6", () => {
    const AxB = product(A,B);
    expect(AxB.elems.length).toBe(6);
  });

  it("coproduct size 3+2=5", () => {
    const AplusB = coproduct(A,B);
    expect(AplusB.elems.length).toBe(5);
  });

  it("quotient merges by parity", () => {
    const parity = (x:number,y:number)=> (x-y)%2===0;
    const Q = quotient(A, parity);
    expect(Q.elems.length).toBe(2);
  });
});