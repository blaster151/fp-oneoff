// Catalog.ts
import { CayleyTable, canonicalKey } from "./CanonicalTable";
import { V4, Cn } from "../finite/StandardGroups";
import { Dn } from "../finite/Dihedral";

export interface IsoClassInfo {
  name: string;
  order: number;
  notes?: string[];
}

const known: Map<string, IsoClassInfo> = new Map();

// Seed a few canonical keys
(function seed() {
  const add = (t: CayleyTable, info: IsoClassInfo) => known.set(canonicalKey(t), info);

  add(V4(), { name: "V4 (Klein four)", order: 4, notes: ["Z2 × Z2", "every element self-inverse"] });
  add(Cn(2), { name: "C2 (cyclic)", order: 2 });
  add(Cn(3), { name: "C3 (cyclic)", order: 3 });
  add(Cn(4), { name: "C4 (cyclic)", order: 4 });
  add(Dn(4), { name: "D4 (dihedral)", order: 8, notes: ["square symmetries"] });
  add(Dn(5), { name: "D5 (dihedral)", order: 10 });
})();

export function lookupIsoClass(table: CayleyTable): IsoClassInfo | undefined {
  return known.get(canonicalKey(table));
}