// Traceability: Smith §3.1-3.2 – Small vs Large categories, plural talk

import { describe, it, expect } from "vitest";
import { isSmall, isLarge, asLarge } from "../../src/category/core";
import { FinGrp, cyclic2, klein4 } from "../../src/examples/fingrp";
import { Grp, FinGrpAsLarge } from "../../src/examples/grp-large";

describe("Small vs Large Categories: Plural Talk", () => {
  it("FinGrp is small: can enumerate objects", () => {
    expect(isSmall(FinGrp)).toBe(true);
    expect(isLarge(FinGrp)).toBe(false);

    // Can enumerate all objects
    const objects = Array.from(FinGrp.objects());
    expect(objects).toHaveLength(2);
    expect(objects.map(g => (g as any).name)).toEqual(["C2", "V4"]);
  });

  it("Grp is large: cannot enumerate objects", () => {
    expect(isLarge(Grp)).toBe(true);
    expect(isSmall(Grp)).toBe(false);

    // Cannot enumerate objects - this would be infinite
    // But we can still work with specific objects
    const c2 = cyclic2();
    const v4 = klein4();
    
    // Can compute hom-sets on demand
    const homC2toV4 = Array.from(Grp.hom(c2, v4));
    expect(homC2toV4.length).toBeGreaterThan(0);
  });

  it("adapter: small -> large preserves functionality", () => {
    expect(isLarge(FinGrpAsLarge)).toBe(true);
    
    // Same hom-sets as the original small category
    const c2 = cyclic2();
    const v4 = klein4();
    
    const smallHoms = Array.from(FinGrp.hom(c2, v4));
    const largeHoms = Array.from(FinGrpAsLarge.hom(c2, v4));
    
    expect(smallHoms).toHaveLength(largeHoms.length);
  });

  it("demonstrates plural talk: large categories are virtual", () => {
    // Large categories represent "plural talk" - we don't enumerate all objects
    // but we can still compute with them locally
    
    const c2 = cyclic2();
    const v4 = klein4();
    
    // Identity morphisms work the same
    const idC2 = Grp.id(c2);
    const idV4 = Grp.id(v4);
    
    expect(Grp.equalMor(idC2, idC2)).toBe(true);
    expect(Grp.equalMor(idV4, idV4)).toBe(true);
    
    // Composition works the same
    const homs = Array.from(Grp.hom(c2, v4));
    if (homs.length > 0) {
      const f = homs[0];
      const composed = Grp.comp(idV4, f);
      expect(Grp.equalMor(composed, f)).toBe(true);
    }
  });

  it("shows the key difference: enumeration vs on-demand", () => {
    // Small category: explicit enumeration
    const smallObjects = Array.from(FinGrp.objects());
    expect(smallObjects).toHaveLength(2);
    
    // Large category: no enumeration, but local computability
    const c2 = cyclic2();
    const v4 = klein4();
    
    // We can still compute hom-sets for specific objects
    const homC2toC2 = Array.from(Grp.hom(c2, c2));
    const homV4toV4 = Array.from(Grp.hom(v4, v4));
    
    expect(homC2toC2.length).toBeGreaterThan(0);
    expect(homV4toV4.length).toBeGreaterThan(0);
    
    // But we cannot enumerate "all groups" - that's the point of large categories
    // This represents the difference between "set talk" and "plural talk"
  });
});
