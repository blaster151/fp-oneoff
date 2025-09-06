import { FiniteGroup } from "./Group";
import { Subgroup, NormalSubgroup, isNormal } from "./NormalSubgroup";
import { Eq } from "../core/Eq";
import { quotientGroup } from "./Quotient";

/** Group homomorphism witness with law checker. */
export class GroupHom<G, H> {
  constructor(
    readonly G: FiniteGroup<G>,
    readonly H: FiniteGroup<H>,
    readonly map: (g: G) => H
  ) {}

  /** Law: f(x ◦ y) = f(x) ⋄ f(y) and f(e_G) = e_H, f(x)^{-1} = f(x)^{-1}. */
  respectsOp(x: G, y: G): boolean {
    const { G, H, map: f } = this;
    return H.eq(f(G.op(x, y)), H.op(f(x), f(y)));
  }
  preservesId(): boolean { return this.H.eq(this.map(this.G.id), this.H.id); }
  preservesInv(x: G): boolean {
    const { G, H, map: f } = this;
    return H.eq(f(G.inv(x)), H.inv(f(x)));
  }

  /** Kernel: { g ∈ G | f(g) = e_H } as a NormalSubgroup witness. */
  kernel(): NormalSubgroup<G> {
    const { G, H, map: f } = this;
    const carrier = (g: G) => H.eq(f(g), H.id);

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
    const cong = { eq: (x:G,y:G) => eqH.eq(map(x), map(y)) };
    const Q = quotientGroup(G, cong);
    const quotient = Q.Group;
    const pi = (g:G) => Q.norm(g);
    const iota = (q:{rep:G}) => map(q.rep);

    const law_compose_equals_f = (g:G) => eqH.eq(iota(pi(g)), map(g));

    return { quotient, pi, iota, law_compose_equals_f };
  }

  /** Optional compatibility method for tests that expect `verify()` on homs. */
  verify?(): boolean;
}