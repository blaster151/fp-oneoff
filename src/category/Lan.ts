import { Eq } from "../types/eq.js";

/**
 * Left Kan extension of g along h.
 * Lan h g c = ∀ b. Eq(h b, c) → g b
 */
export type Lan<h, g, c> = <b>(eq: Eq<any>) => g;

// Alternative: more explicit Lan type
export type LeftKanExtension<h, g, c> = <b>(eq: Eq<any>) => g;