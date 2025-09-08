import { FiniteAbGroup, Trivial } from "../AbGroup";
import { FiniteGroup } from "../../group/Group";
import { GroupHom, hom } from "../../group/GrpCat";
import { kernel, image, quotientGroup } from "../../group/builders/Quotient";

/** Kernel in Ab is the usual kernel subgroup (a ↦ e). */
export function ker<A,B>(f: GroupHom<A,B>): { K: FiniteAbGroup<A>, ι: GroupHom<A,A> } {
  const K0 = kernel(f) as FiniteAbGroup<A>;
  const ι: GroupHom<A,A> = hom(K0, f.source, (x:A)=> x, undefined, () => true);
  return { K: K0, ι };
}

/** Cokernel in Ab: H / im(f), with q: H → H/im f. */
export function coker<A,B>(f: GroupHom<A,B>): { C: FiniteAbGroup<{rep:B}>, q: GroupHom<B,{rep:B}> } {
  const Im = image(f) as FiniteAbGroup<B>;
  const C0 = quotientGroup(f.target as FiniteGroup<B>, Im) as unknown as FiniteAbGroup<{rep:B}>;
  const q: GroupHom<B,{rep:B}> = hom(
    f.target,
    C0 as any,
    (b:B)=> {
      // pick the representing coset of b
      const cos = (C0 as any).cosets.find((c:{rep:B, elems:B[]}) => c.elems.some((x:B)=> (f.target as any).eq(x,b)));
      return { rep: cos.rep } as any;
    },
    undefined,
    () => true
  );
  return { C: C0, q };
}

/** Zero object (trivial group) and zero morphisms in Ab. */
export function zeroObject(): FiniteAbGroup<0> {
  return Trivial(0 as 0);
}

export function zeroMor<A,B>(G: FiniteAbGroup<A>, H: FiniteAbGroup<B>): GroupHom<A,B> {
  return hom(G, H, (_:A)=> H.id, undefined, () => true);
}