import { strict as A } from "assert";
import { EnhancedIsoClass, IsoClassRegistry, createEnhancedIsoClass, autoClassifyGroup, globalIsoRegistry } from "../EnhancedIsoClass";
import { KleinFour, CyclicCanonical } from "../../CanonicalGroups";

describe("Enhanced Isomorphism Class", () => {
  describe("Basic Functionality", () => {
    it("creates enhanced isomorphism class", () => {
      const C2 = CyclicCanonical(2);
      const enhanced = new EnhancedIsoClass(C2, "C2");
      
      A.equal(enhanced.size, 2);
      A.ok(typeof enhanced.key === 'string');
      A.equal(enhanced.canonicalName, "C2");
    });

    it("compares isomorphic groups", () => {
      const C2_1 = CyclicCanonical(2);
      const C2_2 = CyclicCanonical(2);
      
      const enhanced1 = new EnhancedIsoClass(C2_1, "C2");
      const enhanced2 = new EnhancedIsoClass(C2_2, "C2");
      
      A.ok(enhanced1.isIsomorphicTo(enhanced2));
    });

    it("distinguishes non-isomorphic groups", () => {
      const C2 = CyclicCanonical(2);
      const C3 = CyclicCanonical(3);
      
      const enhanced2 = new EnhancedIsoClass(C2, "C2");
      const enhanced3 = new EnhancedIsoClass(C3, "C3");
      
      A.ok(!enhanced2.isIsomorphicTo(enhanced3));
    });
  });

  describe("Registry Functionality", () => {
    it("registers and retrieves canonical types", () => {
      const registry = new IsoClassRegistry();
      
      registry.register("abc123", "TestGroup", "A test group");
      
      A.ok(registry.isRegistered("abc123"));
      A.equal(registry.getName("abc123"), "TestGroup");
      A.equal(registry.getDescription("abc123"), "A test group");
    });

    it("lists registered keys", () => {
      const registry = new IsoClassRegistry();
      
      registry.register("key1", "Group1");
      registry.register("key2", "Group2");
      
      const keys = registry.listKeys();
      A.equal(keys.length, 2);
      A.ok(keys.includes("key1"));
      A.ok(keys.includes("key2"));
    });
  });

  describe("Enhanced Creation", () => {
    it("creates and registers enhanced isomorphism class", () => {
      const C2 = CyclicCanonical(2);
      const enhanced = createEnhancedIsoClass(C2, "C2", "Cyclic group of order 2");
      
      A.equal(enhanced.canonicalName, "C2");
      A.ok(globalIsoRegistry.isRegistered(enhanced.key));
      A.equal(globalIsoRegistry.getName(enhanced.key), "C2");
    });

    it("auto-classifies groups", () => {
      // First register a canonical type
      const C2 = CyclicCanonical(2);
      const registered = createEnhancedIsoClass(C2, "C2", "Cyclic group of order 2");
      
      // Now create another C2 and auto-classify it
      const C2_alt = CyclicCanonical(2);
      const autoClassified = autoClassifyGroup(C2_alt);
      
      A.equal(autoClassified.canonicalName, "C2");
      A.ok(autoClassified.isIsomorphicTo(registered));
    });
  });

  describe("Klein Four-Group Recognition", () => {
    it("recognizes Klein four-group", () => {
      const klein = new EnhancedIsoClass(KleinFour, "Klein Four");
      
      A.equal(klein.size, 4);
      A.ok(klein.key.length > 0);
    });

    it("recognizes different presentations of Klein four-group", () => {
      const klein1 = new EnhancedIsoClass(KleinFour, "Klein Four");
      
      // Alternative presentation
      const kleinAlt: any = {
        name: "Klein Alt",
        elems: ["e", "a", "b", "c"],
        op: (x: string, y: string) => {
          if (x === "e") return y;
          if (y === "e") return x;
          if (x === y) return "e";
          if ((x === "a" && y === "b") || (x === "b" && y === "a")) return "c";
          if ((x === "a" && y === "c") || (x === "c" && y === "a")) return "b";
          if ((x === "b" && y === "c") || (x === "c" && y === "b")) return "a";
          return "e";
        },
        e: "e",
        inv: (x: string) => x,
        eq: (a: string, b: string) => a === b,
        show: (x: string) => x
      };
      
      const klein2 = new EnhancedIsoClass(kleinAlt);
      
      A.ok(klein1.isIsomorphicTo(klein2));
    });
  });

  describe("String Representation", () => {
    it("provides meaningful string representation", () => {
      const C2 = CyclicCanonical(2);
      const enhanced = new EnhancedIsoClass(C2, "C2");
      
      const str = enhanced.toString();
      A.ok(str.includes("C2"));
      A.ok(str.includes("key:"));
    });

    it("handles unnamed groups", () => {
      const C2 = CyclicCanonical(2);
      const enhanced = new EnhancedIsoClass(C2);
      
      const str = enhanced.toString();
      A.ok(str.includes("Group_2"));
      A.ok(str.includes("key:"));
    });
  });
});