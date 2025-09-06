import { Group } from "./structures";
import { GroupIso } from "./structures";
import { canonicalRepresentatives } from "./CanonicalGroups";

/**
 * Isomorphism class wrapper: represents "all groups isomorphic to G"
 * Equality on IsoClass is by existence of an isomorphism witness, not by elementwise equality.
 */
export interface IsoClass<G> {
  readonly representative: Group<G>;
  readonly canonicalName?: string;
  readonly witnesses?: {
    // Optional: store known isomorphisms to canonical representatives
    toCanonical?: GroupIso<G, any>;
    fromCanonical?: GroupIso<any, G>;
  };
}

/**
 * Create an isomorphism class from a group
 */
export function isoClass<G>(G: Group<G>, canonicalName?: string): IsoClass<G> {
  return {
    representative: G,
    canonicalName,
    witnesses: undefined
  };
}

/**
 * Check if two isomorphism classes represent the same group up to isomorphism
 * This is the fundamental equality for "identical up to isomorphism"
 */
export function sameIsoClass<G, H>(
  C1: IsoClass<G>, 
  C2: IsoClass<H>
): boolean {
  // For now, we'll use multiplication table comparison
  // In a full implementation, this would search for an isomorphism witness
  const table1 = multiplicationTable(C1.representative);
  const table2 = multiplicationTable(C2.representative);
  return table1 === table2;
}

/**
 * Generate a canonical hash from a group's multiplication table
 * This captures the "functional relations" among elements
 */
export function multiplicationTable<G>(G: Group<G>): string {
  const { elems, op } = G;
  const n = elems.length;
  
  // Create a normalized table by sorting elements consistently
  const sortedElems = [...elems].sort((a, b) => {
    // Use string representation for consistent ordering
    const aStr = G.show ? G.show(a) : String(a);
    const bStr = G.show ? G.show(b) : String(b);
    return aStr.localeCompare(bStr);
  });
  
  // Create a mapping from elements to their indices for normalization
  const elemToIndex = new Map<G, number>();
  sortedElems.forEach((elem, index) => {
    elemToIndex.set(elem, index);
  });
  
  // Build table using indices instead of string representations
  const table: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      const result = op(sortedElems[i], sortedElems[j]);
      const resultIndex = elemToIndex.get(result)!;
      row.push(resultIndex);
    }
    table.push(row);
  }
  
  // Return as normalized string using indices
  return table.map(row => row.join(',')).join('|');
}

/**
 * Check if a group is isomorphic to a known canonical representative
 */
export function isCanonicalType<G>(
  G: Group<G>,
  canonicalName: string
): boolean {
  const canonical = canonicalRepresentatives[canonicalName];
  if (!canonical) return false;
  
  const table1 = multiplicationTable(G);
  const table2 = multiplicationTable(canonical);
  return table1 === table2;
}

/**
 * Tag a group with its canonical type if it matches a known representative
 */
export function tagCanonicalType<G>(G: Group<G>): IsoClass<G> {
  for (const [name, canonical] of Object.entries(canonicalRepresentatives)) {
    if (isCanonicalType(G, name)) {
      return isoClass(G, name);
    }
  }
  return isoClass(G);
}