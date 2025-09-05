import { describe, it, expect } from "vitest";
import { discrete, product, continuous } from "../Topology";
import { proj1, proj2, pair, checkProductUP } from "../ProductUP";
import { subspace } from "../Subspace";

const eqNum = (a:number,b:number)=>a===b;

describe("Product UP on finite discrete spaces", () => {
  const X = [0,1], Y = [10,20], Z = [42];
  const TX = discrete(X), TY = discrete(Y), TZ = discrete(Z);

  // Simple functions that should be continuous in discrete spaces
  const f = (z:number)=> 0;  // constant function
  const g = (z:number)=> 10; // constant function

  it("projections are continuous; pairing is continuous; UP equations hold", () => {
    const { cProj1, cProj2, cPair, uniqueHolds } =
      checkProductUP(eqNum, eqNum, eqNum, TZ, TX, TY, f, g, continuous);
    expect(cProj1 && cProj2 && cPair && uniqueHolds).toBe(true);
  });

  it("subspace topology behaves (quick sanity)", () => {
    const S = [0]; // subspace of X
    const sub = subspace(eqNum, TX, S);
    // opens are ∅ and {0} (since TX is discrete, still discrete on S)
    expect(sub.opens.some(U => U.length===0)).toBe(true);
    expect(sub.opens.some(U => U.length===1 && U[0]===0)).toBe(true);
  });
});