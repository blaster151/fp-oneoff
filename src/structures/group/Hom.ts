/**
 * @deprecated This simple GroupHom implementation is deprecated.
 * Use the enhanced canonical implementation in ../../algebra/group/Hom.ts instead.
 * 
 * Migration: Replace `{ source, target, f, verify? }` with `createSimpleHom(source, target, map, { verify? })`
 * from ../../algebra/group/Hom.ts
 */

import type { FiniteGroup } from "./Group";

/** @deprecated Use GroupHom from ../../algebra/group/Hom.ts instead */
export interface GroupHom<A, B> {
  source: FiniteGroup<A>;
  target: FiniteGroup<B>;
  f: (a: A) => B;
  verify?(): boolean;
  name?: string;
  witnesses?: any; // Add witnesses property for compatibility
}

// Factory to build a well-typed homomorphism object.
export function hom<A, B>(
  source: FiniteGroup<A>,
  target: FiniteGroup<B>,
  f: (a: A) => B,
  name?: string,
  verify?: () => boolean
): GroupHom<A, B> {
  const result: GroupHom<A, B> = { source, target, f };
  if (name !== undefined) {
    result.name = name;
  }
  if (verify !== undefined) {
    result.verify = verify;
  } else {
    // Default verify function - check homomorphism property
    result.verify = () => {
      if (!source.elems || !target.elems) return true;
      const eq = target.eq ?? ((x: B, y: B) => x === y);
      for (const x of source.elems) {
        for (const y of source.elems) {
          const lhs = f(source.op(x, y));
          const rhs = target.op(f(x), f(y));
          if (!eq(lhs, rhs)) return false;
        }
      }
      return true;
    };
  }
  return result;
}