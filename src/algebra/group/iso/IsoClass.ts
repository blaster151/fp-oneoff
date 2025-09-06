// IsoClass.ts
import { CayleyTable, canonicalKey, isLatinSquare } from "./CanonicalTable";

export class IsoClass {
  readonly size: number;
  readonly key: string; // canonical hash
  constructor(readonly table: CayleyTable) {
    if (!isLatinSquare(table)) {
      throw new Error("Table is not a valid Latin square; not a group table (missing sanity checks).");
    }
    this.size = table.length;
    this.key = canonicalKey(table);
  }
  equals(other: IsoClass): boolean { return this.key === other.key; }
}

/** Useful invariant filters to short-circuit before factorial work. */
export function orderSpectrum(table: CayleyTable): Map<number, number> {
  // Compute the order of each element by finding the smallest power that gives the identity
  // We assume element 0 is the identity (this is a limitation of the current approach)
  const n = table.length;
  const freq = new Map<number, number>();
  
  for (let a = 0; a < n; a++) {
    let order = 1;
    let current = a;
    
    // Keep multiplying by a until we get back to a (i.e., a^order = a)
    while (current !== a || order === 1) {
      current = table[current][a];
      order++;
      if (order > n) break; // Safety check to avoid infinite loops
    }
    
    // The order is the smallest k such that a^k = a, which means a^(k-1) = e
    const elementOrder = order - 1;
    freq.set(elementOrder, (freq.get(elementOrder) ?? 0) + 1);
  }
  
  return freq;
}