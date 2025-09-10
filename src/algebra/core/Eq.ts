export interface Eq<A> {
  eq: (x:A,y:A)=>boolean;
}

export function fromShow<A>(show:(a:A)=>string): Eq<A> {
  return { eq: (x,y)=> show(x)===show(y) };
}
