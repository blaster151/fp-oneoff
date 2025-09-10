// Traceability: Smith §2.9(c–d) — trivial, finite, restricted categories of groups.
import { EnhancedGroup } from "../../algebra/group/EnhancedGroup";
import { createEnhancedHom as mkHom } from "../../algebra/group/Hom";
import type { GroupHom as EnhancedGroupHom } from "../../algebra/group/Hom";
import { Category } from "../core/Category";
import { GroupCategory } from "./GroupCategory";
import { Functor } from "../core/Category";
import { Grp, GrpObj, GrpHom, asGrpObj } from "./Grp";

export function oneObjectCategory<A>(G: EnhancedGroup<A>): Category<EnhancedGroup<A>, EnhancedGroupHom<A,A>> {
  const id: EnhancedGroupHom<A,A> = GroupCategory.id(G);
  return {
    objects: [G],
    morphisms: [id],
    compose: (f,g) => { 
      if (f === id && g === id) return id; 
      throw new Error("no composition allowed in one-object category"); 
    },
    id: () => id,
    eqMor: (f, g) => f === g
  };
}

// Example: category of groups with only identities
export function identitiesOnlyCategory<A>(Gs: EnhancedGroup<A>[]): Category<EnhancedGroup<A>, EnhancedGroupHom<A,A>> {
  const morphisms = Gs.map(G => GroupCategory.id(G));
  return {
    objects: Gs,
    morphisms,
    compose: (f,g) => {
      if (f.src === g.dst) return f;
      throw new Error("bad composition in identities-only category");
    },
    id: G => GroupCategory.id(G),
    eqMor: (f, g) => f === g
  };
}

// Helper functions for isomorphism detection
function* candidateFns<A, B>(domainElems: A[], codomainElems: B[]): Generator<(a: A) => B> {
  if (domainElems.length !== codomainElems.length) return; // can't be bijective
  
  function* permutations<T>(arr: T[]): Generator<T[]> {
    if (arr.length <= 1) { yield arr; return; }
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of permutations(rest)) yield [arr[i]!, ...perm];
    }
  }
  
  for (const perm of permutations(codomainElems)) {
    const mapping = new Map<A, B>();
    domainElems.forEach((a, i) => mapping.set(a, perm[i]!));
    yield (a: A) => mapping.get(a)!;
  }
}

function isIso<A, B>(G: EnhancedGroup<A>, H: EnhancedGroup<B>, f: (a: A) => B): boolean {
  if (!G.elems || !H.elems) return false; // only works for finite groups
  if (G.elems.length !== H.elems.length) return false;
  
  // homomorphism law
  for (const a of G.elems) for (const b of G.elems) {
    const lhs = f(G.op(a, b));
    const rhs = H.op(f(a), f(b));
    if (!H.eq(lhs, rhs)) return false;
  }
  // identity preservation
  if (!H.eq(f(G.id), H.id)) return false; // was G.e / H.e

  return true;
}

// Finite groups + isomorphisms only
export function finiteIsomorphismCategory(
  maxOrder: number, 
  groups: EnhancedGroup<any>[]
): Category<EnhancedGroup<any>, EnhancedGroupHom<any, any>> {
  const objs = groups.filter(G => G.elems && G.elems.length <= maxOrder);
  const isos: EnhancedGroupHom<any, any>[] = [];
  
  for (const G of objs) {
    for (const H of objs) {
      if (!G.elems || !H.elems) continue;

      if (G === H) { // identity
        isos.push(GroupCategory.id(G));
        continue;
      }
      for (const f of candidateFns([...G.elems], [...H.elems])) {
        if (isIso(G, H, f)) { isos.push(mkHom(G, H, f)); break; }
      }
    }
  }
  
  return {
    objects: objs,
    morphisms: isos,
    compose: (g, f) => {
      if (f.dst !== g.src) throw new Error("incompatible morphisms for composition");
      return mkHom(f.src, g.dst, (a: any) => g.map(f.map(a))); // was run
    },
    id: G => GroupCategory.id(G),
    eqMor: (f, g) => GroupCategory.eqMor!(f, g)
  };
}

// Finite groups + all homomorphisms
export function finiteFullCategory(
  maxOrder: number,
  groups: EnhancedGroup<any>[]
): Category<EnhancedGroup<any>, EnhancedGroupHom<any, any>> {
  const objs = groups.filter(G => G.elems && G.elems.length <= maxOrder);
  const homs: EnhancedGroupHom<any, any>[] = [];
  
  for (const G of objs) {
    for (const H of objs) {
      if (!G.elems || !H.elems) continue;

      if (G === H) {
        homs.push(GroupCategory.id(G));
      }
      if (G !== H && G.elems.length <= H.elems.length) {
        // trivial hom: everything maps to identity
        homs.push(mkHom(G, H, (_: any) => H.id)); // was H.e
      }
    }
  }
  
  return {
    objects: objs,
    morphisms: homs,
    compose: (g, f) => {
      if (f.dst !== g.src) throw new Error("incompatible morphisms for composition");
      return mkHom(f.src, g.dst, (a: any) => g.map(f.map(a))); // was run
    },
    id: G => GroupCategory.id(G),
    eqMor: (f, g) => GroupCategory.eqMor!(f, g)
  };
}

// Inclusion functors from subcategories to the mega-category Grp
// Note: These are commented out due to type compatibility issues between EnhancedGroup and FiniteGroup
// They would need to be reimplemented when the type systems are aligned

// // Inclusion: identities-only subcategory  ↪  Grp
// export function includeIdentitiesOnly(): Functor<any, any, GrpObj, GrpHom> {
//   return {
//     source: identitiesOnlyCategory([]), // placeholder - would need actual groups
//     target: Grp,
//     onObj: asGrpObj,
//     onMor: (f) => f as unknown as GrpHom
//   };
// }

// // Inclusion: finite groups + all homs  ↪  Grp
// export function includeFiniteAllHoms(fin: ReturnType<typeof finiteFullCategory>):
//   Functor<any, any, GrpObj, GrpHom> {
//   return {
//     source: fin,
//     target: Grp,
//     onObj: asGrpObj,
//     onMor: (f) => f as unknown as GrpHom
//   };
// }
