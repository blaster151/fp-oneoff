import type { Top } from "./Topology";

/** Sierpinski space: carrier {0,1} with opens ∅, {1}, {0,1}. */
export function sierpinski(): Top<number> {
  const X = [0,1];
  return { carrier: X, opens: [[], [1], X] };
}