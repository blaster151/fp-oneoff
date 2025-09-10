// GOAL: Universe-parametric small categories (objects as a small set; hom-sets small).
import { UniverseId, UniverseOps, Small } from "../size/Universe";
import { SetU, FuncU, idU, compU, finiteSet } from "./SetU";

export type ObjId = string & { readonly __obj: unique symbol };

export type Category<U extends UniverseId, Ob, Hom> = {
  readonly Uops: UniverseOps<U>;
  readonly Ob: SetU<U, Ob>;
  // hom: returns a U-small set of morphisms from a to b
  readonly hom: (a: Ob, b: Ob) => SetU<U, Hom>;
  readonly id: (a: Ob) => Hom;
  readonly comp: (g: Hom, f: Hom) => Hom;
  // Optional witnesses (laws)
  readonly laws?: {
    idLeft: (f: Hom) => boolean;
    idRight: (f: Hom) => boolean;
    assoc: (h: Hom, g: Hom, f: Hom) => boolean;
  };
};
