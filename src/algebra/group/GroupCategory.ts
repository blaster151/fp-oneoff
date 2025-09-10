// GroupCategory.ts
// The category of groups: objects are groups, morphisms are group homomorphisms
// This implements the Category interface to verify that group homomorphisms
// form a proper category with composition and identity laws.

import { Category } from "../../category/core/Category";
import { GroupHom, compose, hom, analyzeHom } from "./Hom";
import { FiniteGroup, Cyclic } from "./Group";

/** The category of groups: objects are finite groups, morphisms are group homomorphisms */
export const GroupCategory: Category<FiniteGroup<any>, GroupHom<unknown, unknown, any, any>> = {
  // Identity morphism for each group
  id: <A>(G: FiniteGroup<A>): GroupHom<unknown, unknown, A, A> => {
    return hom(G, G, (a: A) => a, `id_${G.name || 'G'}`);
  },

  // Composition of group homomorphisms
  compose: <A, B, C>(
    g: GroupHom<unknown, unknown, B, C>,
    f: GroupHom<unknown, unknown, A, B>
  ): GroupHom<unknown, unknown, A, C> => {
    const composed = compose(g, f);
    return analyzeHom(composed);
  },

  // Equality of morphisms (pointwise equality on finite domains)
  eqMor: <A, B>(
    f: GroupHom<unknown, unknown, A, B>,
    g: GroupHom<unknown, unknown, A, B>
  ): boolean => {
    if (f.source !== g.source || f.target !== g.target) return false;
    
    const eqB = f.target.eq ?? ((x: B, y: B) => x === y);
    
    // Check pointwise equality on all elements of the source group
    for (const a of f.source.elems) {
      if (!eqB(f.map(a), g.map(a))) return false;
    }
    return true;
  }
};

/** Helper function to create a group homomorphism with automatic analysis */
export function mkGroupHom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  map: (a: A) => B,
  name?: string
): GroupHom<unknown, unknown, A, B> {
  return hom(source, target, map, name);
}

/** Verify that the group category satisfies the category axioms */
export function verifyGroupCategoryLaws(): {
  leftIdentity: boolean;
  rightIdentity: boolean;
  associativity: boolean;
} {
  // We'll test with small cyclic groups to avoid combinatorial explosion
  const Z2 = Cyclic(2);
  const Z3 = Cyclic(3);
  const Z4 = Cyclic(4);

  // Create some test homomorphisms
  const idZ2 = GroupCategory.id(Z2);
  const idZ3 = GroupCategory.id(Z3);
  const idZ4 = GroupCategory.id(Z4);

  // Test homomorphism: Z2 -> Z3 (trivial map)
  const f = mkGroupHom(Z2, Z3, _ => 0, "trivial");
  
  // Test homomorphism: Z3 -> Z4 (mod 2 map)
  const g = mkGroupHom(Z3, Z4, (x: number) => x % 2, "mod2");

  // Test left identity: id ∘ f = f
  const leftId = GroupCategory.compose(idZ3, f);
  const leftIdentity = GroupCategory.eqMor!(leftId, f);

  // Test right identity: f ∘ id = f  
  const rightId = GroupCategory.compose(f, idZ2);
  const rightIdentity = GroupCategory.eqMor!(rightId, f);

  // Test associativity: (h ∘ g) ∘ f = h ∘ (g ∘ f)
  // We need a third homomorphism h: Z4 -> Z2
  const h = mkGroupHom(Z4, Z2, (x: number) => x % 2, "mod2");
  
  const leftAssoc = GroupCategory.compose(GroupCategory.compose(h, g), f);
  const rightAssoc = GroupCategory.compose(h, GroupCategory.compose(g, f));
  const associativity = GroupCategory.eqMor!(leftAssoc, rightAssoc);

  return {
    leftIdentity,
    rightIdentity,
    associativity
  };
}
