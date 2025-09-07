import { BaseCategory, Mor, Obj } from "../../category/core";
import { Functor } from "../../category/functor";
import { FinGrp, FinGroup, Hom as FinHom } from "../fingrp";

// The forgetful functor U: FinGrp -> Set (here Set is "objects = arrays" demo)
export interface SetObj<T = unknown> { carrier: T[]; }

export const U_FinGrp_to_Set: Functor<typeof FinGrp, {
  tag: string;
  equalObj: (a: Obj, b: Obj) => boolean;
  equalMor: (f: Mor, g: Mor) => boolean;
  dom: (f: Mor) => Obj;
  cod: (f: Mor) => Obj;
  id: (a: Obj) => Mor;
  comp: (g: Mor, f: Mor) => Mor;
}> = {
  source: FinGrp,
  target: {
    tag: "Set(demo)",
    equalObj: (a, b) => (a as SetObj).carrier.length === (b as SetObj).carrier.length
      && JSON.stringify((a as SetObj).carrier) === JSON.stringify((b as SetObj).carrier),
    equalMor: (f, g) => f === g,
    dom: (f) => (f as (x: unknown) => unknown)["__dom"],
    cod: (f) => (f as (x: unknown) => unknown)["__cod"],
    id: (a) => {
      const A = a as SetObj;
      const fn = (x: unknown) => x;
      (fn as any).__dom = A; (fn as any).__cod = A;
      return fn as unknown as Mor;
    },
    comp: (g, f) => {
      const fn = (x: unknown) => (g as any)( (f as any)(x) );
      (fn as any).__dom = (f as any).__dom;
      (fn as any).__cod = (g as any).__cod;
      return fn as unknown as Mor;
    },
  },

  onObj: (a) => {
    const G = a as FinGroup;
    return { carrier: G.elems } as SetObj;
  },

  onMor: (f) => {
    const h = f as FinHom;
    const A = { carrier: h.src.elems } as SetObj;
    const B = { carrier: h.dst.elems } as SetObj;
    const fn = (x: unknown) => h.map[String(x as any)];
    (fn as any).__dom = A; (fn as any).__cod = B;
    return fn as unknown as Mor;
  },

  respectsId: (a) => true,
  respectsComp: (g, f) => true,
};