import { idx } from "../../util/guards";

export function injectiveOn<T,U>(xs: T[], f: (x:T)=>U, eqU: (a:U,b:U)=>boolean): boolean {
  for (let i=0;i<xs.length;i++) for (let j=i+1;j<xs.length;j++) {
    if (eqU(f(idx(xs, i)), f(idx(xs, j)))) return false;
  }
  return true;
}

export function surjectiveTo<T,U>(xs: T[], codSample: U[], f: (x:T)=>U, eqU: (a:U,b:U)=>boolean): boolean {
  return codSample.every(u => xs.some(x => eqU(f(x), u)));
}

export const approxEq = (eps=1e-9) => (a:number,b:number)=>Math.abs(a-b) <= eps;