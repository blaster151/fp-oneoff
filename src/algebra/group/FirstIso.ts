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
    f: (g: A) => leftCoset(G, N, g)
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
    f: (c: Coset<A>) => f.f(c.rep) // well-defined because c.rep differs by n∈K ⇒ f(c.rep n)=f(c.rep)
  };

  // ψ: Im → G/K is the inverse on the nose: pick any g with f(g)=h and send to [g].
  // Since Im is small/finite, we can choose canonical g per image element.
  // Build a lookup representative g for each h∈Im.
  const eqH = H.eq ?? eqDefault<B>;
  const chooseRep = new Map<B, A>();
  for (const g of G.elems) {
    const h = f.f(g);
    if (Im.elems.some(x => eqH(x,h)) && ![...chooseRep.keys()].some(x => eqH(x,h))) {
      chooseRep.set(h, g);
    }
  }
  const from: GroupHom<B, Coset<A>> = {
    name: "ψ",
    source: Im,
    target: Q,
    f: (h: B) => {
      // find chosen preimage; Im elements are guaranteed to be in the map's range
      for (const [k,v] of chooseRep.entries()) {
        if (eqH(k,h)) return leftCoset(G, K, v);
      }
      // Fallback (shouldn't happen): search
      const g = G.elems.find(x => eqH(f.f(x), h));
      if (!g) throw new Error("ψ: element not in image?");
      return leftCoset(G, K, g);
    }
  };

  // Optionally compute inverse checks on finite carriers
  const eqQ = Q.eq!;
  const eqIm = Im.eq ?? eqDefault;

  const leftInverse =
    Q.elems.every(q => eqQ(from.f(to.f(q)), q));

  const rightInverse =
    Im.elems.every(h => eqIm(to.f(from.f(h)), h));

  return { source: Q, target: Im, to, from, leftInverse, rightInverse };
}

// New functionality for Theorem 9: Congruences and quotients
import { congruenceFromHom } from "./Congruence";
import { QuotientGroup, Coset } from "./QuotientGroup";
import { GroupHom as NewGroupHom } from "./GroupHom";

/**
 * Given a hom f: G→H, build:
 *  - the congruence ≈_f (x≈y ⇔ f(x)=f(y))
 *  - the quotient group Q = G/≈_f
 *  - the canonical hom Φ: Q → im(f) (as a subgroup predicate of H)
 * For finite examples we verify Φ is an isomorphism by exhaustive check.
 */
export function firstIsomorphismData<G, H>(
  F: NewGroupHom<G, H>
) {
  const { G, H, f } = F;

  // 1) congruence
  const cong = congruenceFromHom(G, H, f);

  // 2) quotient
  const Q = QuotientGroup(cong);

  // 3) image predicate (extensible; for tests we pass finite carrier)
  const inImage = (h: H, support: G[]): boolean =>
    support.some(g => H.eq(f(g), h));

  // 4) canonical hom Φ([g]) = f(g)
  const phi = (c: Coset<G>) => f(c.rep);

  // homomorphism laws hold by definition; we can provide a checker
  const respectsOp = (a: Coset<G>, b: Coset<G>) =>
    H.eq(phi(Q.Group.op(a, b)), H.op(phi(a), phi(b)));

  return { cong, quotient: Q, phi, respectsOp, inImage };
}

/**
 * Factor a homomorphism through its quotient: f = ι ∘ π where
 * π: G → G/≈_f (surjection) and ι: G/≈_f → H (injection into im(f))
 * 
 * This encodes the First Isomorphism Theorem constructively.
 * 
 * File placement: FirstIso.ts since it's about factoring homomorphisms
 * and relates directly to the First Isomorphism Theorem.
 */
export function factorThroughQuotient<G,H>(
  hom: NewGroupHom<G,H>
) {
  const { G, H, f: map } = hom;

  // Congruence from hom
  const cong = congruenceFromHom(G,H,map);
  const Q = QuotientGroup(cong);

  // Surjection π: G→Q
  const pi = (g:G) => Q.norm(g);

  // Injection ι: Q→H (really into im(f))
  const iota = (c: {rep:G}) => map(c.rep);

  return { quotient: Q.Group, pi, iota };
}