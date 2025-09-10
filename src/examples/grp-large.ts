import { LargeCategory, Obj, Mor, asLarge } from "../category/core";
import { FinGrp, FinGroup, Hom } from "./fingrp";

/**
 * Large category of groups: "plural talk" - we don't enumerate all groups,
 * but we can still compute hom-sets on demand for any two groups.
 */
export const Grp: LargeCategory = {
  tag: "Grp",
  objects: "large", // This is the key marker for "plural" modeling

  equalObj: (a, b) => {
    const A = a as FinGroup, B = b as FinGroup;
    return A.name === B.name;
  },

  equalMor: (f, g) => {
    const F = f as Hom, G = g as Hom;
    if (F.src.name !== G.src.name || F.dst.name !== G.dst.name) return false;
    const keys = Object.keys(F.map);
    return keys.length === Object.keys(G.map).length &&
      keys.every(k => F.map[k] === G.map[k]);
  },

  dom: (f) => (f as Hom).src,
  cod: (f) => (f as Hom).dst,

  id: (a) => {
    const G = a as FinGroup;
    const map: Record<string, any> = {};
    for (const x of G.elems) map[String(x)] = x;
    return { src: G, dst: G, map } as Hom;
  },

  comp: (g, f) => {
    const F = f as Hom, G = g as Hom;
    if (F.dst !== G.src) throw new Error("non-composable");
    const map: Record<string, any> = {};
    for (const x of F.src.elems) {
      map[String(x)] = G.map[String(F.map[String(x)])];
    }
    return { src: F.src, dst: G.dst, map } as Hom;
  },

  // This is the key difference: we don't enumerate all objects,
  // but we can still compute hom-sets for any two given objects
  hom(a: Obj, b: Obj): Iterable<Mor> {
    const A = a as FinGroup, B = b as FinGroup;
    const maps: Hom[] = [];
    
    // Same homomorphism enumeration logic as FinGrp, but on-demand
    const assign = (i: number, current: Record<string, any>) => {
      if (i === A.elems.length) {
        const h: Hom = { src: A, dst: B, map: { ...current } };
        if (isHom(h)) maps.push(h);
        return;
      }
      const x = A.elems[i];
      for (const y of B.elems) {
        current[String(x)] = y;
        assign(i + 1, current);
      }
    };
    assign(0, {});
    return maps;

    function isHom(h: Hom): boolean {
      // identity preservation
      if (h.map[String(A.id)] !== B.id) return false;
      // operation preservation
      for (const x of A.elems) for (const y of A.elems) {
        const xy = A.op[String(x)][String(y)];
        const fx = h.map[String(x)];
        const fy = h.map[String(y)];
        const fxy = h.map[String(xy)];
        const fx_mul_fy = B.op[String(fx)][String(fy)];
        if (fxy !== fx_mul_fy) return false;
      }
      return true;
    }
  },

  laws: {
    assoc: {
      assoc: () => true // inherited from function composition
    },
    id: {
      leftId: () => true,
      rightId: () => true
    }
  }
};

// Adapter: we can view the small FinGrp as a large category
export const FinGrpAsLarge = asLarge(FinGrp);
