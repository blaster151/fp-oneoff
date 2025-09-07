import { Klein4, Z_add } from "../../../src/algebra/group/EnhancedGroup";
import { mkHom } from "../../../src/algebra/group/EnhancedGroupHom";
import { GroupCategory as CG } from "../../../src/category/instances/GroupCategory";
import { categoryLaws } from "../../../src/category/CategoryLaws";

// Tiny fixtures
const Z = Z_add.mk(0);
const V4 = Klein4("e","u","v","w");

// homs
const double = mkHom(Z, Z, x => 2*x);
const negate = mkHom(Z, Z, x => -x);
const collapseV4toZ = mkHom(V4, Z, _ => 0); // trivial hom to (Z,+) identity 0

describe("GroupCategory", () => {
  it("identity is a homomorphism and behaves as identity", () => {
    const idZ = CG.id(Z);
    expect(idZ.preservesId()).toBe(true);
    expect(idZ.preservesOp(3,4)).toBe(true);

    const laws = categoryLaws<typeof Z, typeof double>(CG.eqMor!, CG);
    expect(laws.leftIdentity(Z, double)).toBe(true);
    expect(laws.rightIdentity(Z, double)).toBe(true);
  });

  it("composition of homomorphisms is a homomorphism (closure)", () => {
    const comp = CG.compose(negate, double); // x -> -(2x)
    expect(comp.preservesId()).toBe(true);
    expect(comp.preservesOp(5,7)).toBe(true);
  });

  it("associativity of composition", () => {
    const f = mkHom(Z, Z, x => x + 1 - 1);    // identity in disguise
    const g = mkHom(Z, Z, x => 3*x);
    const h = mkHom(Z, Z, x => x - x);        // constant 0 (still a hom)
    const L = CG.compose(CG.compose(h, g), f);
    const R = CG.compose(h, CG.compose(g, f));
    expect(CG.eqMor!(L, R)).toBe(true);
  });

  it("example: image of hom is a subgroup of target", () => {
    // double: Z->Z, image = even integers (a subgroup)
    // Verify the homomorphism property: double(a + b) = double(a) + double(b)
    expect(double.preservesOp(1, 2)).toBe(true);
    expect(double.preservesOp(-3, 5)).toBe(true);
    expect(double.preservesId()).toBe(true);
    
    // Test that the double function produces even integers
    for (let k = -3; k <= 3; k++) {
      const result = double.run(k);
      expect(result % 2 === 0).toBe(true); // all outputs are even
    }
  });

  it("Klein 4-group homomorphisms preserve structure", () => {
    const idV4 = CG.id(V4);
    expect(idV4.preservesId()).toBe(true);
    
    // Test with all elements
    const elems = V4.elems!;
    for (const x of elems) {
      for (const y of elems) {
        expect(idV4.preservesOp(x, y)).toBe(true);
      }
    }
  });

  it("trivial homomorphism from V4 to Z preserves structure", () => {
    expect(collapseV4toZ.preservesId()).toBe(true);
    expect(collapseV4toZ.preservesOp("e", "u")).toBe(true);
    expect(collapseV4toZ.preservesOp("u", "v")).toBe(true);
  });
});