import { FiniteGroup } from "./core";
import { Hom, kernel, image, quotientCosets, phiToImage } from "./hom";

// Builds the φ map on cosets and checks:
//  - well-definedness (by constancy check per coset)
//  - homomorphism law on quotient representatives
//  - bijection between G/ker(f) and im(f)
export function firstIsoWitness<G, H>(f: Hom<G, H>) {
  const G = f.src, H = f.dst;
  const K = kernel(f);
  const cosets = quotientCosets(G, K);
  const img = image(f);

  // 1) Well-defined on each coset (phiToImage throws if not)
  const phiVals = cosets.map(C => phiToImage(f, K, C));

  // 2) Surjectivity onto im(f): every image element is hit
  const surj = img.every(h => phiVals.some(v => H.eq(v, h)));

  // 3) Injectivity: distinct cosets map to distinct image elements
  const inj = cosets.every((C, i) =>
    cosets.every((D, j) => i === j || !H.eq(phiVals[i]!, phiVals[j]!))
  );

  // 4) Homomorphism on quotient:
  // pick representatives g∈C, h∈D and check φ([g][h])=φ([gh]).
  let homo = true;
  for (let i = 0; i < cosets.length && homo; i++) {
    for (let j = 0; j < cosets.length && homo; j++) {
      const g = cosets[i]![0]!, h = cosets[j]![0]!;
      const gh = G.op(g, h);
      // find coset containing gh
      const k = cosets.findIndex(C => C.some(x => G.eq(x, gh)));
      if (k < 0) throw new Error("internal: missing product coset");
      const lhs = H.op(phiToImage(f, K, cosets[i]!), phiToImage(f, K, cosets[j]!));
      const rhs = phiToImage(f, K, cosets[k]!);
      if (!H.eq(lhs, rhs)) homo = false;
    }
  }

  const iso = inj && surj && homo;
  return { cosets, img, inj, surj, homo, iso };
}