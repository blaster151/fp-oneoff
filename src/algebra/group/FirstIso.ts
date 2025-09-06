import { Group, GroupHom, GroupIso, Subgroup } from "./structures";
import { Coset, quotientGroup, leftCoset, isNormal } from "./Quotient";

function eqDefault<T>(a:T,b:T){ return Object.is(a,b); }

// Helper: canonical projection π: G → G/N, g ↦ [g]
export function canonicalProjection<A>(G: Group<A>, N: Subgroup<A>) : GroupHom<A, Coset<A>> {
  const Q = quotientGroup(G, N); // assumes normal; caller should ensure
  return {
    name: "π",
    source: G,
    target: Q,
    map: (g: A) => leftCoset(G, N, g)
  };
}

export interface GroupHomWitnesses<A,B> {
  preservesOp: boolean;
  preservesId: boolean;
  preservesInv: boolean;
  imageSubgroup?: Subgroup<B>;
  kernelSubgroup?: Subgroup<A>;
}

export interface AnalyzedHom<A,B> extends GroupHom<A,B> {
  witnesses?: GroupHomWitnesses<A,B>;
}

/**
 * First Isomorphism Theorem:
 * Given hom f: G→H with kernel K and image Im, build iso φ: G/K ≅ Im.
 *
 * Pre: f.witnesses populated with kernelSubgroup & imageSubgroup.
 *      (Use your existing analyzeGroupHom to compute them.)
 */
export function firstIsomorphism<A,B>(f: AnalyzedHom<A,B>): GroupIso<Coset<A>, B> {
  if (!f.witnesses?.kernelSubgroup || !f.witnesses?.imageSubgroup) {
    throw new Error("firstIsomorphism: f must be analyzed to supply kernel and image.");
  }
  const G = f.source;
  const H = f.target;
  const K = f.witnesses.kernelSubgroup;
  const Im = f.witnesses.imageSubgroup;

  // Kernels are normal (mathematical fact); we can double-check computationally:
  if (!isNormal(G, K)) {
    throw new Error("Kernel is expected to be normal in G, but isNormal(G,ker f) returned false.");
  }

  // Domain: quotient G/K, codomain: Im ⊆ H
  const Q = quotientGroup(G, K);

  // φ([g]) = f(g). We'll implement it by using the representative.
  const to: GroupHom<Coset<A>, B> = {
    name: "φ",
    source: Q,
    target: Im,
    map: (c: Coset<A>) => f.map(c.rep) // well-defined because c.rep differs by n∈K ⇒ f(c.rep n)=f(c.rep)
  };

  // ψ: Im → G/K is the inverse on the nose: pick any g with f(g)=h and send to [g].
  // Since Im is small/finite, we can choose canonical g per image element.
  // Build a lookup representative g for each h∈Im.
  const eqH = H.eq ?? eqDefault<B>;
  const chooseRep = new Map<B, A>();
  for (const g of G.elems) {
    const h = f.map(g);
    if (Im.elems.some(x => eqH(x,h)) && ![...chooseRep.keys()].some(x => eqH(x,h))) {
      chooseRep.set(h, g);
    }
  }
  const from: GroupHom<B, Coset<A>> = {
    name: "ψ",
    source: Im,
    target: Q,
    map: (h: B) => {
      // find chosen preimage; Im elements are guaranteed to be in the map's range
      for (const [k,v] of chooseRep.entries()) {
        if (eqH(k,h)) return leftCoset(G, K, v);
      }
      // Fallback (shouldn't happen): search
      const g = G.elems.find(x => eqH(f.map(x), h));
      if (!g) throw new Error("ψ: element not in image?");
      return leftCoset(G, K, g);
    }
  };

  // Optionally compute inverse checks on finite carriers
  const eqQ = Q.eq!;
  const eqIm = Im.eq ?? eqDefault;

  const leftInverse =
    Q.elems.every(q => eqQ(from.map(to.map(q)), q));

  const rightInverse =
    Im.elems.every(h => eqIm(to.map(from.map(h)), h));

  return { source: Q, target: Im, to, from, leftInverse, rightInverse };
}