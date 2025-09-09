import { EnhancedGroup } from "../../src/algebra/group/EnhancedGroup";
import { createEnhancedHom as mkHom } from "../../src/algebra/group/Hom";
import type { GroupHom as EnhancedGroupHom } from "../../src/algebra/group/Hom";

export function Zmod(n: number): EnhancedGroup<number> {
  const elems = Array.from({ length: n }, (_, i) => i);
  
  return {
    carrier: "finite",
    elems,
    eq: (x, y) => x === y,
    op: (x, y) => (x + y) % n,
    e: 0,
    inv: (x) => x === 0 ? 0 : n - x,
    laws: {
      assoc: (a, b, c) => ((a + b) % n + c) % n === (a + (b + c) % n) % n,
      leftId: (a) => (0 + a) % n === a,
      rightId: (a) => (a + 0) % n === a,
      leftInv: (a) => ((a === 0 ? 0 : n - a) + a) % n === 0,
      rightInv: (a) => (a + (a === 0 ? 0 : n - a)) % n === 0,
    }
  };
}

export function groupHom<A, B>(
  G: EnhancedGroup<A>, 
  H: EnhancedGroup<B>, 
  f: (a: A) => B
): EnhancedGroupHom<A, B> {
  return mkHom(G, H, f);
}