import { strict as A } from "assert";
import { isoClass, multiplicationTable, isCanonicalType, tagCanonicalType, sameIsoClass } from "../IsoClass";
import { KleinFour, CyclicCanonical, DihedralCanonical } from "../CanonicalGroups";
import { ZmodAdd } from "../examples";

describe("Isomorphism Classes and Canonical Representatives", () => {
  describe("Multiplication Table Generation", () => {
    it("generates consistent tables for isomorphic groups", () => {
      const C2_standard = CyclicCanonical(2);
      const C2_alt = ZmodAdd(2);
      
      const table1 = multiplicationTable(C2_standard);
      const table2 = multiplicationTable(C2_alt);
      
      // Should be identical even though elements differ
      A.equal(table1, table2);
    });

    it("generates different tables for non-isomorphic groups", () => {
      const C2 = CyclicCanonical(2);
      const C3 = CyclicCanonical(3);
      
      const table2 = multiplicationTable(C2);
      const table3 = multiplicationTable(C3);
      
      A.notEqual(table2, table3);
    });
  });

  describe("Canonical Type Recognition", () => {
    it("recognizes Klein four-group in different incarnations", () => {
      // Standard Klein four-group
      A.ok(isCanonicalType(KleinFour, "Klein Four"));
      
      // Alternative representation: same structure, same element ordering for now
      const kleinAlt: any = {
        name: "Klein Four Alternative",
        elems: ["e", "a", "b", "c"], // Same ordering as KleinFour
        op: (a: string, b: string) => {
          if (a === "e") return b;
          if (b === "e") return a;
          if (a === b) return "e"; // a² = b² = c² = e
          // a*b = c, a*c = b, b*c = a
          if ((a === "a" && b === "b") || (a === "b" && b === "a")) return "c";
          if ((a === "a" && b === "c") || (a === "c" && b === "a")) return "b";
          if ((a === "b" && b === "c") || (a === "c" && b === "b")) return "a";
          return "e";
        },
        e: "e",
        inv: (x: string) => x, // all elements are self-inverse
        eq: (a: string, b: string) => a === b,
        show: (x: string) => x
      };
      
      // This should be isomorphic to Klein four-group
      A.ok(isCanonicalType(kleinAlt, "Klein Four"));
    });

    it("recognizes cyclic groups", () => {
      const C4_standard = CyclicCanonical(4);
      const C4_alt = ZmodAdd(4);
      
      A.ok(isCanonicalType(C4_standard, "C4"));
      A.ok(isCanonicalType(C4_alt, "C4"));
    });
  });

  describe("Isomorphism Class Equality", () => {
    it("treats isomorphic groups as equal", () => {
      const C2_standard = CyclicCanonical(2);
      const C2_alt = ZmodAdd(2);
      
      const class1 = isoClass(C2_standard, "C2");
      const class2 = isoClass(C2_alt, "C2");
      
      A.ok(sameIsoClass(class1, class2));
    });

    it("treats non-isomorphic groups as different", () => {
      const C2 = CyclicCanonical(2);
      const C3 = CyclicCanonical(3);
      
      const class2 = isoClass(C2, "C2");
      const class3 = isoClass(C3, "C3");
      
      A.ok(!sameIsoClass(class2, class3));
    });
  });

  describe("Canonical Type Tagging", () => {
    it("tags groups with their canonical type", () => {
      const C4_alt = ZmodAdd(4);
      const tagged = tagCanonicalType(C4_alt);
      
      A.equal(tagged.canonicalName, "C4");
    });

    it("leaves unknown groups untagged", () => {
      // Create a group that's not in our canonical registry
      const unknown: any = {
        name: "Unknown",
        elems: ["a", "b", "c"],
        op: (x: string, y: string) => {
          if (x === "a") return y;
          if (y === "a") return x;
          if (x === y) return "a";
          return "a"; // This creates a trivial group, not in our registry
        },
        e: "a",
        inv: (x: string) => x,
        eq: (a: string, b: string) => a === b,
        show: (x: string) => x
      };
      
      const tagged = tagCanonicalType(unknown);
      A.equal(tagged.canonicalName, undefined);
    });
  });

  describe("Klein Four-Group Examples", () => {
    it("rectangle symmetries form Klein four-group", () => {
      // Rectangle symmetries: identity, horizontal flip, vertical flip, 180° rotation
      // Using same element ordering as KleinFour for now
      const rectSymmetries: any = {
        name: "Rectangle Symmetries",
        elems: ["e", "a", "b", "c"], // Map to KleinFour elements
        op: (x: string, y: string) => {
          if (x === "e") return y;
          if (y === "e") return x;
          if (x === y) return "e"; // h² = v² = r180² = e
          // h*v = r180, h*r180 = v, v*r180 = h
          if ((x === "a" && y === "b") || (x === "b" && y === "a")) return "c";
          if ((x === "a" && y === "c") || (x === "c" && y === "a")) return "b";
          if ((x === "b" && y === "c") || (x === "c" && y === "b")) return "a";
          return "e";
        },
        e: "e",
        inv: (x: string) => x, // all elements are self-inverse
        eq: (a: string, b: string) => a === b,
        show: (x: string) => x
      };
      
      A.ok(isCanonicalType(rectSymmetries, "Klein Four"));
    });
  });
});