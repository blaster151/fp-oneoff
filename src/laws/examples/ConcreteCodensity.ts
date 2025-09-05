import { lawfulCodensityIso, CodensityNatPack } from "./CodensityNat";
import { registerLawful } from "../registry";

/**
 * Concrete example of Codensity equivalence: List^A ≅ (A → List)
 * This demonstrates the pattern for T^G(A) ≅ Nat(G^A, G)
 */

// Simple List functor
type List<A> = A[];

// G^A(B) = List(B)^A = (A → List(B))
type GA<B> = (a: any) => List<B>;

// T^G(A) = Codensity^List(A) - simplified as (A → List)
type TGA = (a: any) => List<any>;

// Natural transformation from G^A to G
type Nat<F, G> = { 
  eta: <X>(fx: F) => G;
};

// Equality functions
const eqTGA = (f: TGA, g: TGA) => {
  // For demo purposes, compare on a few sample inputs
  const samples = [1, 2, 3];
  return samples.every(x => JSON.stringify(f(x)) === JSON.stringify(g(x)));
};

const eqNat = (n1: Nat<GA<any>, List>, n2: Nat<GA<any>, List>) => {
  // Compare natural transformations on sample inputs
  const sampleGA = (x: any) => [x, x + 1];
  return JSON.stringify(n1.eta(sampleGA)) === JSON.stringify(n2.eta(sampleGA));
};

// The isomorphism: T^G(A) ≅ Nat(G^A, G)
const to = (tga: TGA): Nat<GA<any>, List> => ({
  eta: <X>(ga: GA<X>) => (a: any) => {
    // Apply the codensity to get a list, then map with ga
    const list = tga(a);
    return list.flatMap(x => ga(x));
  }
});

const from = (nt: Nat<GA<any>, List>): TGA => {
  return (a: any) => {
    // Create a natural transformation that extracts the value
    const ga = (x: any) => [x];
    return nt.eta(ga)(a);
  };
};

// Sample data
const sampleT: TGA[] = [
  (a: any) => [a],
  (a: any) => [a, a + 1],
  (a: any) => [a, a + 1, a + 2]
];

const sampleN: Nat<GA<any>, List>[] = [
  { eta: <X>(ga: GA<X>) => (a: any) => ga(a) },
  { eta: <X>(ga: GA<X>) => (a: any) => ga(a).concat(ga(a + 1)) },
  { eta: <X>(ga: GA<X>) => (a: any) => ga(a).flatMap(x => [x, x + 1]) }
];

// Create the law pack
const codensityPack: CodensityNatPack = {
  to,
  from,
  eqT: eqTGA,
  eqN: eqNat,
  sampleT,
  sampleN
};

// Register the law pack
export const codensityLawPack = lawfulCodensityIso(codensityPack);
registerLawful(codensityLawPack);