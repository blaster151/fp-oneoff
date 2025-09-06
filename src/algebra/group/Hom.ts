import { Group, GroupHom } from "./structures";

export function groupHom<A,B>(source: Group<A>, target: Group<B>, map: (a:A)=>B, name?:string): GroupHom<A,B> {
  return { source, target, map, name };
}

export function composeHom<A,B,C>(g: GroupHom<B,C>, f: GroupHom<A,B>, name?: string): GroupHom<A,C> {
  return { name, source: f.source, target: g.target, map: (a:A) => g.map(f.map(a)) };
}

// Identity hom (sometimes handy for tests)
export function idHom<A>(G: Group<A>): GroupHom<A,A> {
  return { source: G, target: G, map: (a:A)=>a, name: "id" };
}