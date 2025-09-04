import { FiniteGroup } from "../Group";
import { GroupHom } from "../GrpCat";
import { isIsomorphism } from "../Isomorphism";
import { center } from "../center/Center";
import { quotientGroup } from "../builders/Quotient";
import { conjugation } from "../automorphisms/Conjugation";

export function GmodZ_iso_Inn<A>(G: FiniteGroup<A>): {
  Z: FiniteGroup<A>;
  Q: FiniteGroup<{rep:A}>;
  phi: GroupHom<{rep:A}, (x:A)=>A>;  // represent inner auto by its function table
  isIso: boolean;
} {
  const Z = center(G);
  const Q = quotientGroup(G, Z);

  // represent each inner automorphism by its action (function from A to A)
  // define φ([g]) = conj_g : x ↦ g x g^{-1}
  const innerAutos = Array.from(new Set(Q.elems.map(c=>c.rep))).map(g=>{
    const cg = conjugation(G, g).f;
    const norm = (x:A)=> cg(x); // normal form
    return norm;
  });

  const phi: GroupHom<{rep:A}, (x:A)=>A> = {
    source: Q,
    target: {
      elems: innerAutos,
      eq: (f:(x:A)=>A, g:(x:A)=>A) => G.elems.every(a=> G.eq(f(a), g(a))),
      op: (f:(x:A)=>A, g:(x:A)=>A) => (x:A)=> f(g(x)),  // composition
      id: (x:A)=> x,
      inv: (f:(x:A)=>A) => {
        // find inverse by brute force over table
        for (const gfun of innerAutos) {
          const ok = G.elems.every(a=> G.eq(gfun(f(a)), a) && G.eq(f(gfun(a)), a));
          if (ok) return gfun;
        }
        throw new Error("no inverse found");
      }
    } as unknown as FiniteGroup<(x:A)=>A>,
    f: (c)=> {
      const g = c.rep;
      const cg = conjugation(G, g).f;
      return (x:A)=>cg(x);
    }
  };

  // isIsomorphism checks hom + bijection onto the subgroup of inner autos represented by tables.
  const isIso = isIsomorphism(Q, phi.target as any, phi.f);
  return { Z, Q, phi, isIso: isIso !== null };
}