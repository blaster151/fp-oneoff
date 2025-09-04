import { describe, it, expect } from "vitest";
import { HFunctor } from "../HFunctor";
import type { Nat1 } from "../Nat";

/** A tiny example HFunctor: simple wrapper that applies a transformation. */
interface Wrap<G> { 
  wrap: G; 
}

// Implement hfmap: given nt: G ~> H, send Wrap<G> ~> Wrap<H>
const WrapHFunctor: HFunctor<Wrap> = {
  hfmap<G, H>(nt: Nat1<G, H>) {
    return <A>(wa: Wrap<G>): Wrap<H> => ({ wrap: nt(wa.wrap) });
  }
};

describe("HFunctor example Wrap", () => {
  it("hfmap lifts nat transf pointwise", () => {
    // Nat Id ~> Id
    const id: Nat1<number, number> = (x: number) => x;
    const lift = WrapHFunctor.hfmap<number, number>(id);
    const sample: Wrap<number> = { wrap: 42 };
    expect(lift(sample).wrap).toBe(42);
  });
});