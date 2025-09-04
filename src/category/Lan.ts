/**
 * Left Kan extension of g along h (paper encodes this using equality GADT).
 *
 * Definition used here:
 *   Lan h g c  :=  ∀ b. Eq<h(b), c> -> g(b)
 *
 * This is a *type-level* encoding that we can use to write code against the same interface
 * the paper uses in the initial algebra semantics for basic GADTs.
 */

import type { Eq } from "./Eq";

// Simplified form for TypeScript compatibility
export type Lan<h, g, c> = <b>(eq: Eq<h, c>) => g;

// Simpler form for TypeScript compatibility
export type Lan1<H, G, C> = <B>(e: Eq<H, C>) => G;

/** Helper to "apply" a unary type constructor H to B in type-level positions.
 * This is a purely *nominal* helper; use via interface constraints when needed.
 */
export type Apply<H, B> = H;