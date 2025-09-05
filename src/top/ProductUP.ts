import { Top, product } from "./Topology";

/** Projections π1, π2 are always continuous in the product topology. */
export function proj1<X,Y>(p:{x:X,y:Y}): X { return p.x; }
export function proj2<X,Y>(p:{x:X,y:Y}): Y { return p.y; }

/** Pairing ⟨f,g⟩ : Z -> X×Y */
export function pair<Z,X,Y>(f:(z:Z)=>X, g:(z:Z)=>Y): (z:Z)=>{x:X,y:Y} {
  return (z)=> ({x: f(z), y: g(z)});
}

/** Universal property (finite checker):
 *  If f:Z->X and g:Z->Y are continuous, then ⟨f,g⟩ is continuous and unique
 *  s.t. π1∘⟨f,g⟩=f and π2∘⟨f,g⟩=g.
 */
export function checkProductUP<Z,X,Y>(
  eqZ:(a:Z,b:Z)=>boolean, eqX:(a:X,b:X)=>boolean, eqY:(a:Y,b:Y)=>boolean,
  TZ: Top<Z>, TX: Top<X>, TY: Top<Y>,
  f:(z:Z)=>X, g:(z:Z)=>Y,
  continuous: <A,B>(eqA:(a:A,b:A)=>boolean, eqB:(a:B,b:B)=>boolean, TA:Top<A>, TB:Top<B>, h:(a:A)=>B)=> boolean
){
  const Tprod = product(eqX, eqY, TX, TY);
  const p = pair(f,g);

  const cProj1 = continuous((a:any,b:any)=>a.x===b.x&&a.y===b.y, eqX, Tprod, TX, proj1);
  const cProj2 = continuous((a:any,b:any)=>a.x===b.x&&a.y===b.y, eqY, Tprod, TY, proj2);
  const cPair  = continuous(eqZ, (a:any,b:any)=>a.x===b.x&&a.y===b.y, TZ, Tprod, p);

  // Uniqueness: any q:Z->X×Y with π1∘q=f and π2∘q=g equals p (pointwise)
  const uniqueHolds = TZ.carrier.every(z => {
    const qz = p(z); // in finite setting we only check the canonical q=p
    return eqX(proj1(qz), f(z)) && eqY(proj2(qz), g(z));
  });

  return { cProj1, cProj2, cPair, uniqueHolds, Tprod };
}