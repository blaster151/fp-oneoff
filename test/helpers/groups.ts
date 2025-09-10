import { FiniteGroup } from "../../src/algebra/group/Group";
import { hom } from "../../src/algebra/group/Hom";
import type { GroupHom } from "../../src/algebra/group/Hom";

export function Zmod(n: number): FiniteGroup<number> {
  const elems = Array.from({ length: n }, (_, i) => i);
  
  return {
    elems,
    eq: (x, y) => x === y,
    op: (x, y) => (x + y) % n,
    id: 0,
    inv: (x) => x === 0 ? 0 : n - x,
    name: `Z${n}`
  };
}

export function groupHom<A, B>(
  G: FiniteGroup<A>, 
  H: FiniteGroup<B>, 
  f: (a: A) => B
): GroupHom<unknown, unknown, A, B> {
  return hom(G, H, f);
}