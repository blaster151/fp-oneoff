import { describe, it, expect } from "vitest";

// Adjust import paths to match your repo layout:
import { FinGroup, FinGroupMor, makeFinGroup } from "../FinGrp";
import { firstIso, kernel, image } from "../first_iso";
import { pullback, pushout } from "../limits";
import { isInjective, isSurjective, isIso, isMono, isEpi } from "../recognition";
import { Grp } from "../GrpCategory";

/** ---------- Tiny concrete groups ---------- **/

// Z2 = {0,1} under +
const Z2: FinGroup<number> = makeFinGroup({
  carrier: [0,1],
  e: 0,
  op: (a,b) => (a + b) % 2,
  inv: a => a % 2,
  eq: (a,b) => a === b
});

// Z4 = {0,1,2,3} under +
const Z4: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3],
  e: 0,
  op: (a,b) => (a + b) % 4,
  inv: a => (4 - (a % 4)) % 4,
  eq: (a,b) => a === b
});

// Z8 = {0..7} under +
const Z8: FinGroup<number> = makeFinGroup({
  carrier: [0,1,2,3,4,5,6,7],
  e: 0,
  op: (a,b) => (a + b) % 8,
  inv: a => (8 - (a % 8)) % 8,
  eq: (a,b) => a === b
});

// f: Z8 -> Z4  given by mod 4
const f_Z8_to_Z4: FinGroupMor<number, number> = {
  src: Z8, dst: Z4,
  run: (x) => x % 4
};

// g: Z4 -> Z2  given by mod 2
const g_Z4_to_Z2: FinGroupMor<number, number> = {
  src: Z4, dst: Z2,
  run: (x) => x % 2
};

// h = g ∘ f : Z8 -> Z2 (mod 2)
const h_Z8_to_Z2: FinGroupMor<number, number> = {
  src: Z8, dst: Z2,
  run: (x) => x % 2
};

/** ---------- First Isomorphism Theorem checks ---------- **/

describe("First Isomorphism Theorem (finite witness)", () => {
  it("ker(f) and im(f) computed correctly for f: Z8→Z4", () => {
    const ker = kernel(Z8, Z4, f_Z8_to_Z4);
    const img = image(Z8, f_Z8_to_Z4);
    // ker should be {0,4}
    expect(ker.sort()).toEqual([0,4]);
    // im should be all of Z4
    expect(img.sort()).toEqual([0,1,2,3]);
  });

  it("G/ker(f) ≅ im(f) for f: Z8→Z4", () => {
    const { cosets, img, phi } = firstIso(Z8, Z4, f_Z8_to_Z4);
    // Cosets of <4> in Z8: [ {0,4}, {1,5}, {2,6}, {3,7} ]
    // We only check cardinalities and image hits to avoid ordering dependence.
    expect(cosets.length).toBe(4);
    // φ sends each coset to a value in im(f)
    cosets.forEach(c => {
      const b = phi(c);
      expect(img.includes(b)).toBe(true);
    });
    // φ is bijective in this case: 4 cosets ↔ 4 image elements
    const hit = new Set(cosets.map(c => phi(c)));
    expect(hit.size).toBe(img.length);
  });
});

/** ---------- (Co)limits: pullback, pushout (small diagrams) ---------- **/

describe("Pullback and Pushout in Grp (finite sketches)", () => {
  it("pullback of g:Z4→Z2 and f:Z8→Z2 yields pairs with equal parity", () => {
    const PB = pullback(Z4, Z8, Z2, g_Z4_to_Z2, h_Z8_to_Z2);
    // Check every pair [a,b] satisfies g(a) == h(b)
    PB.forEach(([a,b]) => {
      expect(g_Z4_to_Z2.run(a)).toBe(h_Z8_to_Z2.run(b));
    });
    // Cardinality sanity: exactly half of 4×8 = 32 pairs → 16 pairs
    expect(PB.length).toBe(16);
  });

  it("pushout of C→A and C→B (amalgamation) at least builds raw pairs", () => {
    // Here we amalgamate Z2 into Z4 and Z4 via g and identity:
    const idZ4: FinGroupMor<number, number> = { src: Z4, dst: Z4, run: x => x };
    // WARNING: our pushout() is a naive placeholder returning A×B representatives
    const PO = pushout(Z4, Z4, Z2, g_Z4_to_Z2 /* C→A */, g_Z4_to_Z2 /* C→B */);
    // For now, just ensure we built "something" of the right ambient size.
    expect(PO.pairs.length).toBe(Z4.carrier.length * Z4.carrier.length);
    // TODO: replace with a true quotient-by-congruence implementation and universal property checks.
  });
});

/** ---------- Recognition helpers: iso/mono/epi on finite groups ---------- **/

describe("Recognition helpers on finite groups", () => {
  it("mod 4 : Z8→Z4 is surjective and not injective", () => {
    expect(isSurjective(Z8, Z4, f_Z8_to_Z4)).toBe(true);
    expect(isInjective(Z8, f_Z8_to_Z4)).toBe(false);
    expect(isEpi(Z8, Z4, f_Z8_to_Z4)).toBe(true);
    expect(isMono(Z8, f_Z8_to_Z4)).toBe(false);
    expect(isIso(Z8, Z4, f_Z8_to_Z4)).toBe(false);
  });

  it("identity on Z4 is an isomorphism (bijective)", () => {
    const idZ4: FinGroupMor<number, number> = { src: Z4, dst: Z4, run: x => x };
    expect(isInjective(Z4, idZ4)).toBe(true);
    expect(isSurjective(Z4, Z4, idZ4)).toBe(true);
    expect(isIso(Z4, Z4, idZ4)).toBe(true);
  });
});

/** ---------- Categorical Laws in Grp (bridging to Smith's "mega-category") ---------- **/

describe("Grp as a Category (plural idiom realized)", () => {
  it("categorical identity laws hold", () => {
    const idZ4 = Grp.id(Z4);
    const idZ2 = Grp.id(Z2);
    
    // Test that identity morphisms work correctly
    expect(idZ4.src).toBe(Z4);
    expect(idZ4.dst).toBe(Z4);
    expect(idZ4.run(0)).toBe(0);
    expect(idZ4.run(1)).toBe(1);
    
    expect(idZ2.src).toBe(Z2);
    expect(idZ2.dst).toBe(Z2);
    expect(idZ2.run(0)).toBe(0);
    expect(idZ2.run(1)).toBe(1);
  });
  
  it("categorical composition works correctly", () => {
    // Test basic composition: g ∘ f where f: Z8→Z4, g: Z4→Z2
    const f = f_Z8_to_Z4; // Z8 → Z4
    const g = g_Z4_to_Z2; // Z4 → Z2
    
    // Compose g ∘ f
    const composed = Grp.compose(g, f);
    
    // Should be a morphism Z8 → Z2
    expect(composed.src).toBe(Z8);
    expect(composed.dst).toBe(Z2);
    
    // Test on sample elements
    expect(composed.run(0)).toBe(0); // 0 mod 4 = 0, 0 mod 2 = 0
    expect(composed.run(1)).toBe(1); // 1 mod 4 = 1, 1 mod 2 = 1
    expect(composed.run(4)).toBe(0); // 4 mod 4 = 0, 0 mod 2 = 0
    expect(composed.run(5)).toBe(1); // 5 mod 4 = 1, 1 mod 2 = 1
  });
  
  it("recognition helpers work within Grp categorical context", () => {
    // In Grp, mono ⇔ injective, epi ⇔ surjective (finite case)
    const idZ4 = Grp.id(Z4);
    
    expect(isInjective(Z4, idZ4)).toBe(true);
    expect(isSurjective(Z4, Z4, idZ4)).toBe(true);
    expect(isIso(Z4, Z4, idZ4)).toBe(true);
    
    // This demonstrates: "in Grp, identity morphisms are isomorphisms"
    expect(isMono(Z4, idZ4)).toBe(true);
    expect(isEpi(Z4, Z4, idZ4)).toBe(true);
  });
  
  it("First Iso Theorem as factorization property in Grp", () => {
    // The theorem states that every morphism f in Grp factors as:
    // G --epi--> G/ker(f) --iso--> im(f) --mono--> H
    const { cosets, img, phi } = firstIso(Z8, Z4, f_Z8_to_Z4);
    
    // Verify the factorization exists in our categorical setting
    expect(cosets.length).toBe(img.length); // bijection witness
    
    // Key insight: in the category Grp, every morphism admits epi-mono factorization
    // This is a categorical universal property, not just a group-theoretic accident
    const phiValues = cosets.map(c => phi(c));
    const uniqueValues = new Set(phiValues);
    expect(uniqueValues.size).toBe(img.length); // phi is bijective
  });
  
  it("Grp as 'mega-category' - plural idiom in action", () => {
    // Smith's "mega-category" concept: Grp contains "all groups, all homomorphisms"
    // In our finite implementation, we have a concrete instance of this idea
    
    // We can compose any morphisms in Grp
    const morphisms = [
      Grp.id(Z2),
      Grp.id(Z4), 
      Grp.id(Z8),
      f_Z8_to_Z4,
      g_Z4_to_Z2,
      h_Z8_to_Z2
    ];
    
    // Each morphism is a valid element of Grp
    morphisms.forEach(m => {
      expect(m.src).toBeDefined();
      expect(m.dst).toBeDefined();
      expect(typeof m.run).toBe('function');
    });
    
    // We can compose them using Grp's composition
    const composed = Grp.compose(g_Z4_to_Z2, f_Z8_to_Z4);
    expect(composed.src).toBe(Z8);
    expect(composed.dst).toBe(Z2);
    
    // This demonstrates: "some groups, some homomorphisms" is enough
    // to form a workable category in code - no need for "the set of all groups"
  });
});