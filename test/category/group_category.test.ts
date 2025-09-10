import { describe, it, expect } from "vitest";
import { GroupCategory, mkGroupHom, verifyGroupCategoryLaws } from "../../src/algebra/group/GroupCategory";
import { Cyclic } from "../../src/algebra/group/Group";
import { KleinFour } from "../../src/algebra/group/CanonicalGroups";

describe("GroupCategory: The category of groups", () => {
  it("identity morphism preserves group structure", () => {
    const Z3 = Cyclic(3);
    const idZ3 = GroupCategory.id(Z3);
    
    // Identity should map each element to itself
    expect(idZ3.map(0)).toBe(0);
    expect(idZ3.map(1)).toBe(1);
    expect(idZ3.map(2)).toBe(2);
    
    // Should be a homomorphism
    expect(idZ3.witnesses?.isHom).toBe(true);
  });

  it("composition of homomorphisms preserves group structure", () => {
    const Z2 = Cyclic(2);
    const Z4 = Cyclic(4);
    const Z6 = Cyclic(6);
    
    // f: Z2 -> Z4 (trivial map)
    const f = mkGroupHom(Z2, Z4, _ => 0, "trivial");
    
    // g: Z4 -> Z6 (mod 2 map)  
    const g = mkGroupHom(Z4, Z6, x => x % 2, "mod2");
    
    // Compose: g ∘ f
    const composed = GroupCategory.compose(g, f);
    
    // Should be a homomorphism
    expect(composed.witnesses?.isHom).toBe(true);
    
    // Should have correct source and target
    expect(composed.source).toBe(Z2);
    expect(composed.target).toBe(Z6);
    
    // Should map correctly: (g ∘ f)(x) = g(f(x)) = g(0) = 0
    expect(composed.map(0)).toBe(0);
    expect(composed.map(1)).toBe(0);
  });

  it("satisfies left identity law: id ∘ f = f", () => {
    const Z2 = Cyclic(2);
    const Z3 = Cyclic(3);
    
    const f = mkGroupHom(Z2, Z3, _ => 0, "trivial");
    const idZ3 = GroupCategory.id(Z3);
    
    const leftId = GroupCategory.compose(idZ3, f);
    const isEqual = GroupCategory.eqMor!(leftId, f);
    
    expect(isEqual).toBe(true);
  });

  it("satisfies right identity law: f ∘ id = f", () => {
    const Z2 = Cyclic(2);
    const Z3 = Cyclic(3);
    
    const f = mkGroupHom(Z2, Z3, _ => 0, "trivial");
    const idZ2 = GroupCategory.id(Z2);
    
    const rightId = GroupCategory.compose(f, idZ2);
    const isEqual = GroupCategory.eqMor!(rightId, f);
    
    expect(isEqual).toBe(true);
  });

  it("satisfies associativity law: (h ∘ g) ∘ f = h ∘ (g ∘ f)", () => {
    const Z2 = Cyclic(2);
    const Z3 = Cyclic(3);
    const Z4 = Cyclic(4);
    const Z6 = Cyclic(6);
    
    const f = mkGroupHom(Z2, Z3, _ => 0, "trivial");
    const g = mkGroupHom(Z3, Z4, x => x % 2, "mod2");
    const h = mkGroupHom(Z4, Z6, x => x % 2, "mod2");
    
    const leftAssoc = GroupCategory.compose(GroupCategory.compose(h, g), f);
    const rightAssoc = GroupCategory.compose(h, GroupCategory.compose(g, f));
    
    const isEqual = GroupCategory.eqMor!(leftAssoc, rightAssoc);
    expect(isEqual).toBe(true);
  });

  it("verifies all category laws programmatically", () => {
    const laws = verifyGroupCategoryLaws();
    
    expect(laws.leftIdentity).toBe(true);
    expect(laws.rightIdentity).toBe(true);
    expect(laws.associativity).toBe(true);
  });

  it("works with non-cyclic groups like V4", () => {
    const V4Group = KleinFour;
    const Z2 = Cyclic(2);
    
    // Create a homomorphism from V4 to Z2
    // This maps "e" -> 0, "a" -> 1, "b" -> 1, "c" -> 0
    const f = mkGroupHom(V4Group, Z2, (x: string) => {
      if (x === "e") return 0;
      if (x === "a" || x === "b") return 1;
      return 0; // "c" -> 0
    }, "V4_to_Z2");
    
    expect(f.witnesses?.isHom).toBe(true);
    
    // Test composition with identity
    const idV4 = GroupCategory.id(V4Group);
    const composed = GroupCategory.compose(f, idV4);
    const isEqual = GroupCategory.eqMor!(composed, f);
    
    expect(isEqual).toBe(true);
  });

  it("equality of morphisms works correctly", () => {
    const Z2 = Cyclic(2);
    const Z3 = Cyclic(3);
    
    const f1 = mkGroupHom(Z2, Z3, _ => 0, "trivial1");
    const f2 = mkGroupHom(Z2, Z3, _ => 0, "trivial2");
    const f3 = mkGroupHom(Z2, Z3, _ => 1, "nontrivial");
    
    // Same maps should be equal
    expect(GroupCategory.eqMor!(f1, f2)).toBe(true);
    
    // Different maps should not be equal
    expect(GroupCategory.eqMor!(f1, f3)).toBe(false);
  });
});
