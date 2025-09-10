export interface Category<Obj, Mor> {
  /** identity on each object */
  id: <A extends Obj>(o: A) => Mor;

  /** composition (g ∘ f).  NOTE: first f, then g. */
  compose: <A extends Obj, B extends Obj, C extends Obj>(
    f: Mor, g: Mor
  ) => Mor;
}