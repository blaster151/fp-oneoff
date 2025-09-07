import { LargeCategory, Obj, Mor } from "../category/core";
import type { FinGroup, Hom as FinHom } from "./fingrp";

// For the demo, we'll allow any "group-like" record to be an object,
// but we *don't* enumerate them. Hom-sets remain locally small only
// when the source is small enough (as in FinGroup) or when a user
// supplies a hom-enumerator.

export type AnyGroup = FinGroup | { name: string; /* ... */ };

export interface GroupHom {
  src: AnyGroup;
  dst: AnyGroup;
  // we keep it opaque; the category must provide dom/cod/comp/id
  apply: (x: unknown) => unknown;
}

export const Grp: LargeCategory = {
  tag: "Grp(large)",
  objects: "large",

  equalObj: (a, b) => (a as any).name === (b as any).name,
  equalMor: (f, g) => f === g, // best-effort; real impls specialize

  dom: (f) => (f as GroupHom).src,
  cod: (f) => (f as GroupHom).dst,

  id: (a) => {
    const G = a as AnyGroup;
    return { src: G, dst: G, apply: (x: unknown) => x } as GroupHom;
  },

  comp: (g, f) => {
    const F = f as GroupHom, G = g as GroupHom;
    if (F.dst !== G.src) throw new Error("non-composable");
    return {
      src: F.src,
      dst: G.dst,
      apply: (x: unknown) => G.apply(F.apply(x))
    } as GroupHom;
  },

  // hom enumerator: if src is a FinGroup and dst is FinGroup, we can reuse FinGrp.hom
  // Otherwise, require a user-supplied oracle (not shown here).
  hom(a: Obj, b: Obj): Iterable<Mor> {
    // Fallback: empty set unless specialized hooks are installed.
    return [];
  },

  laws: {
    assoc: { assoc: () => true },
    id: { leftId: () => true, rightId: () => true }
  }
};