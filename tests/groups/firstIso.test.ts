import { Zn } from "../../src/algebra/groups/finite";
import { Hom } from "../../src/algebra/groups/hom";
import { firstIsoWitness } from "../../src/algebra/groups/firstIso";

// f: Z8 → Z4,  f(x)=x mod 4  (kernel = {0,4}, image = Z4)
test("First Iso: Z8 → Z4 by mod 4", () => {
  const G = Zn(8), H = Zn(4);
  const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 4 };
  const w = firstIsoWitness(f);
  expect(w.iso).toBe(true);
  // Z8 / {0,4} has 4 cosets: {0,4}, {1,5}, {2,6}, {3,7}
  // Image is all of Z4: {0,1,2,3}
  expect(w.img.length).toBe(4);
  expect(w.cosets.length).toBe(4);
});

// f: Z6 → Z3,  f(x)=x mod 3  (ker={0,3}, |quot|=3, im=Z3)
test("First Iso: Z6 → Z3 by mod 3", () => {
  const G = Zn(6), H = Zn(3);
  const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 3 };
  const w = firstIsoWitness(f);
  expect(w.iso).toBe(true);
  expect(w.img.length).toBe(3);
  expect(w.cosets.length).toBe(3);
});

// f: Z8 → Z2, f(x)=x mod 2 (ker={0,2,4,6}, quotient size 2, image Z2)
test("First Iso: Z8 → Z2 by mod 2", () => {
  const G = Zn(8), H = Zn(2);
  const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 2 };
  const w = firstIsoWitness(f);
  expect(w.iso).toBe(true);
  expect(w.img.length).toBe(2);
  expect(w.cosets.length).toBe(2);
});

// Demonstrate well-definedness checking: this should work without throwing
test("Well-definedness verification (plural idiom at work)", () => {
  const G = Zn(6), H = Zn(2);
  const f: Hom<number, number> = { src: G, dst: H, map: (x) => x % 2 };
  
  // This internally calls phiToImage on each coset, which throws if not well-defined
  expect(() => firstIsoWitness(f)).not.toThrow();
  
  const w = firstIsoWitness(f);
  
  // Verify the categorical content: every morphism in Grp admits epi-mono factorization
  expect(w.inj).toBe(true);  // φ is injective
  expect(w.surj).toBe(true); // φ is surjective  
  expect(w.homo).toBe(true); // φ is a homomorphism
  expect(w.iso).toBe(true);  // φ is an isomorphism
});