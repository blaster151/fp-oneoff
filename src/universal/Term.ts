import type { OpSym } from "./Signature";
import { must, idx } from "../util/guards";

export type Var = { tag: "Var"; ix: number };
export type App = { tag: "App"; op: OpSym; args: Term[] };
export type Term = Var | App;

export const Var = (ix: number): Var => ({ tag: "Var", ix });
export const App = (op: OpSym, args: Term[]): App => ({ tag: "App", op, args });

/** Map variables by function f: ix -> Term (capture-avoiding in this first-order setting). */
export function subst(t: Term, f: (ix: number) => Term): Term {
  if (t.tag === "Var") return f(t.ix);
  return App(t.op, t.args.map(a => subst(a, f)));
}

/** Structural equality on terms (by shape, op identity, and var indices). */
export function termEq(x: Term, y: Term): boolean {
  if (x.tag !== y.tag) return false;
  if (x.tag === "Var") return x.ix === (y as any).ix;
  const a = x as App, b = y as App;
  if (a.op !== b.op) return false; // same OpSym object expected
  if (a.args.length !== b.args.length) return false;
  for (let i = 0; i < a.args.length; i++) if (!termEq(idx(a.args, i), idx(b.args, i))) return false;
  return true;
}