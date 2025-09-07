// Core category theory interfaces
export interface Category<Ob, Mor> {
  id: (A: Ob) => Mor;
  compose: (g: Mor, f: Mor) => Mor;
  eqMor?: (f: Mor, g: Mor) => boolean;
  // Optional for subcategories that explicitly track objects/morphisms
  objects?: Ob[];
  morphisms?: Mor[];
}

export interface Functor<ObA, ObB, MorA, MorB> {
  readonly source: Category<ObA, MorA>;
  readonly target: Category<ObB, MorB>;
  onObj: (A: ObA) => ObB;
  onMor: (f: MorA) => MorB;
}