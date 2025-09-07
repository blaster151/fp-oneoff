import { FinGrp, cyclic2, klein4 } from "../src/examples/fingrp";
import { asLarge, isSmall, isLarge } from "../src/category/core";

describe("Small vs Large categories", () => {
  it("FinGrp is small; asLarge(FinGrp) is large", () => {
    expect(isSmall(FinGrp)).toBe(true);
    const L = asLarge(FinGrp);
    expect(isLarge(L)).toBe(true);
  });

  it("hom-sets enumerate in small FinGrp", () => {
    const C2 = cyclic2(), V4 = klein4();
    const homs = Array.from(FinGrp.hom(C2, V4));
    expect(homs.length).toBeGreaterThan(0);
    for (const h of homs) {
      expect((h as any).src).toBe(C2);
      expect((h as any).dst).toBe(V4);
    }
  });
});