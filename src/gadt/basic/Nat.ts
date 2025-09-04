/** Tiny Peano naturals for indexing BFin. */

export type Nat = { tag: "Z" } | { tag: "S"; prev: Nat };
export const Z: Nat = { tag: "Z" };
export const S = (n: Nat): Nat => ({ tag: "S", prev: n });

export const isZ  = (n: Nat): n is { tag: "Z" } => n.tag === "Z";
export const isS  = (n: Nat): n is { tag: "S"; prev: Nat } => n.tag === "S";
export const pred = (n: Nat): Nat => (isS(n) ? n.prev : n);

export const natEq = (a: Nat, b: Nat): boolean =>
  (a.tag === "Z" && b.tag === "Z") || (a.tag === "S" && b.tag === "S" && natEq(a.prev, b.prev));

export const fromNumber = (k: number): Nat => (k <= 0 ? Z : S(fromNumber(k - 1)));
export const toNumber   = (n: Nat): number => (isZ(n) ? 0 : 1 + toNumber(n.prev));