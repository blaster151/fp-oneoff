import { describe, it, expect } from "vitest";
import { discrete, indiscrete, continuous } from "../Topology";
import { subspace } from "../Subspace";
import { inclusion } from "../Embeddings";
import { sierpinski } from "../Spaces";

const eqNum = (a:number,b:number)=>a===b;

describe("Continuity beyond discrete spaces", () => {
  it("subspace inclusion is continuous (discrete example)", () => {
    const X = [0,1,2];
    const TX = discrete(X);
    const S = [0,2];
    const TS = subspace(eqNum, TX, S);
    const i = inclusion(eqNum, S, X);
    expect(continuous(eqNum, eqNum, TS, TX, i)).toBe(true);
  });

  it("composition of continuous maps is continuous (Sierpinski -> indiscrete)", () => {
    const TSp = sierpinski();
    const TXi = indiscrete([0,1,2]);
    const f = (s:number)=> (s===1? 0 : 1);  // continuous to indiscrete
    const g = (_:number)=> 2;               // continuous from indiscrete to itself
    const comp = (s:number)=> g(f(s));

    expect(continuous(eqNum, eqNum, TSp, TXi, f)).toBe(true);
    expect(continuous(eqNum, eqNum, TXi, TXi, g)).toBe(true);
    expect(continuous(eqNum, eqNum, TSp, TXi, comp)).toBe(true);
  });
});