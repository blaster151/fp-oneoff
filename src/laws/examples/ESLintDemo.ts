/**
 * This file demonstrates the ESLint rule for requiring @lawpack tags.
 * Some of these exports should trigger warnings.
 */

// This should trigger a warning - missing @lawpack tag
export interface Monoid<A> {
  empty: A;
  concat: (x: A, y: A) => A;
}

// This should trigger a warning - missing @lawpack tag
export const StringMonoid = {
  empty: "",
  concat: (a: string, b: string) => a + b
};

// This should NOT trigger a warning - has @lawpack tag
/**
 * @lawpack Monoid/string/concat
 */
export const TaggedMonoid = {
  empty: "",
  concat: (a: string, b: string) => a + b
};

// This should NOT trigger a warning - not a structure name
export const regularFunction = (x: number) => x * 2;

// This should trigger a warning - missing @lawpack tag
export interface Ring<A> {
  add: (x: A, y: A) => A;
  mul: (x: A, y: A) => A;
  zero: A;
  one: A;
}