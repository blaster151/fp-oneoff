import { Top, continuous } from "./Topology";

export type ContEntry<A,B> = {
  tag: string;
  eqDom: (a:A,b:A)=>boolean;  // equality on domain elements
  TA: Top<A>;
  TB: Top<B>;
  f: (a:A)=>B;
};

const _entries: ContEntry<any,any>[] = [];

export function registerCont<A,B>(e: ContEntry<A,B>) { _entries.push(e); }
export function clearCont() { _entries.length = 0; }
export function allCont() { return _entries.slice(); }

export function runContAll() {
  return _entries.map(e => ({
    tag: e.tag,
    ok: continuous(e.eqDom as any, e.eqDom as any, e.TA as any, e.TB as any, e.f as any)
  }));
}