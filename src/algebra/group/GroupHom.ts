/**
 * @deprecated This class-based GroupHom implementation is deprecated.
 * Use the enhanced canonical implementation in ./Hom.ts instead.
 * 
 * Migration: Replace `new GroupHom(G, H, map)` with `createClassHom(G, H, map)`
 * from ./Hom.ts
 */

import { FiniteGroup } from "./Group";
import { Subgroup, NormalSubgroup, isNormal } from "./NormalSubgroup";
import { Eq } from "../../types/eq.js";
import { QuotientGroup } from "./QuotientGroup";

/** @deprecated Use GroupHom from ./Hom.ts instead */
export class GroupHom<G, H> {
  constructor(
    readonly G: FiniteGroup<G>,
    readonly H: FiniteGroup<H>,
    readonly map: (g: G) => H
  ) {}

  // Interface compatibility
  get source() { return this.G; }
  get target() { return this.H; }

  /** Law: f(x ◦ y) = f(x) ⋄ f(y) and f(e_G) = e_H, f(x)^{-1} = f(x)^{-1}. */
  respectsOp(x: G, y: G): boolean {
    const { G, H, map: f } = this;
    const eqH = H.eq ?? ((x: H, y: H) => x === y);
    return eqH(f(G.op(x, y)), H.op(f(x), f(y)));
  }
  preservesId(): boolean { 
    const eqH = this.H.eq ?? ((x: H, y: H) => x === y);
    const gId = (this.G as any).e ?? (this.G as any).id;
    const hId = (this.H as any).e ?? (this.H as any).id;
    return eqH(this.map(gId), hId); 
  }
  preservesInv(x: G): boolean {
    const { G, H, map: f } = this;
    const eqH = H.eq ?? ((x: H, y: H) => x === y);
    return eqH(f(G.inv(x)), H.inv(f(x)));
  }

  /** Kernel: { g ∈ G | f(g) = e_H } as a NormalSubgroup witness. */
  kernel(): NormalSubgroup<G> {
    const { G, H, map: f } = this;
    const eqH = H.eq ?? ((x: H, y: H) => x === y);
    const carrier = (g: G) => eqH(f(g), (H as any).e ?? (H as any).id);

    // Subgroup axioms (constructive checks):
    // 1) e ∈ ker f
    // 2) closed under ◦ : if a,b∈ker then f(a◦b)=e
    // 3) closed under inv : if a∈ker then f(a^{-1})=e
    // NOTE: We don't enumerate; we rely on hom laws + equalities when asked.

    const include = (g: G) => g;
    const N: Subgroup<G> = { carrier, include };
    return isNormal(G, N)!; // For kernels, normality follows abstractly; conjClosed computed via predicate.
  }

  /** Image predicate: { h ∈ H | ∃g. f(g)=h } (semi-decidable by search for finite G). */
  imagePredicate(): (h: H) => boolean {
    const { H } = this;
    // Default: equality-only oracle; callers can override with finite search helpers.
    return (_h: H) => { throw new Error("imagePredicate requires a search strategy for G"); };
  }

  /** Canonical factorization through the kernel-pair quotient using Eq abstraction. */
  factorization(eqH: Eq<H>) {
    const { G, H, map } = this;
    const cong = { G: G as any, eqv: (x:G,y:G) => eqH(map(x), map(y)), comp: (x: G, x1: G, y: G, y1: G) => eqH(map(G.op(x, y)), map(G.op(x1, y1))) };
    const Q = QuotientGroup(cong);
    const quotient = Q.Group;
    const pi = (g:G) => Q.norm(g);
    const iota = (q:{rep:G}) => map(q.rep);

    const law_compose_equals_f = (g:G) => eqH(iota(pi(g)), map(g));

    return { quotient, pi, iota, law_compose_equals_f };
  }

  /** Optional compatibility method for tests that expect `verify()` on homs. */
  verify?(): boolean;
}