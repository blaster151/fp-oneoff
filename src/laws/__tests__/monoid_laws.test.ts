import { describe, it, expect } from "vitest";
import { lawfulMonoid } from "../Monoid";
import { runLaws } from "../Witness";

describe("Monoid<number> under addition", () => {
  const eq = (a:number,b:number)=> a===b;
  const Sum = { empty: 0, concat: (x:number,y:number)=> x+y };
  const pack = lawfulMonoid("Monoid/number/sum", eq, Sum, [0,1,2,3]);

  it("passes basic laws", () => {
    const res = runLaws(pack.laws, { M: pack.struct, xs: [0,1,2,3] });
    expect(res.ok).toBe(true);
  });
});