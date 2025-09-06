import type { FiniteGroup } from "./Group";

/** Group homomorphism */
export interface GroupHom<A, B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  f: (a: A) => B;
  verify?(): boolean;
}

// Factory to build a well-typed homomorphism object.
export function hom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  f: (a: A) => B,
  verify?: () => boolean
): GroupHom<A, B> {
  const result: GroupHom<A, B> = { source, target, f };
  if (verify !== undefined) {
    result.verify = verify;
  }
  return result;
}