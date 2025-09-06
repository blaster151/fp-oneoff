// GroupToTable.ts
// Bridge between Group interface and CayleyTable for canonicalization

import { Group } from "../structures";
import { CayleyTable, isLatinSquare } from "./CanonicalTable";

/**
 * Convert a finite Group to a CayleyTable for canonicalization
 */
export function groupToTable<G>(G: Group<G>): CayleyTable {
  const { elems, op } = G;
  const n = elems.length;
  
  // Create mapping from elements to indices
  const elemToIndex = new Map<G, number>();
  elems.forEach((elem, index) => {
    elemToIndex.set(elem, index);
  });
  
  // Build Cayley table
  const table: CayleyTable = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const result = op(elems[i], elems[j]);
      const resultIndex = elemToIndex.get(result);
      if (resultIndex === undefined) {
        throw new Error(`Group operation result ${result} not found in group elements`);
      }
      table[i][j] = resultIndex;
    }
  }
  
  return table;
}

/**
 * Convert a CayleyTable back to a Group with numeric elements
 */
export function tableToGroup(table: CayleyTable, name?: string): Group<number> {
  if (!isLatinSquare(table)) {
    throw new Error("Table is not a valid Latin square");
  }
  
  const n = table.length;
  const elems = Array.from({ length: n }, (_, i) => i);
  
  return {
    name: name || `Group_${n}`,
    elems,
    op: (a: number, b: number) => table[a][b],
    e: 0, // Assume 0 is identity (this is a limitation)
    inv: (a: number) => {
      // Find inverse by searching for element that gives identity
      for (let i = 0; i < n; i++) {
        if (table[a][i] === 0) return i;
      }
      throw new Error(`No inverse found for element ${a}`);
    },
    eq: (a: number, b: number) => a === b,
    show: (x: number) => `${x}`
  };
}

/**
 * Create an IsoClass from a Group
 */
export function groupToIsoClass<G>(G: Group<G>): IsoClass {
  const table = groupToTable(G);
  return new IsoClass(table);
}

// Import IsoClass for the return type
import { IsoClass } from "./IsoClass";