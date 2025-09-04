/** Natural transformation between functors F and G */
export interface Nat<F, G> {
  <A>(fa: F): G;
}

// Helper type for natural transformations
export type NaturalTransformation<F, G> = <A>(fa: F) => G;