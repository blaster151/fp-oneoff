import type { Group } from "./Group";

export function mkFiniteGroup<A>(opts: {
  eq: (x: A, y: A) => boolean;
  op: (x: A, y: A) => A;
  id: A;
  inv: (x: A) => A;
  elements: readonly A[];
}): Group<A> {
  return { ...opts };
}

// The unique group of order 2: elements {e, j} with j*j = e
export type TwoElt = "e" | "j";
export const Z2: Group<TwoElt> = mkFiniteGroup<TwoElt>({
  eq: (x, y) => x === y,
  op: (x, y) => (x === "j") !== (y === "j") ? "j" : "e",
  id: "e",
  inv: x => x, // self-inverse
  elements: ["e", "j"],
});