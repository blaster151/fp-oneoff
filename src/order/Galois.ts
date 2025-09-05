import { Poset } from "./Poset";

/** α ⊣ γ between posets X and Y: α:X→Y, γ:Y→X with α(x) ≤ y  ⇔  x ≤ γ(y). */
export type GaloisConnection<X,Y> = {
  X: Poset<X>;
  Y: Poset<Y>;
  alpha: (x:X)=>Y; // left adjoint (lower adjoint)
  gamma: (y:Y)=>X; // right adjoint (upper adjoint)
};

export function isGalois<X,Y>(G: GaloisConnection<X,Y>): boolean {
  const { X, Y, alpha, gamma } = G;
  for (const x of X.elems) for (const y of Y.elems) {
    const lhs = Y.leq(alpha(x), y);
    const rhs = X.leq(x, gamma(y));
    if (lhs !== rhs) return false;
  }
  return true;
}

/** Closure operators derived from a Galois connection. */
export function closureOnX<X,Y>(G: GaloisConnection<X,Y>): (x:X)=>X {
  const { alpha, gamma } = G; return (x:X)=> gamma(alpha(x));
}
export function kernelOnY<X,Y>(G: GaloisConnection<X,Y>): (y:Y)=>Y {
  const { alpha, gamma } = G; return (y:Y)=> alpha(gamma(y));
}