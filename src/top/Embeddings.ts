import type { Top } from "./Topology";

/** Inclusion map i: S -> X for S ⊆ X (carrier-only; topology handled via subspace). */
export function inclusion<X>(eqX:(a:X,b:X)=>boolean, S: X[], _X: X[]): (s:X)=>X {
  // sanity: S ⊆ X
  for (const s of S) if (!_X.some(x => eqX(s,x))) throw new Error("inclusion: S not subset of X");
  return (s:X)=> s;
}

/** Pointwise equality on maps over a finite carrier. */
export function mapsEqual<A,B>(eqB:(b:B,c:B)=>boolean, Z:A[], f:(a:A)=>B, g:(a:A)=>B): boolean {
  return Z.every(z => eqB(f(z), g(z)));
}