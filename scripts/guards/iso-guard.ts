import { firstIsoWitness } from "../../src/algebra/groups/firstIso";

export function assertIsIso<G, H>(w: ReturnType<typeof firstIsoWitness<G, H>>): void {
  if (!w.iso) {
    throw new Error(`Expected isomorphism but got { inj:${w.inj}, surj:${w.surj}, homo:${w.homo} }`);
  }
}