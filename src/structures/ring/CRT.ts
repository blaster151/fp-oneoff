import { ZnRing, FiniteRing } from "./Ring";

/** Euclidean helpers on Z (for factoring n into prime powers). */
function gcd(a:number,b:number){ while(b){ const t=a%b; a=b; b=t; } return Math.abs(a); }
function isPrime(p:number){ if(p<2) return false; for(let d=2; d*d<=p; d++) if(p%d===0) return false; return true; }

/** Factor n into prime powers: n = Π p_i^{k_i} (stable order). */
export function primePowerFactorization(n:number): Array<{p:number, k:number, m:number}> {
  const out: Array<{p:number,k:number,m:number}> = [];
  let m = n;
  for (let p=2; p*p<=m; p++){
    if(!isPrime(p)) continue;
    if(m%p===0){
      let k=0; while(m%p===0){ m/=p; k++; }
      out.push({p,k,m:Math.pow(p,k)});
    }
  }
  if(m>1){ out.push({p:m,k:1,m:m}); }
  // For safety recompute m as p^k
  return out.map(({p,k})=>({p,k,m:Math.round(p**k)}));
}

/** Idempotents for CRT: build e_i s.t. e_i ≡ 1 mod n_i and 0 mod n_j (i≠j), where n = Π n_i, pairwise coprime. */
function crtIdempotents(ns:number[]){
  const n = ns.reduce((a,b)=>a*b,1);
  return ns.map(ni=>{
    const Mi = n/ni;
    // find inverses Mi⁻¹ mod ni
    let inv = 0;
    for(let t=1;t<ni;t++){ if((Mi*t)%ni===1){ inv=t; break; } }
    const ei = (Mi*inv)%n; // e_i mod n
    return ei;
  });
}

/** Build explicit CRT isomorphism for pairwise coprime factors n = Π n_i. */
export function crtIsomorphism(ns:number[]){
  const n = ns.reduce((a,b)=>a*b,1);
  // sanity: pairwise coprime
  for(let i=0;i<ns.length;i++) for(let j=i+1;j<ns.length;j++)
    if(gcd(ns[i],ns[j])!==1) throw new Error("crtIsomorphism: ns must be pairwise coprime");
  const e = crtIdempotents(ns);
  const Zn = ZnRing(n);
  const cod: Array<FiniteRing<number>> = ns.map(ZnRing);
  // φ: Z_n → Π Z_{n_i}
  const phi = (x:number)=> ns.map(ni => x % ni);
  // ψ: Π Z_{n_i} → Z_n  via sum_i x_i * e_i  (mod n)
  const psi = (xs:number[])=>{
    let s = 0;
    for(let i=0;i<ns.length;i++) s = (s + (xs[i]*e[i])) % n;
    return ((s % n)+n)%n;
  };
  return { n, factors:ns, e, phi, psi, Zn, cod };
}

/** For any n, construct factors by prime powers and give the canonical CRT data. */
export function crtForZn(n:number){
  const pps = primePowerFactorization(n).map(({m})=>m);
  return crtIsomorphism(pps);
}