/**
 * Categorical monomorphisms (left-cancellable maps) over the simple Group/Homomorphism
 * defined in IsomorphismWitnesses.ts.
 */
import { Group, Homomorphism } from "../iso/IsomorphismWitnesses";

// Monomorphism: for all g,h: J -> A, if f ∘ g = f ∘ h then g = h
export function isMonomorphism<A, B, J>(
  f: Homomorphism<A, B>,
  testPairs: Array<{ g: Homomorphism<J, A>; h: Homomorphism<J, A> }>,
  elemsJ: J[]
): boolean {
  for (const { g, h } of testPairs) {
    const compositionsEqual = elemsJ.every(j => {
      const fg = f.map(g.map(j));
      const fh = f.map(h.map(j));
      return f.target.eq(fg, fh);
    });

    if (compositionsEqual) {
      // Compare in A using f.source.eq (not g.source.eq, whose carrier is J)
      const gEqualsH = elemsJ.every(j => f.source.eq(g.map(j), h.map(j)));
      if (!gEqualsH) return false;
    }
  }
  return true;
}

// Finite/injective characterization (still uses elems lists that you pass in)
export function isMonomorphismFinite<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  _elemsB: B[]
): boolean {
  // injectivity on A ⇒ mono in Grp
  for (let i = 0; i < elemsA.length; i++) {
    for (let j = i + 1; j < elemsA.length; j++) {
      const x = elemsA[i]!;
      const y = elemsA[j]!;
      if (f.target.eq(f.map(x), f.map(y)) && !f.source.eq(x, y)) {
        return false;
      }
    }
  }
  return true;
}

// Generate some simple J -> A probes (constant maps) given an explicit J-group
export function generateMonomorphismTestPairs<A, B, J>(
  f: Homomorphism<A, B>,
  elemsA: A[],
  JGroup: Group<J>,
  _elemsJ: J[]
): Array<{ g: Homomorphism<J, A>; h: Homomorphism<J, A> }> {
  const out: Array<{ g: Homomorphism<J, A>; h: Homomorphism<J, A> }> = [];
  for (const a1 of elemsA) {
    for (const a2 of elemsA) {
      const g: Homomorphism<J, A> = { source: JGroup, target: f.source, map: (_j: J) => a1 };
      const h: Homomorphism<J, A> = { source: JGroup, target: f.source, map: (_j: J) => a2 };
      out.push({ g, h });
    }
  }
  return out;
}

// Currying helper with the corrected equality comparison
export function isLeftCancellable<A, B, J>(
  f: Homomorphism<A, B>,
  elemsJ: J[]
) {
  return (g: Homomorphism<J, A>, h: Homomorphism<J, A>) => {
    const compositionsEqual = elemsJ.every(j =>
      f.target.eq(f.map(g.map(j)), f.map(h.map(j)))
    );
    if (!compositionsEqual) return true;
    return elemsJ.every(j => f.source.eq(g.map(j), h.map(j)));
  };
}

// Bridge: injectivity ↔ monomorphism (in concrete categories like Grp)
export function injectivityToMonomorphism<A, B>(
  f: Homomorphism<A, B>,
  elemsA: A[]
) {
  const isInjective = isMonomorphismFinite(f, elemsA, []);
  // Use J = A with the same group structure as f.source for our probes
  const JGroup: Group<A> = f.source;
  const testPairs = generateMonomorphismTestPairs(f, elemsA, JGroup, elemsA);
  const isMono = isMonomorphism(f, testPairs, elemsA);
  return { isInjective, isMonomorphism: isMono, equivalence: isInjective === isMono };
}

// A tiny example (Z ↪ R)
export function createInclusionExample() {
  const Z: Group<number> = {
    elems: [0, 1, -1, 2, -2],
    id: 0,
    op: (x, y) => x + y,
    inv: x => -x,
    eq: (x, y) => x === y
  };

  const R: Group<number> = {
    elems: [0, 1, -1, 2, -2, 0.5, -0.5],
    id: 0,
    op: (x, y) => x + y,
    inv: x => -x,
    eq: (x, y) => x === y
  };

  const inclusion: Homomorphism<number, number> = {
    source: Z,
    target: R,
    map: x => x
  };

  const elemsZ = Z.elems;
  const isInjective = isMonomorphismFinite(inclusion, elemsZ, R.elems);
  const JGroup = Z as Group<number>;
  const testPairs = generateMonomorphismTestPairs(inclusion, elemsZ, JGroup, elemsZ);
  const isMono = isMonomorphism(inclusion, testPairs, elemsZ);

  return { inclusion, isInjective, hasLeftInverse: false, isMonomorphism: isMono };
}

// Convenience for quickly packaging a morphism with computed props
export function createMorphismWithProperties<A, B>(
  source: Group<A>,
  target: Group<B>,
  map: (a: A) => B,
  elemsA: A[],
  elemsB: B[]
): Homomorphism<A, B> & {
  isMonomorphism: boolean;
  isEpimorphism: boolean;
  isIsomorphism: boolean;
} {
  const morphism: Homomorphism<A, B> = { source, target, map };

  // mono = injective (finite check)
  const isMonomorphism = isMonomorphismFinite(morphism, elemsA, elemsB);

  // epi = surjective (finite check)
  const isEpimorphism = elemsB.every(b => elemsA.some(a => target.eq(map(a), b)));

  // iso = bijection
  const isIsomorphism = isMonomorphism && isEpimorphism;

  return { ...morphism, isMonomorphism, isEpimorphism, isIsomorphism };
}
