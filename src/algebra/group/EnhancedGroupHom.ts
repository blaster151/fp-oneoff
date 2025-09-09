/**
 * @deprecated This EnhancedGroupHom implementation is deprecated.
 * Use the enhanced canonical implementation in ./Hom.ts instead.
 * 
 * Migration: Replace `mkHom(src, dst, run)` with `createEnhancedHom(src, dst, run)`
 * from ./Hom.ts
 */

import { EnhancedGroup } from "./EnhancedGroup";

/** @deprecated Use GroupHom from ./Hom.ts instead */
export interface EnhancedGroupHom<A, B> {
  readonly src: EnhancedGroup<A>;
  readonly dst: EnhancedGroup<B>;
  readonly run: (a: A) => B;

  // witness that structure is respected: f(x* y) = f(x) * f(y)
  readonly preservesOp: (x: A, y: A) => boolean;
  readonly preservesId: () => boolean;
  readonly preservesInv: (x: A) => boolean;
}

// builder that auto-fills witnesses from src/dst
export function mkHom<A, B>(
  src: EnhancedGroup<A>,
  dst: EnhancedGroup<B>,
  run: (a: A) => B
): EnhancedGroupHom<A, B> {
  return {
    src, dst, run,
    preservesOp: (x, y) => dst.eq(run(src.op(x, y)), dst.op(run(x), run(y))),
    preservesId: () => dst.eq(run(src.id), dst.id),
    preservesInv: (x) => dst.eq(run(src.inv(x)), dst.inv(run(x))),
  };
}

// composition and identity as homomorphisms
export function idHom<A>(G: EnhancedGroup<A>): EnhancedGroupHom<A, A> {
  return mkHom(G, G, (x) => x);
}

export function composeHom<A, B, C>(
  g: EnhancedGroupHom<B, C>,
  f: EnhancedGroupHom<A, B>
): EnhancedGroupHom<A, C> {
  if (f.dst !== g.src) {
    // optional runtime guard for dev
    console.warn("composeHom: incompatible sources/targets");
  }
  const run = (a: A) => g.run(f.run(a));
  return mkHom(f.src, g.dst, run);
}