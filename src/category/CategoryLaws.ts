// Generic category laws (parametric in morphism type)
export interface HasId<Ob, Mor> {
  id: (A: Ob) => Mor;
}

export interface HasCompose<Mor> {
  compose: (g: Mor, f: Mor) => Mor;
}

export function categoryLaws<Ob, Mor>(
  eqMor: (x: Mor, y: Mor) => boolean,
  C: HasId<Ob, Mor> & HasCompose<Mor>
) {
  return {
    leftIdentity: (A: Ob, f: Mor) =>
      eqMor(C.compose(f, C.id(A)), f),
    rightIdentity: (B: Ob, f: Mor) =>
      eqMor(C.compose(C.id(B), f), f),
    associativity: (h: Mor, g: Mor, f: Mor) =>
      eqMor(C.compose(C.compose(h, g), f), C.compose(h, C.compose(g, f))),
  };
}