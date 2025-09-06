import { strict as A } from "assert";
import { CayleyTable, isLatinSquare, relabel, canonicalKey } from "../CanonicalTable";
import { IsoClass, orderSpectrum } from "../IsoClass";
import { groupToTable, tableToGroup, groupToIsoClass } from "../GroupToTable";
import { KleinFour, CyclicCanonical } from "../../CanonicalGroups";

describe("Canonical Table Machinery", () => {
  describe("Latin Square Validation", () => {
    it("validates correct Latin squares", () => {
      const validTable: CayleyTable = [
        [0, 1, 2, 3],
        [1, 0, 3, 2],
        [2, 3, 0, 1],
        [3, 2, 1, 0]
      ];
      A.ok(isLatinSquare(validTable));
    });

    it("rejects invalid tables", () => {
      const invalidTable: CayleyTable = [
        [0, 1, 2],
        [1, 0, 2], // Row 1 has duplicate 2
        [2, 0, 1]
      ];
      A.ok(!isLatinSquare(invalidTable));
    });
  });

  describe("Table Relabeling", () => {
    it("relabels tables correctly", () => {
      const table: CayleyTable = [
        [0, 1, 2],
        [1, 2, 0],
        [2, 0, 1]
      ];
      
      const permutation = [1, 0, 2]; // Swap 0 and 1
      const relabeled = relabel(table, permutation);
      
      // Expected: swap rows/columns 0 and 1
      const expected: CayleyTable = [
        [2, 0, 1],
        [0, 1, 2],
        [1, 2, 0]
      ];
      
      A.deepEqual(relabeled, expected);
    });
  });

  describe("Canonical Key Generation", () => {
    it("generates same key for isomorphic groups", () => {
      // C2 group: {0,1} with 0+0=0, 0+1=1, 1+0=1, 1+1=0
      const c2Table: CayleyTable = [
        [0, 1],
        [1, 0]
      ];
      
      // Same group with relabeled elements
      const c2Relabeled: CayleyTable = [
        [1, 0],
        [0, 1]
      ];
      
      const key1 = canonicalKey(c2Table);
      const key2 = canonicalKey(c2Relabeled);
      
      A.equal(key1, key2);
    });

    it("generates different keys for non-isomorphic groups", () => {
      // C2
      const c2Table: CayleyTable = [
        [0, 1],
        [1, 0]
      ];
      
      // C3
      const c3Table: CayleyTable = [
        [0, 1, 2],
        [1, 2, 0],
        [2, 0, 1]
      ];
      
      const key2 = canonicalKey(c2Table);
      const key3 = canonicalKey(c3Table);
      
      A.notEqual(key2, key3);
    });
  });

  describe("IsoClass", () => {
    it("creates IsoClass from valid table", () => {
      const table: CayleyTable = [
        [0, 1],
        [1, 0]
      ];
      
      const isoClass = new IsoClass(table);
      A.equal(isoClass.size, 2);
      A.ok(typeof isoClass.key === 'string');
    });

    it("throws error for invalid table", () => {
      const invalidTable: CayleyTable = [
        [0, 1, 2],
        [1, 0, 2], // Invalid: duplicate in row
        [2, 0, 1]
      ];
      
      A.throws(() => new IsoClass(invalidTable), /not a valid Latin square/);
    });

    it("compares isomorphic classes as equal", () => {
      const table1: CayleyTable = [
        [0, 1],
        [1, 0]
      ];
      
      const table2: CayleyTable = [
        [1, 0],
        [0, 1]
      ];
      
      const class1 = new IsoClass(table1);
      const class2 = new IsoClass(table2);
      
      A.ok(class1.equals(class2));
    });
  });

  describe("Group to Table Conversion", () => {
    it("converts group to table and back", () => {
      const C2 = CyclicCanonical(2);
      const table = groupToTable(C2);
      const backToGroup = tableToGroup(table, "C2_restored");
      
      A.equal(backToGroup.elems.length, 2);
      A.equal(backToGroup.op(0, 1), 1);
      A.equal(backToGroup.op(1, 0), 1);
      A.equal(backToGroup.op(1, 1), 0);
    });

    it("creates IsoClass from group", () => {
      const C2 = CyclicCanonical(2);
      const isoClass = groupToIsoClass(C2);
      
      A.equal(isoClass.size, 2);
      A.ok(isoClass.key.length > 0);
    });
  });

  describe("Order Spectrum", () => {
    it("computes order spectrum for C3", () => {
      const c3Table: CayleyTable = [
        [0, 1, 2],
        [1, 2, 0],
        [2, 0, 1]
      ];
      
      const spectrum = orderSpectrum(c3Table);
      
      // C3 has one element of order 1 (identity) and two elements of order 3
      A.equal(spectrum.get(1), 1);
      A.equal(spectrum.get(3), 2);
    });
  });

  describe("Klein Four-Group Canonicalization", () => {
    it("recognizes Klein four-group in different presentations", () => {
      const klein1 = groupToIsoClass(KleinFour);
      
      // Alternative presentation with same structure
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
      
      const klein2 = groupToIsoClass(kleinAlt);
      
      A.ok(klein1.equals(klein2));
    });
  });
});