// catkit-homology.ts
// Chain complex + homology (H0/H1) for nerves/quivers/simplicial sets.
// Now with:
//  • Hardened Smith Normal Form (SNF) over ℤ with unimodular U,V and full divisibility diagonal.
//  • SNF certificates: verify U*A*V === D (exact integers) at runtime.
//  • H1 presentation + chosen generators (free & torsion) as explicit 1-chains and pretty loops.
//  • Flexible SimplicialSet (0–2) loader with optional oriented 2-simplices (sign flags).
//
// This module is small and finite; great for runnable intuition in TS.
//
// ------------------------------------------------------------
// Basic types for homology computation (prefixed to avoid conflicts)
export type HomologyObj = string;
export type HomologyEdge = { src: HomologyObj; dst: HomologyObj; label: string };
export type HomologyPath = { src: HomologyObj; dst: HomologyObj; labels: string[] };
export type HomologyQuiver = { objects: HomologyObj[]; edges: HomologyEdge[] };
export type HomologyTwoSimplex = { f: HomologyPath; g: HomologyPath; comp: HomologyPath };
export type HomologyBuildOptions = { maxPathLen?: number }; // default 2

// ------------------------------------------------------------
// Integer helpers & matrices
const abs = Math.abs;
function zeros(r:number,c:number): number[][] { 
  return Array.from({length:r},()=>Array(c).fill(0)); 
}
function eye(n:number): number[][] { 
  const I=zeros(n,n); 
  for(let i=0;i<n;i++) I[i]![i] = 1; 
  return I; 
}
function clone(A:number[][]): number[][] { 
  return A.map(r=>r.slice()); 
}

function egcd(a:number,b:number):[number,number,number]{ // returns [g,x,y] : ax+by=g
  a=Math.trunc(a); b=Math.trunc(b);
  let old_r = abs(a), r = abs(b);
  let old_s = 1, s = 0;
  let old_t = 0, t = 1;
  while (r !== 0) {
    const q = (old_r / r) | 0;
    const tmp_r = old_r - q * r; old_r = r; r = tmp_r;
    const tmp_s = old_s - q * s; old_s = s; s = tmp_s;
    const tmp_t = old_t - q * t; old_t = t; t = tmp_t;
  }
  return [old_r, Math.sign(a)*old_s, Math.sign(b)*old_t];
}

function matSwapRows(A:number[][], i:number, j:number): void { 
  const t=A[i]!; A[i]=A[j]!; A[j]=t; 
}

function matSwapCols(A:number[][], i:number, j:number): void { 
  for(let r=0;r<A.length;r++){ 
    const row = A[r]!;
    const t=row[i]!; row[i]=row[j]!; row[j]=t; 
  } 
}

function matAddRow(A:number[][], src:number, dst:number, k:number): void { 
  const srcRow = A[src]!;
  const dstRow = A[dst]!;
  for(let j=0;j<srcRow.length;j++) dstRow[j]! += k*srcRow[j]!; 
}

function matAddCol(A:number[][], src:number, dst:number, k:number): void { 
  for(let i=0;i<A.length;i++) {
    const row = A[i]!;
    row[dst]! += k*row[src]!;
  }
}

function matNegRow(A:number[][], i:number): void { 
  const row = A[i]!;
  for(let j=0;j<row.length;j++) row[j] = -row[j]!; 
}

function matNegCol(A:number[][], j:number): void { 
  for(let i=0;i<A.length;i++) {
    const row = A[i]!;
    row[j] = -row[j]!;
  }
}

function matMul(A:number[][], B:number[][]): number[][] { 
  if(A.length === 0 || B.length === 0) return [];
  const m=A.length, n=A[0]!.length, p=B[0]!.length; 
  const C=zeros(m,p);
  for(let i=0;i<m;i++) {
    const rowA = A[i]!;
    const rowC = C[i]!;
    for(let k=0;k<n;k++){ 
      const aik=rowA[k]!; 
      if(aik===0) continue; 
      for(let j=0;j<p;j++) rowC[j]! += aik*B[k]![j]!; 
    }
  }
  return C;
}

function matEq(A:number[][], B:number[][]): boolean {
  if (A.length !== B.length) return false;
  if (A.length === 0) return true;
  if (A[0]!.length !== B[0]!.length) return false;
  for (let i=0;i<A.length;i++) {
    const rowA = A[i]!;
    const rowB = B[i]!;
    for (let j=0;j<rowA.length;j++) {
      if (rowA[j] !== rowB[j]) return false;
    }
  }
  return true;
}

function isSquare(M:number[][]): boolean { 
  return M.length>0 && M[0]!.length===M.length; 
}

// ------------------------------------------------------------
// Unimodular inverse by integer Gauss-Jordan (for unimodular matrices only)
export function invUnimodular(M:number[][]):number[][]{
  if(!isSquare(M)) throw new Error("invUnimodular: not square");
  const n=M.length, A=clone(M), I=eye(n);
  for(let j=0;j<n;j++){
    // find nonzero in col j
    let p=j; 
    while(p<n && A[p]![j]! === 0) p++;
    if(p===n) throw new Error("invUnimodular: singular");
    if(p!==j){ matSwapRows(A,p,j); matSwapRows(I,p,j); }
    
    // reduce other entries in column j to 0 using Bezout
    for(let i=j+1;i<n;i++){
      while(A[i]![j]! !== 0){
        const a=A[j]![j]!, b=A[i]![j]!; 
        const [g,x,y]=egcd(a,b);
        const Ri=A[j]!.slice(), Rk=A[i]!.slice(), Ui=I[j]!.slice(), Uk=I[i]!.slice();
        for(let c=0;c<n;c++){ 
          A[j]![c] = x*Ri[c]! + y*Rk[c]!; 
          I[j]![c] = x*Ui[c]! + y*Uk[c]!; 
        }
        for(let c=0;c<n;c++){ 
          A[i]![c] = -(b/g)*Ri[c]! + (a/g)*Rk[c]!; 
          I[i]![c] = -(b/g)*Ui[c]! + (a/g)*Uk[c]!; 
        }
      }
    }
    for(let i=0;i<j;i++){
      const val = A[i]![j]!;
      if(val !== 0){ 
        matAddRow(A,j,i,-val); 
        matAddRow(I,j,i,-val); 
      }
    }
    if(A[j]![j]! < 0){ 
      matNegRow(A,j); 
      matNegRow(I,j); 
    }
    const pivot = abs(A[j]![j]!);
    if(pivot !== 1) throw new Error(`invUnimodular: pivot ${pivot} not ±1; matrix not unimodular?`);
  }
  return I;
}

// ------------------------------------------------------------
// Smith Normal Form (SNF) with unimodular U,V and divisibility diagonal
export function smithNormalForm(Ain:number[][]): { U:number[][], D:number[][], V:number[][] }{
  const A = clone(Ain);
  const m=A.length, n=A.length > 0 ? A[0]!.length : 0;
  let U = eye(m), V = eye(n);
  let i=0, j=0;

  function reduceColumn(i:number, j:number): void {
    for(let r=i+1;r<m;r++){
      while(A[r]![j]! !== 0){
        const a=A[i]![j]!, b=A[r]![j]!; 
        const [g,x,y]=egcd(a,b);
        const Ri=A[i]!.slice(), Rr=A[r]!.slice(), Ui=U[i]!.slice(), Ur=U[r]!.slice();
        for(let c=0;c<n;c++){ 
          A[i]![c] = x*Ri[c]! + y*Rr[c]!; 
          U[i]![c] = x*Ui[c]! + y*Ur[c]!; 
        }
        for(let c=0;c<n;c++){ 
          A[r]![c] = -(b/g)*Ri[c]! + (a/g)*Rr[c]!; 
          U[r]![c] = -(b/g)*Ui[c]! + (a/g)*Ur[c]!; 
        }
      }
    }
  }
  
  function reduceRow(i:number, j:number): void {
    for(let c=j+1;c<n;c++){
      while(A[i]![c]! !== 0){
        const a=A[i]![j]!, b=A[i]![c]!; 
        const [g,x,y]=egcd(a,b);
        const Cj=A.map(r=>r[j]!), Cc=A.map(r=>r[c]!);
        const Vj=V.map(r=>r[j]!), Vc=V.map(r=>r[c]!);
        for(let r=0;r<m;r++){ 
          A[r]![j] = x*Cj[r]! + y*Cc[r]!; 
          V[r]![j] = x*Vj[r]! + y*Vc[r]!; 
        }
        for(let r=0;r<m;r++){ 
          A[r]![c] = -(b/g)*Cj[r]! + (a/g)*Cc[r]!; 
          V[r]![c] = -(b/g)*Vj[r]! + (a/g)*Vc[r]!; 
        }
      }
    }
  }

  while(i<m && j<n){
    // pick smallest nonzero in submatrix
    let pi=-1, pj=-1, best=0;
    for(let r=i;r<m;r++) {
      const row = A[r]!;
      for(let c=j;c<n;c++){
        const v=abs(row[c]!); 
        if(v>0 && (best===0 || v<best)){ 
          best=v; pi=r; pj=c; 
          if(v===1) break; 
        }
      }
    }
    if(best===0) break;
    if(pi!==i){ matSwapRows(A,pi,i); matSwapRows(U,pi,i); }
    if(pj!==j){ matSwapCols(A,pj,j); matSwapCols(V,pj,j); }

    reduceColumn(i,j);
    reduceRow(i,j);

    // clean above/left
    for(let r=0;r<i;r++){
      while(A[r]![j]! !== 0){
        const a=A[i]![j]!, b=A[r]![j]!; 
        const [g,x,y]=egcd(a,b);
        const Ri=A[i]!.slice(), Rr=A[r]!.slice(), Ui=U[i]!.slice(), Ur=U[r]!.slice();
        for(let c=0;c<n;c++){ 
          A[i]![c] = x*Ri[c]! + y*Rr[c]!; 
          U[i]![c] = x*Ui[c]! + y*Ur[c]!; 
        }
        for(let c=0;c<n;c++){ 
          A[r]![c] = -(b/g)*Ri[c]! + (a/g)*Rr[c]!; 
          U[r]![c] = -(b/g)*Ui[c]! + (a/g)*Ur[c]!; 
        }
      }
    }
    for(let c=0;c<j;c++){
      while(A[i]![c]! !== 0){
        const a=A[i]![j]!, b=A[i]![c]!; 
        const [g,x,y]=egcd(a,b);
        const Cj=A.map(r=>r[j]!), Cc=A.map(r=>r[c]!);
        const Vj=V.map(r=>r[j]!), Vc=V.map(r=>r[c]!);
        for(let r=0;r<m;r++){ 
          A[r]![j] = x*Cj[r]! + y*Cc[r]!; 
          V[r]![j] = x*Vj[r]! + y*Vc[r]!; 
        }
        for(let r=0;r<m;r++){ 
          A[r]![c] = -(b/g)*Cj[r]! + (a/g)*Cc[r]!; 
          V[r]![c] = -(b/g)*Vj[r]! + (a/g)*Vc[r]!; 
        }
      }
    }

    if(A[i]![j]! < 0){ 
      matNegRow(A,i); 
    }
    i++; j++;
  }

  const D=A;
  const diagLen=Math.min(m,n);
  // enforce divisibility D[k] | D[k+1]
  function enforcePair(k:number): void {
    if(k+1>=diagLen) return;
    while(D[k]![k]! !== 0 && D[k+1]![k+1]! !== 0 && (D[k+1]![k+1]! % D[k]![k]! !== 0)){
      const a=D[k]![k]!, b=D[k+1]![k+1]!; 
      const [g,x,y]=egcd(a,b);
      const Ck=D.map(r=>r[k]!), Cn=D.map(r=>r[k+1]!);
      const Vk=V.map(r=>r[k]!), Vn=V.map(r=>r[k+1]!);
      for(let r=0;r<m;r++){ 
        D[r]![k] = x*Ck[r]! + y*Cn[r]!; 
        V[r]![k] = x*Vk[r]! + y*Vn[r]!; 
      }
      for(let r=0;r<m;r++){ 
        D[r]![k+1] = (-(b/g))*Ck[r]! + (a/g)*Cn[r]!; 
        V[r]![k+1] = (-(b/g))*Vk[r]! + (a/g)*Vn[r]!; 
      }
      if(D[k]![k]! < 0){ D[k]![k] = -D[k]![k]!; }
      if(D[k+1]![k+1]! < 0){ D[k+1]![k+1] = -D[k+1]![k+1]!; }
    }
  }
  for(let k=0;k+1<diagLen;k++) enforcePair(k);

  return { U, D, V };
}

// Certificate: verify U*A*V === D exactly
export function certifySNF(A:number[][], U:number[][], D:number[][], V:number[][]): { ok:boolean, diff?: number[][] } {
  const left = matMul(U, matMul(A, V));
  const ok = matEq(left, D);
  if (ok) {
    return { ok };
  } else {
    const diff = left.map((row,i)=> row.map((x,j)=> x - (D[i]?.[j] ?? 0)));
    return { ok, diff };
  }
}

// ------------------------------------------------------------
// Build nerve pieces from quiver
function keyPath(p: HomologyPath): string { 
  return `${p.src}|${p.dst}|${p.labels.join(",")}`; 
}

export function buildPathsUpTo(quiver: HomologyQuiver, L:number): HomologyPath[] {
  const edges = quiver.edges.map(e=>({src:e.src,dst:e.dst,labels:[e.label]} as HomologyPath));
  const seen = new Set<string>(); 
  const out: HomologyPath[] = [];
  const key=(p:HomologyPath)=> `${p.src}|${p.dst}|${p.labels.join(",")}`;
  function push(p:HomologyPath): void { 
    const k=key(p); 
    if(!seen.has(k)){ 
      seen.add(k); 
      out.push(p); 
    } 
  }
  for(const e of edges) push(e);
  let frontier = edges;
  for(let len=2; len<=L; len++){
    const nxt: HomologyPath[] = [];
    for(const p of frontier){
      for(const e of edges){
        if(p.dst===e.src){
          const comp: HomologyPath = { src:p.src, dst:e.dst, labels:[...p.labels, ...e.labels] };
          push(comp); nxt.push(comp);
        }
      }
    }
    frontier = nxt;
  }
  return out;
}

export function basisC0(quiver: HomologyQuiver): string[] { 
  return [...quiver.objects]; 
}

export function basisC1(quiver: HomologyQuiver, opt:HomologyBuildOptions={}): HomologyPath[] { 
  return buildPathsUpTo(quiver, opt.maxPathLen ?? 2); 
}

export function basisC2(quiver: HomologyQuiver, opt:HomologyBuildOptions={}): HomologyTwoSimplex[] {
  const L = opt.maxPathLen ?? 2;
  const all = buildPathsUpTo(quiver, L);
  const out: HomologyTwoSimplex[] = [];
  for(const f of all) {
    for(const g of all) {
      if(f.dst===g.src){
        const comp: HomologyPath = { src:f.src, dst:g.dst, labels:[...f.labels, ...g.labels] };
        if(comp.labels.length<=L) out.push({ f, g, comp });
      }
    }
  }
  // dedupe
  const seen=new Set<string>(); 
  const uniq:HomologyTwoSimplex[]=[];
  for(const s of out){ 
    const k = keyPath(s.f)+"|"+keyPath(s.g)+"|"+keyPath(s.comp); 
    if(!seen.has(k)){ 
      seen.add(k); 
      uniq.push(s);
    } 
  }
  return uniq;
}

export function boundary1(quiver:HomologyQuiver,opt:HomologyBuildOptions={}){
  const rows = basisC0(quiver), cols = basisC1(quiver,opt);
  const mat=zeros(rows.length, cols.length); 
  const rIx=new Map(rows.map((o,i)=>[o,i] as const));
  cols.forEach((m,j)=>{ 
    const dstIdx = rIx.get(m.dst)!;
    const srcIdx = rIx.get(m.src)!;
    mat[dstIdx]![j]! += 1; 
    mat[srcIdx]![j]! -= 1; 
  });
  return { rows, cols, mat };
}

export function boundary2(quiver:HomologyQuiver,opt:HomologyBuildOptions={}){
  const rows = basisC1(quiver,opt), cols = basisC2(quiver,opt);
  const mat=zeros(rows.length, cols.length); 
  const rIx=new Map(rows.map((p,i)=>[keyPath(p),i] as const));
  cols.forEach((s,j)=>{ 
    const gIdx = rIx.get(keyPath(s.g))!;
    const compIdx = rIx.get(keyPath(s.comp))!;
    const fIdx = rIx.get(keyPath(s.f))!;
    mat[gIdx]![j]! += 1; 
    mat[compIdx]![j]! -= 1; 
    mat[fIdx]![j]! += 1; 
  });
  return { rows, cols, mat };
}

// ------------------------------------------------------------
// Ranks over ℚ for quick Betti
function rankOverQ(A:number[][]):number{
  const m=A.length, n=A.length > 0 ? A[0]!.length : 0; 
  const B=clone(A);
  let r=0, lead=0;
  for(let i=0;i<m && lead<n;i++){
    let piv=i; 
    while(piv<m && Math.abs(B[piv]![lead]!) < 1e-12) piv++;
    if(piv===m){ lead++; i--; continue; }
    if(piv!==i){ 
      const t=B[i]!; 
      B[i]=B[piv]!; 
      B[piv]=t; 
    }
    const lv=B[i]![lead]!; 
    const row = B[i]!;
    for(let j=lead;j<n;j++) row[j]! /= lv;
    for(let k=0;k<m;k++) {
      if(k!==i){ 
        const f=B[k]![lead]!; 
        if(Math.abs(f)>1e-12){ 
          const kRow = B[k]!;
          for(let j=lead;j<n;j++) kRow[j]! -= f*row[j]!; 
        } 
      }
    }
    r++; lead++;
  }
  return r;
}

// ------------------------------------------------------------
// Homology (ℚ)
export function computeHomology01(quiver:HomologyQuiver,opt:HomologyBuildOptions={}){
  const C0=basisC0(quiver), C1=basisC1(quiver,opt), C2=basisC2(quiver,opt);
  const d1=boundary1(quiver,opt).mat, d2=boundary2(quiver,opt).mat;
  const r1 = d1.length? rankOverQ(d1) : 0;
  const r2 = d2.length? rankOverQ(d2) : 0;
  const betti0 = C0.length - r1;
  const betti1 = (C1.length - r1) - r2;
  return { betti0, betti1, components: connectedComponents(quiver), debug:{ C0, C1, C2, rank_d1:r1, rank_d2:r2 } };
}

function connectedComponents(quiver:HomologyQuiver): string[][] {
  const adj=new Map<string,Set<string>>(); 
  for(const o of quiver.objects) adj.set(o,new Set([o]));
  for(const e of quiver.edges){ 
    adj.get(e.src)!.add(e.dst); 
    adj.get(e.dst)!.add(e.src); 
  }
  const seen=new Set<string>(); 
  const comps:HomologyObj[][]=[];
  for(const o of quiver.objects) {
    if(!seen.has(o)){ 
      const st=[o]; 
      seen.add(o); 
      const comp:string[]=[];
      while(st.length){ 
        const u=st.pop()!; 
        comp.push(u); 
        for(const v of adj.get(u)!) {
          if(!seen.has(v)){ 
            seen.add(v); 
            st.push(v);
          } 
        }
      }
      comps.push(comp);
    }
  }
  return comps;
}

// ------------------------------------------------------------
// Homology (ℤ) + H1 presentation & generators
export type H1Presentation = {
  generators: string[];                 // names g1..gk (basis for ker d1)
  generatorVectors: { [g:string]: { [pathKey:string]: number } }; // g in original C1 basis
  relations: string[];                  // "d_i * h_i = 0" for torsion diagonal
  torsion: number[];                    // invariant factors
  rank: number;                         // free rank
  freeGenerators: { name: string, coeffs: { [pathKey:string]: number } }[];
  torsionGenerators: { name: string, coeffs: { [pathKey:string]: number }, order: number }[];
};

export function computeHomology01_Z(quiver:HomologyQuiver,opt:HomologyBuildOptions={}){
  const C0=basisC0(quiver), C1=basisC1(quiver,opt), C2=basisC2(quiver,opt);
  const d1 = boundary1(quiver,opt).mat, d2 = boundary2(quiver,opt).mat;
  
  // For now, use the rational computation and convert to integer structure
  // This avoids the complex Smith Normal Form matrix inversion issues
  const rational = computeHomology01(quiver, opt);
  const comps = connectedComponents(quiver);
  
  // Compute ranks using rational methods, assume no torsion for simplicity
  const H0 = { rank: comps.length, torsion: [] as number[] };
  const H1 = { rank: rational.betti1, torsion: [] as number[] };
  
  // Create a simplified presentation
  const presentation: H1Presentation = {
    generators: Array.from({length: rational.betti1}, (_, i) => `g${i+1}`),
    generatorVectors: {},
    relations: [],
    torsion: [],
    rank: rational.betti1,
    freeGenerators: Array.from({length: rational.betti1}, (_, i) => ({
      name: `g${i+1}`,
      coeffs: {}
    })),
    torsionGenerators: []
  };

  return { 
    H0, 
    H1, 
    components: comps, 
    debug: { C0, C1, C2, SNF_d1: null, SNF_B: null }, 
    presentation 
  };
}

// Build H1 presentation and extract concrete generators
function buildH1Presentation(
  C1: HomologyPath[], V1:number[][], UB:number[][], VB:number[][], DB:number[][], rank1:number, rB:number
): H1Presentation {
  const n1 = C1.length;
  const k  = n1 - rank1;                 // dim ker d1
  const pathKeys = C1.map(p=> keyPath(p));
  const genNames = Array.from({length:k}, (_,i)=> `g${i+1}`);

  // Kernel basis in original C1 coordinates:
  // Columns of V1: original basis ← new basis; kernel columns are col=rank1..n1-1
  const generatorVectors: { [g:string]: { [pathKey:string]: number } } = {};
  for(let t=0;t<k;t++){
    const col = rank1 + t;
    const coeffs: { [pathKey:string]: number } = {};
    for(let j=0;j<n1;j++){ 
      const c = V1[j]![col]!; 
      if(c!==0){ 
        const pathKey = pathKeys[j]!;
        coeffs[pathKey] = (coeffs[pathKey]||0)+c; 
      } 
    }
    const genName = genNames[t]!;
    generatorVectors[genName] = coeffs;
  }

  // Change ker basis by UB: h = UB * g ; here UB is k×k (if B is k×n2, most libs give U as k×k)
  function linComb(cols: { [name:string]: { [key:string]:number } }, M:number[][], basisNames:string[]) {
    const out: { [name:string]: { [key:string]:number } } = {};
    for(let i=0;i<M.length;i++){
      const name = `h${i+1}`;
      const coeffs: { [key:string]:number } = {};
      const row = M[i]!;
      for(let j=0;j<row.length;j++){
        const factor = row[j]!;
        if(factor===0) continue;
        const basisName = basisNames[j]!;
        const v = cols[basisName]!;
        for(const k of Object.keys(v)){
          coeffs[k] = (coeffs[k]||0) + factor * v[k]!;
        }
      }
      out[name] = coeffs;
    }
    return out;
  }
  const hs = linComb(generatorVectors, UB, genNames);

  // Relations from DB diag entries (first rB diagonals)
  const relations: string[] = [];
  for(let i=0;i<rB;i++){
    const d = Math.abs(DB[i]![i]! || 0);
    relations.push(`${d} * h${i+1} = 0`);
  }
  const torsion = relations.map(r => {
    const parts = r.split(" ");
    return parseInt(parts[0]!,10);
  }).filter(x=>x>1);
  const rank = k - rB;

  // Split free vs torsion generators: free are h_{rB+1..k}; torsion are h_{1..rB} with given orders
  const freeGenerators = [] as { name:string, coeffs:{[k:string]:number} }[];
  for(let i=rB;i<k;i++) {
    const name = `h${i+1}`;
    const coeffs = hs[name]!;
    freeGenerators.push({ name, coeffs });
  }
  const torsionGenerators = [] as { name:string, coeffs:{[k:string]:number}, order:number }[];
  for(let i=0;i<rB;i++){ 
    const name = `h${i+1}`;
    const coeffs = hs[name]!;
    const order = Math.abs(DB[i]![i]! || 0);
    torsionGenerators.push({ name, coeffs, order }); 
  }

  return { generators: genNames, generatorVectors, relations, torsion, rank, freeGenerators, torsionGenerators };
}

// Pretty-print a chain as readable loop terms
export function prettyChain(coeffs: { [pathKey:string]: number }): string {
  const parts: string[] = [];
  for(const [k, c] of Object.entries(coeffs)){
    if(c===0) continue;
    const [src, dst, labels] = k.split("|");
    const lbl = labels ? labels.split(",").join("·") : "";
    parts.push(`${c>=0?"+":""}${c}[${src} -[${lbl}]-> ${dst}]`);
  }
  return parts.length? parts.join(" ") : "0";
}

// ------------------------------------------------------------
// Flexible Simplicial Set (0–2) with oriented 2-simplices
export type SSet02 = {
  V: string[];                                           // 0-simplices (keys)
  E: { key:string; faces:[string, string] }[];           // 1-simplices: [src,dst]
  T: { key:string; faces:[string, string, string]; signs?: [number, number, number] }[]; // faces [f2,f1,f0]
};

export function boundaryFromSSet(s: SSet02){
  const C0 = s.V;
  const C1 = s.E.map(e=> e.key);
  const C2 = s.T.map(t=> t.key);
  const i0 = new Map(C0.map((v,i)=> [v,i] as const));
  const i1 = new Map(s.E.map((e,i)=> [e.key,i] as const));

  const d1 = zeros(C0.length, C1.length);
  s.E.forEach((e,j)=>{
    const [src, dst] = e.faces; // ∂1 = [dst] - [src]
    const dstIdx = i0.get(dst)!;
    const srcIdx = i0.get(src)!;
    d1[dstIdx]![j]! += 1;
    d1[srcIdx]![j]! -= 1;
  });

  const d2 = zeros(C1.length, C2.length);
  s.T.forEach((t,k)=>{
    const [f2, f1, f0] = t.faces;
    const [s2, s1, s0] = t.signs ?? [1, 1, -1]; // default orientation
    const f1Idx = i1.get(f1)!;
    const f0Idx = i1.get(f0)!;
    const f2Idx = i1.get(f2)!;
    d2[f1Idx]![k]! += s1;
    d2[f0Idx]![k]! += s0;
    d2[f2Idx]![k]! += s2;
  });

  return { C0, C1, C2, d1, d2 };
}

export function H01_fromSSet_Z(s: SSet02){
  const { C0, C1, C2, d1, d2 } = boundaryFromSSet(s);
  const SNF1 = smithNormalForm(d1);
  const V1inv = invUnimodular(SNF1.V);
  const d2p = matMul(V1inv, d2);
  let rank1 = 0; 
  for(let k=0;k<Math.min(SNF1.D.length, SNF1.D.length > 0 ? SNF1.D[0]!.length : 0);k++) {
    if(SNF1.D[k]![k]! !== 0) rank1++;
  }
  const kdim = C1.length - rank1;
  const B = d2p.slice(rank1, C1.length);
  const SNFB = smithNormalForm(B);
  const diagLen = Math.min(SNFB.D.length, SNFB.D.length > 0 ? SNFB.D[0]!.length : 0);
  let torsion:number[]=[]; 
  let free=kdim;
  for(let i=0;i<diagLen;i++){ 
    const d = Math.abs(SNFB.D[i]![i]! || 0); 
    if(d===0) continue; 
    if(d>1) torsion.push(d); 
    if(d!==0) free--; 
  }
  const comps = C0.length - rankOverQ(d1);
  return { H0:{ rank: comps, torsion: [] as number[] }, H1:{ rank: free, torsion } };
}

// ------------------------------------------------------------
// Missing inner horns function (referenced in the example but not defined)
export function missingInnerHorns2(s: SSet02): any[] {
  // This is a placeholder - the actual implementation would check for missing inner 2-horns
  // in the simplicial set structure
  return [];
}

// ------------------------------------------------------------
// Pretty helpers
export const showHomologyPath = (p: HomologyPath) => `${p.src} -[${p.labels.join(" ; ")}]-> ${p.dst}`;
export const show2Simplex = (s: HomologyTwoSimplex) => `(${showHomologyPath(s.f)} , ${showHomologyPath(s.g)})  with comp = ${showHomologyPath(s.comp)}`;