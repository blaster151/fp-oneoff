import { Group, GroupHom } from "./structures";

export function groupHom<A,B>(source: Group<A>, target: Group<B>, map: (a:A)=>B, name?:string): GroupHom<A,B> {
  return { source, target, map, ...(name !== undefined && { name }) };
}

export function composeHom<A,B,C>(
  g: GroupHom<B,C>, 
  f: GroupHom<A,B>,
  name?: string
): GroupHom<A,C> {
  return {
    source: f.source,
    target: g.target,
    map: (a: A) => g.map(f.map(a)),
    name: name || `${g.name || 'g'}∘${f.name || 'f'}`
  };
}