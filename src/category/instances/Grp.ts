// Traceability: Smith §2.9 (Categories of groups) – "mega-category" of all groups.
// Depends on: src/algebra/group/Group.ts and src/category/core/Category.ts

import { FiniteGroup } from "../../algebra/group/Group";
import { GroupHom, hom, compose, analyzeHom } from "../../algebra/group/Hom";
import { Category } from "../core/Category";

// We wrap a FiniteGroup<A> in a nominal object so we can hold heterogeneous A's in one Category.
export type GrpObj = { tag: "GrpObj"; G: FiniteGroup<any> };

export type GrpHom = {
  source: GrpObj;
  target: GrpObj;
  map: (a: any) => any;
  name?: string;
  witnesses?: any;
};

// Helper to lift a concrete FiniteGroup<A> into a GrpObj
export const asGrpObj = <A>(G: FiniteGroup<A>): GrpObj => ({ tag: "GrpObj", G });

// Identity homomorphism for any group object
export function idGrp(G: GrpObj): GrpHom {
  const id = hom(G.G, G.G, (a: any) => a, `id_${G.G.name || 'G'}`);
  return { 
    source: G, 
    target: G,
    map: id.map,
    name: id.name,
    witnesses: id.witnesses
  };
}

// Composition in Grp (only if codomain/domain match)
export function compGrp(h: GrpHom, g: GrpHom): GrpHom {
  if (g.target.G !== h.source.G) throw new Error("Grp: domains do not match for composition");
  
  // Create temporary GroupHom for composition
  const tempG: GroupHom<unknown, unknown, any, any> = {
    source: g.source.G,
    target: g.target.G,
    map: g.map
  };
  const tempH: GroupHom<unknown, unknown, any, any> = {
    source: h.source.G,
    target: h.target.G,
    map: h.map
  };
  
  const c = compose(tempH, tempG);
  const analyzed = analyzeHom(c);
  
  return { 
    source: g.source, 
    target: h.target,
    map: analyzed.map,
    name: analyzed.name,
    witnesses: analyzed.witnesses
  };
}

// Full category of (small) groups:
export const Grp: Category<GrpObj, GrpHom> = {
  id: idGrp,
  compose: compGrp,
  // Optional: well-formedness check (used in tests)
  eqMor: (f, g) => {
    if (f.source !== g.source || f.target !== g.target) return false;
    const eq = f.target.G.eq ?? ((x: any, y: any) => x === y);
    return f.source.G.elems.every(a => eq(f.map(a), g.map(a)));
  }
};

// Smart constructor to build a Grp-hom from a raw function, with a check gate.
// For production, you may pass `checked=false` to skip proof-by-exhaustion on big carriers.
export function mkGrpHom<A,B>(
  G: FiniteGroup<A>, H: FiniteGroup<B>, fn: (a: A) => B, checked: boolean = true
): GrpHom {
  if (checked) {
    // Verify it's a homomorphism by checking the law
    const eqH = H.eq ?? ((x: B, y: B) => x === y);
    for (const a of G.elems) {
      for (const b of G.elems) {
        const lhs = fn(G.op(a, b));
        const rhs = H.op(fn(a), fn(b));
        if (!eqH(lhs, rhs)) {
          throw new Error("Not a group homomorphism");
        }
      }
    }
  }
  
  const homomorphism = hom(G, H, fn);
  return {
    source: asGrpObj(G),
    target: asGrpObj(H),
    map: homomorphism.map,
    name: homomorphism.name,
    witnesses: homomorphism.witnesses
  };
}
