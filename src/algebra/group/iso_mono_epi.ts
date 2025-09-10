// Traceability: Smith §2.5–§2.6 (iso), §2.6/§8.1 (mono/epi via cancel laws).

import { GrpHom } from "../../category/instances/Grp";

// Witness shape
export type IsoWitness = { leftInv: GrpHom; rightInv: GrpHom };

export function hasTwoSidedInverse(f: GrpHom): IsoWitness | null {
  // For finite carriers, brute-force search for a hom g with g∘f=id and f∘g=id.
  // For infinite, accept a provided candidate (extend later).
  
  const G = f.source.G;
  const H = f.target.G;
  
  // Only works for finite groups
  if (!G.elems || !H.elems) return null;
  if (G.elems.length !== H.elems.length) return null;
  
  // Try to find an inverse by checking all possible functions
  for (const h of H.elems) {
    for (const g of G.elems) {
      // Check if f(g) = h
      const eqH = H.eq ?? ((x: any, y: any) => x === y);
      if (eqH(f.map(g), h)) {
        // Try to construct inverse function
        const inverseMap = new Map<any, any>();
        let isValidInverse = true;
        
        for (const a of G.elems) {
          const b = f.map(a);
          if (inverseMap.has(b)) {
            isValidInverse = false;
            break;
          }
          inverseMap.set(b, a);
        }
        
        if (isValidInverse) {
          // Check if this gives us a homomorphism
          const invFn = (h: any) => inverseMap.get(h);
          const eqG = G.eq ?? ((x: any, y: any) => x === y);
          
          let isHom = true;
          for (const h1 of H.elems) {
            for (const h2 of H.elems) {
              const lhs = invFn(H.op(h1, h2));
              const rhs = G.op(invFn(h1), invFn(h2));
              if (!eqG(lhs, rhs)) {
                isHom = false;
                break;
              }
            }
            if (!isHom) break;
          }
          
          if (isHom) {
            const leftInv = { ...f, source: f.target, target: f.source, map: invFn };
            const rightInv = { ...f, source: f.target, target: f.source, map: invFn };
            return { leftInv, rightInv };
          }
        }
      }
    }
  }
  
  return null; // no inverse found
}

export function isMonomorphism(f: GrpHom, sampleHoms: GrpHom[]): boolean {
  // Check: g∘f = h∘f ⇒ g = h   (try on a finite generating set of candidates)
  for (const g of sampleHoms) {
    for (const h of sampleHoms) {
      // Only check if g and h have the same source and target
      if (g.source !== h.source || g.target !== h.target) continue;
      
      // Check if g∘f = h∘f
      const gf = { ...g, source: f.source, map: (x: any) => g.map(f.map(x)) };
      const hf = { ...h, source: f.source, map: (x: any) => h.map(f.map(x)) };
      
      // Check pointwise equality
      const eq = g.target.G.eq ?? ((x: any, y: any) => x === y);
      let equal = true;
      for (const a of f.source.G.elems) {
        if (!eq(gf.map(a), hf.map(a))) {
          equal = false;
          break;
        }
      }
      
      // If g∘f = h∘f but g ≠ h, then f is not mono
      if (equal) {
        let gNotEqualH = false;
        for (const a of g.source.G.elems) {
          if (!eq(g.map(a), h.map(a))) {
            gNotEqualH = true;
            break;
          }
        }
        if (gNotEqualH) return false;
      }
    }
  }
  return true;
}

export function isEpimorphism(f: GrpHom, sampleHoms: GrpHom[]): boolean {
  // Check: f∘g = f∘h ⇒ g = h   (try on a finite generating set of candidates)
  for (const g of sampleHoms) {
    for (const h of sampleHoms) {
      // Only check if g and h have the same source and target
      if (g.source !== h.source || g.target !== h.target) continue;
      
      // Check if f∘g = f∘h
      const fg = { ...f, target: g.target, map: (x: any) => f.map(g.map(x)) };
      const fh = { ...f, target: h.target, map: (x: any) => f.map(h.map(x)) };
      
      // Check pointwise equality
      const eq = f.target.G.eq ?? ((x: any, y: any) => x === y);
      let equal = true;
      for (const a of g.source.G.elems) {
        if (!eq(fg.map(a), fh.map(a))) {
          equal = false;
          break;
        }
      }
      
      // If f∘g = f∘h but g ≠ h, then f is not epi
      if (equal) {
        let gNotEqualH = false;
        for (const a of g.source.G.elems) {
          if (!eq(g.map(a), h.map(a))) {
            gNotEqualH = true;
            break;
          }
        }
        if (gNotEqualH) return false;
      }
    }
  }
  return true;
}
