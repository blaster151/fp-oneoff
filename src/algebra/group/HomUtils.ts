import { Group, GroupHom } from "./structures";

export function groupHom<A,B>(source: Group<A>, target: Group<B>, map: (a:A)=>B, name?:string): GroupHom<A,B> {
  return { source, target, map, name };
}