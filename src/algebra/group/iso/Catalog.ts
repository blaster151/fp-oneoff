// Catalog.ts
import { CayleyTable, canonicalKey } from "./CanonicalTable";
import { V4, Cn } from "../finite/StandardGroups";
import { Dn } from "../finite/Dihedral";

export interface IsoClassInfo {
  name: string;
  order: number;
  notes?: string[];
  properties?: string[];
  crossRef?: string;
}

const known: Map<string, IsoClassInfo> = new Map();

// Seed a few canonical keys
(function seed() {
  const add = (t: CayleyTable, info: IsoClassInfo) => known.set(canonicalKey(t), info);

  add(V4(), { 
    name: "V4 (Klein four)", 
    order: 4, 
    notes: ["Z2 × Z2", "every element self-inverse"],
    properties: ["abelian", "non-cyclic"],
    crossRef: "docs/math/notes/iso-automorphism.md §Identical up to isomorphism for abstract vs. concrete discussion"
  });
  add(Cn(2), { name: "C2 (cyclic)", order: 2, properties: ["abelian", "cyclic"] });
  add(Cn(3), { name: "C3 (cyclic)", order: 3, properties: ["abelian", "cyclic"] });
  add(Cn(4), { name: "C4 (cyclic)", order: 4, properties: ["abelian", "cyclic"] });
  add(Dn(4), { 
    name: "D4 (dihedral)", 
    order: 8, 
    notes: ["square symmetries"], 
    properties: ["non-abelian", "finite"] 
  });
  add(Dn(5), { 
    name: "D5 (dihedral)", 
    order: 10, 
    properties: ["non-abelian", "finite"] 
  });
})();

export function lookupIsoClass(table: CayleyTable): IsoClassInfo | undefined {
  return known.get(canonicalKey(table));
}