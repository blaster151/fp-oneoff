import { describe, it, expect } from "vitest";
import { cayleyTable, isSameTableUpToRename } from "../Cayley";
import { Z2, Z3, Z4 } from "../../../structures/group/util/FiniteGroups";
import { mkFiniteGroup } from "../FiniteGroups";

describe("Cayley Table Operations", () => {
  describe("cayleyTable", () => {
    it("should generate correct Cayley table for Z2", () => {
      const table = cayleyTable(Z2);
      expect(table).toEqual([
        [0, 1],
        [1, 0]
      ]);
    });

    it("should generate correct Cayley table for Z3", () => {
      const table = cayleyTable(Z3);
      expect(table).toEqual([
        [0, 1, 2],
        [1, 2, 0],
        [2, 0, 1]
      ]);
    });

    it("should generate correct Cayley table for Z4", () => {
      const table = cayleyTable(Z4);
      expect(table).toEqual([
        [0, 1, 2, 3],
        [1, 2, 3, 0],
        [2, 3, 0, 1],
        [3, 0, 1, 2]
      ]);
    });

    it("should throw error for infinite groups", () => {
      const infiniteGroup = {
        eq: (x: number, y: number) => x === y,
        op: (x: number, y: number) => x + y,
        id: 0,
        inv: (x: number) => -x
        // no elements property
      };
      
      expect(() => cayleyTable(infiniteGroup as any)).toThrow("finite elements required");
    });
  });

  describe("isSameTableUpToRename", () => {
    it("should recognize identical groups as isomorphic", () => {
      expect(isSameTableUpToRename(Z2, Z2)).toBe(true);
      expect(isSameTableUpToRename(Z3, Z3)).toBe(true);
      expect(isSameTableUpToRename(Z4, Z4)).toBe(true);
    });

    it("should recognize different sized groups as non-isomorphic", () => {
      expect(isSameTableUpToRename(Z2, Z3)).toBe(false);
      expect(isSameTableUpToRename(Z3, Z4)).toBe(false);
      expect(isSameTableUpToRename(Z2, Z4)).toBe(false);
    });

    it("should recognize isomorphic groups with different element names", () => {
      // Create a group isomorphic to Z2 but with different element names
      const Z2_renamed = mkFiniteGroup({
        eq: (x: string, y: string) => x === y,
        op: (x: string, y: string) => {
          if (x === "zero" && y === "zero") return "zero";
          if (x === "zero" && y === "one") return "one";
          if (x === "one" && y === "zero") return "one";
          if (x === "one" && y === "one") return "zero";
          throw new Error("invalid elements");
        },
        id: "zero",
        inv: (x: string) => x, // self-inverse
        elements: ["zero", "one"]
      });

      expect(isSameTableUpToRename(Z2, Z2_renamed)).toBe(true);
    });

    it("should recognize non-isomorphic groups of same size", () => {
      // Create a different group of size 4 (not Z4)
      const K4 = mkFiniteGroup({
        eq: (x: number, y: number) => x === y,
        op: (x: number, y: number) => x ^ y, // XOR operation (Klein 4-group)
        id: 0,
        inv: (x: number) => x, // self-inverse
        elements: [0, 1, 2, 3]
      });

      // Z4 and K4 are both groups of order 4, but not isomorphic
      expect(isSameTableUpToRename(Z4, K4)).toBe(false);
    });

    it("should handle groups without elements property", () => {
      const infiniteGroup1 = {
        eq: (x: number, y: number) => x === y,
        op: (x: number, y: number) => x + y,
        id: 0,
        inv: (x: number) => -x
      };

      const infiniteGroup2 = {
        eq: (x: number, y: number) => x === y,
        op: (x: number, y: number) => x + y,
        id: 0,
        inv: (x: number) => -x
      };

      expect(isSameTableUpToRename(infiniteGroup1 as any, infiniteGroup2 as any)).toBe(false);
    });
  });

  describe("Mathematical Properties", () => {
    it("should verify Cayley table properties", () => {
      const table = cayleyTable(Z3);
      
      // Identity property: first row and column should be the group elements
      expect(table[0]).toEqual([0, 1, 2]); // 0 * x = x
      expect(table.map(row => row[0])).toEqual([0, 1, 2]); // x * 0 = x
      
      // Associativity is harder to test directly, but we can check some cases
      // (a * b) * c = a * (b * c) for some specific values
      const a = 1, b = 2, c = 0;
      const leftAssoc = Z3.op(Z3.op(a, b), c);
      const rightAssoc = Z3.op(a, Z3.op(b, c));
      expect(leftAssoc).toBe(rightAssoc);
    });

    it("should demonstrate isomorphism via table comparison", () => {
      // This test shows how the Cayley table approach implements
      // the mathematical theorem: "same multiplication table ⇒ isomorphic"
      
      const Z2_copy = mkFiniteGroup({
        eq: (x: number, y: number) => x === y,
        op: (x: number, y: number) => (x + y) % 2,
        id: 0,
        inv: (x: number) => x,
        elements: [0, 1]
      });

      // Z2 and Z2_copy should be isomorphic (they're the same group)
      expect(isSameTableUpToRename(Z2, Z2_copy)).toBe(true);
      
      // Their Cayley tables should be identical
      const table1 = cayleyTable(Z2);
      const table2 = cayleyTable(Z2_copy);
      expect(table1).toEqual(table2);
    });
  });
});