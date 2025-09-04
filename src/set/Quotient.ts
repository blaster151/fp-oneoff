import { FiniteSet, Eq, mkFiniteSet, member } from "./Set";

/** Quotient A/~ given as eqv : A×A -> boolean (an equivalence relation). */
export function quotient<A>(Aset: FiniteSet<A>, eqv:(x:A,y:A)=>boolean) {
  // pick canonical reps by first-seen
  const reps: A[] = [];
  const sameClass = (x:A,y:A)=>eqv(x,y);
  for (const a of Aset.elems) {
    if (!reps.some(r=>sameClass(a,r))) reps.push(a);
  }
  // a class is represented by its rep
  type Cls = { rep: A };
  const elems: Cls[] = reps.map(rep=>({rep}));
  const eq: Eq<Cls> = (x,y)=> sameClass(x.rep,y.rep);
  return mkFiniteSet(elems, eq);
}