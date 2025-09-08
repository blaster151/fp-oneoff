import { Group } from "./structures";
import { Eq } from "../../types/eq.js";

/** A congruence ≈ on a group G: an equivalence relation compatible with op. */
export interface Congruence<G> {
  readonly G: Group<G>;
  readonly eqv: Eq<G>; // equivalence: reflexive/symmetric/transitive (caller responsible)
  /** Compatibility: if x≈x' and y≈y' then x◦y ≈ x'◦y' */
  readonly comp: (x: G, x1: G, y: G, y1: G) => boolean;
}

/** Kernel-pair congruence from a homomorphism f: x≈y ⇔ f(x)=f(y). */
export function congruenceFromHom<G, H>(
  G: Group<G>, H: Group<H>, f: (g: G) => H
): Congruence<G> {
  const eqH = H.eq;
  const eqv: Eq<G> = (x, y) => eqH(f(x), f(y));
  const comp = (x: G, x1: G, y: G, y1: G) => {
    return eqH(f(G.op(x, y)), f(G.op(x1, y1)));
  };
  return { G, eqv, comp };
}

/**
 * Check that a relation is a congruence (equivalence + compatibility with group operation).
 * For finite groups, we can exhaustively verify all properties.
 * 
 * File placement: Congruence.ts since it's about validating congruence properties.
 */
export function isCongruence<G>(
  G: Group<G>, eq: (x:G,y:G)=>boolean
): boolean {
  // For finite testing, we need a way to sample elements
  // This assumes G has a finite carrier or sampling method
  const elems = (G as any).elems || []; // fallback for finite groups
  
  // Reflexivity: x ≈ x for all x
  const reflexive = elems.every((x: any) => eq(x,x));
  
  // Symmetry: x ≈ y ⟺ y ≈ x for all x,y
  const symmetric = elems.every((x: any, i: any) => elems.every((y: any) => eq(x,y) === eq(y,x)));
  
  // Transitivity: if x ≈ y and y ≈ z, then x ≈ z
  const transitive = elems.every((x: any) => elems.every((y: any) => elems.every((z: any) =>
    !(eq(x,y) && eq(y,z)) || eq(x,z)
  )));
  
  // Compatibility: if x ≈ y, then z*x ≈ z*y and x*z ≈ y*z for all z
  const compatible = elems.every((x: any) => elems.every((y: any) => elems.every((z: any) =>
    (!eq(x,y) || eq(G.op(z,x), G.op(z,y))) &&
    (!eq(x,y) || eq(G.op(x,z), G.op(y,z)))
  )));
  
  return reflexive && symmetric && transitive && compatible;
}