import { strict as A } from "assert";
import { IsoClass } from "../IsoClass";
import { V4, Cn } from "../../finite/StandardGroups";
import { EnhancedIsoClass, createEnhancedIsoClass, autoClassifyGroup } from "../EnhancedIsoClass";
import { groupToIsoClass } from "../GroupToTable";
import { KleinFour, CyclicCanonical } from "../../CanonicalGroups";

describe("Comprehensive Isomorphism Detection", () => {
  describe("Standard Groups", () => {
    it("recognizes C2 in different presentations", () => {
      const c2_table = new IsoClass(Cn(2));
      const c2_group = groupToIsoClass(CyclicCanonical(2));
      
      A.ok(c2_table.equals(c2_group));
    });

    it("recognizes C3 in different presentations", () => {
      const c3_table = new IsoClass(Cn(3));
      const c3_group = groupToIsoClass(CyclicCanonical(3));
      
      A.ok(c3_table.equals(c3_group));
    });

    it("recognizes V4 (Klein four-group) in different presentations", () => {
      const v4_table = new IsoClass(V4());
      const v4_group = groupToIsoClass(KleinFour);
      
      A.ok(v4_table.equals(v4_group));
    });
  });

  describe("Enhanced Classification", () => {
    it("auto-classifies standard groups", () => {
      // Register some canonical types
      const c2_registered = createEnhancedIsoClass(CyclicCanonical(2), "C2", "Cyclic group of order 2");
      const v4_registered = createEnhancedIsoClass(KleinFour, "V4", "Klein four-group");
      
      // Auto-classify table-based groups
      const c2_table = autoClassifyGroup({
        name: "C2_table",
        elems: [0, 1],
        op: (a: number, b: number) => (a + b) % 2,
        e: 0,
        inv: (a: number) => a,
        eq: (a: number, b: number) => a === b,
        show: (x: number) => `${x}`
      });
      
      const v4_table = autoClassifyGroup({
        name: "V4_table",
        elems: [0, 1, 2, 3],
        op: (a: number, b: number) => a ^ b,
        e: 0,
        inv: (a: number) => a,
        eq: (a: number, b: number) => a === b,
        show: (x: number) => `${x}`
      });
      
      A.equal(c2_table.canonicalName, "C2");
      A.equal(v4_table.canonicalName, "V4");
    });
  });

  describe("Non-isomorphic Groups", () => {
    it("distinguishes C4 from V4", () => {
      const c4 = new IsoClass(Cn(4));
      const v4 = new IsoClass(V4());
      
      A.ok(!c4.equals(v4));
    });

    it("distinguishes C2 from C3", () => {
      const c2 = new IsoClass(Cn(2));
      const c3 = new IsoClass(Cn(3));
      
      A.ok(!c2.equals(c3));
    });

    it("distinguishes C6 from V4", () => {
      const c6 = new IsoClass(Cn(6));
      const v4 = new IsoClass(V4());
      
      A.ok(!c6.equals(v4));
    });
  });

  describe("Relabeling Invariance", () => {
    it("recognizes relabeled C3", () => {
      const c3_original = new IsoClass(Cn(3));
      
      // Create a relabeled version: (0,1,2) -> (2,0,1)
      const c3_relabeled_table: any = [
        [2, 0, 1],
        [0, 1, 2],
        [1, 2, 0]
      ];
      const c3_relabeled = new IsoClass(c3_relabeled_table);
      
      A.ok(c3_original.equals(c3_relabeled));
    });

    it("recognizes relabeled V4", () => {
      const v4_original = new IsoClass(V4());
      
      // Create a relabeled version: (0,1,2,3) -> (3,2,1,0)
      const v4_relabeled_table: any = [
        [3, 2, 1, 0],
        [2, 3, 0, 1],
        [1, 0, 3, 2],
        [0, 1, 2, 3]
      ];
      const v4_relabeled = new IsoClass(v4_relabeled_table);
      
      A.ok(v4_original.equals(v4_relabeled));
    });
  });

  describe("Canonical Key Properties", () => {
    it("generates consistent keys for isomorphic groups", () => {
      const c2_1 = new IsoClass(Cn(2));
      const c2_2 = new IsoClass(Cn(2));
      
      A.equal(c2_1.key, c2_2.key);
    });

    it("generates different keys for non-isomorphic groups", () => {
      const c2 = new IsoClass(Cn(2));
      const c3 = new IsoClass(Cn(3));
      const v4 = new IsoClass(V4());
      
      A.notEqual(c2.key, c3.key);
      A.notEqual(c2.key, v4.key);
      A.notEqual(c3.key, v4.key);
    });

    it("keys are deterministic", () => {
      const c3_1 = new IsoClass(Cn(3));
      const c3_2 = new IsoClass(Cn(3));
      
      A.equal(c3_1.key, c3_2.key);
    });
  });
});