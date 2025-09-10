import { firstIsoWitness } from "../../src/cat/grp/first_iso";

export function assertIsIso<G, H>(w: ReturnType<typeof firstIsoWitness<G, H>>): void {
  if (!w.iso) {
    throw new Error(`Expected isomorphism but got { inj:${w.inj}, surj:${w.surj}, homo:${w.homo} }`);
  }
}

export function assertIsMono<G, H>(w: ReturnType<typeof firstIsoWitness<G, H>>): void {
  if (!w.inj) {
    throw new Error(`Expected monomorphism (injective) but got { inj:${w.inj}, surj:${w.surj}, homo:${w.homo} }`);
  }
}

export function assertIsEpi<G, H>(w: ReturnType<typeof firstIsoWitness<G, H>>): void {
  if (!w.surj) {
    throw new Error(`Expected epimorphism (surjective) but got { inj:${w.inj}, surj:${w.surj}, homo:${w.homo} }`);
  }
}

export function assertIsHomomorphism<G, H>(w: ReturnType<typeof firstIsoWitness<G, H>>): void {
  if (!w.homo) {
    throw new Error(`Expected homomorphism but got { inj:${w.inj}, surj:${w.surj}, homo:${w.homo} }`);
  }
}