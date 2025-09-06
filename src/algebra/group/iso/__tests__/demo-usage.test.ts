import { strict as A } from "assert";
import { IsoClass } from "../IsoClass";
import { V4, Cn } from "../../finite/StandardGroups";
import { EnhancedIsoClass, createEnhancedIsoClass, autoClassifyGroup } from "../EnhancedIsoClass";

describe("Demo: Standard Groups and Isomorphism Detection", () => {
  it("demonstrates the power of 'same up to isomorphism'", () => {
    // Create standard groups
    const c2_table = new IsoClass(Cn(2));
    const c3_table = new IsoClass(Cn(3));
    const v4_table = new IsoClass(V4());
    
    // Create alternative presentations using CayleyTable
    const c2_alt_table: any = [
      [0, 1],
      [1, 0]
    ];
    const c2_alt = new IsoClass(c2_alt_table);
    
    const v4_alt_table: any = [
      [0, 1, 2, 3],
      [1, 0, 3, 2],
      [2, 3, 0, 1],
      [3, 2, 1, 0]
    ];
    const v4_alt = new IsoClass(v4_alt_table);
    
    // These should be recognized as isomorphic
    A.ok(c2_table.equals(c2_alt), "C2 presentations should be isomorphic");
    A.ok(v4_table.equals(v4_alt), "V4 presentations should be isomorphic");
    
    // These should be recognized as non-isomorphic
    A.ok(!c2_table.equals(c3_table), "C2 and C3 should not be isomorphic");
    A.ok(!c2_table.equals(v4_table), "C2 and V4 should not be isomorphic");
    A.ok(!c3_table.equals(v4_table), "C3 and V4 should not be isomorphic");
  });

  it("demonstrates enhanced classification", () => {
    // Register canonical types
    const c2_registered = createEnhancedIsoClass({
      name: "C2",
      elems: [0, 1],
      op: (a: number, b: number) => (a + b) % 2,
      e: 0,
      inv: (a: number) => a,
      eq: (a: number, b: number) => a === b,
      show: (x: number) => `${x}`
    }, "C2", "Cyclic group of order 2");
    
    const v4_registered = createEnhancedIsoClass({
      name: "V4",
      elems: [0, 1, 2, 3],
      op: (a: number, b: number) => a ^ b,
      e: 0,
      inv: (a: number) => a,
      eq: (a: number, b: number) => a === b,
      show: (x: number) => `${x}`
    }, "V4", "Klein four-group");
    
    // Auto-classify unknown groups
    const unknown_c2 = autoClassifyGroup({
      name: "unknown",
      elems: [0, 1],
      op: (a: number, b: number) => (a + b) % 2,
      e: 0,
      inv: (a: number) => a,
      eq: (a: number, b: number) => a === b,
      show: (x: number) => `${x}`
    });
    
    const unknown_v4 = autoClassifyGroup({
      name: "unknown",
      elems: [0, 1, 2, 3],
      op: (a: number, b: number) => a ^ b,
      e: 0,
      inv: (a: number) => a,
      eq: (a: number, b: number) => a === b,
      show: (x: number) => `${x}`
    });
    
    // Should be automatically classified
    A.equal(unknown_c2.canonicalName, "C2");
    A.equal(unknown_v4.canonicalName, "V4");
    
    // Should be recognized as isomorphic to registered types
    A.ok(unknown_c2.isIsomorphicTo(c2_registered));
    A.ok(unknown_v4.isIsomorphicTo(v4_registered));
  });

  it("demonstrates canonical key properties", () => {
    const c2_1 = new IsoClass(Cn(2));
    const c2_2 = new IsoClass(Cn(2));
    const c3 = new IsoClass(Cn(3));
    const v4 = new IsoClass(V4());
    
    // Same groups should have same keys
    A.equal(c2_1.key, c2_2.key);
    
    // Different groups should have different keys
    A.notEqual(c2_1.key, c3.key);
    A.notEqual(c2_1.key, v4.key);
    A.notEqual(c3.key, v4.key);
    
    // Keys should be deterministic
    const c2_3 = new IsoClass(Cn(2));
    A.equal(c2_1.key, c2_3.key);
  });

  it("demonstrates relabeling invariance", () => {
    // Create a relabeled C3: (0,1,2) -> (2,0,1)
    const c3_original = new IsoClass(Cn(3));
    const c3_relabeled = new IsoClass([
      [2, 0, 1],
      [0, 1, 2],
      [1, 2, 0]
    ]);
    
    // Should be recognized as isomorphic
    A.ok(c3_original.equals(c3_relabeled));
    
    // Should have same canonical key
    A.equal(c3_original.key, c3_relabeled.key);
  });
});