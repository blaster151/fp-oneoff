// sset-quasicat.ts
// Inner-horn checks for small simplicial sets (up to n=3) and isQuasiCategory(S).
// Includes a tiny nerve builder for finite categories (posets) and demos.
//
// This extends the existing nerve construction to higher dimensions and provides
// practical quasi-category checking for finite simplicial sets.

/************ Simplicial set up to dimension 3 ************/
export type Obj = string;

export type Edge = { key:string; src:Obj; dst:Obj };
// 2-simplex with edges e01, e12, e02 (naming by vertices 0,1,2)
export type Tri = { key:string; e01:string; e12:string; e02:string };
// 3-simplex with faces (by missing vertex): d3=012, d2=013, d1=023, d0=123
export type Tet = { key:string; d3:string; d2:string; d1:string; d0:string };

export type SSetUpTo3 = {
  V: Obj[];
  E: Edge[];
  T2: Tri[];
  T3?: Tet[];
};

function edgeMap(S:SSetUpTo3): Map<string, Edge> { 
  const m=new Map<string,Edge>(); 
  for(const e of S.E) m.set(e.key, e); 
  return m; 
}

function triMap(S:SSetUpTo3): Map<string, Tri> { 
  const m=new Map<string,Tri>(); 
  for(const t of S.T2) m.set(t.key, t); 
  return m; 
}

function tetMap(S:SSetUpTo3): Map<string, Tet> { 
  const m=new Map<string,Tet>(); 
  for(const t of (S.T3??[])) m.set(t.key, t); 
  return m; 
}

/************ Horn enumeration helpers ************/
// Λ^2_1 horns: specified by composable pair e01, e12. Needs edge e02 and a triangle filler.
export type Horn2 = { e01:string; e12:string; need_e02: {src:Obj; dst:Obj} };

export function enumerateInnerHorns2(S:SSetUpTo3): Horn2[] {
  const horns: Horn2[] = [];
  const E = edgeMap(S);
  // For every pair of edges with matching middle vertex
  for(const e1 of S.E){ // e01
    for(const e2 of S.E){ // e12
      if (e1.dst !== e2.src) continue;
      horns.push({ e01: e1.key, e12: e2.key, need_e02: { src: e1.src, dst: e2.dst } });
    }
  }
  return horns;
}

export type Horn2Check = { horn: Horn2; hasEdge:boolean; hasTri:boolean };

export function checkHorns2(S:SSetUpTo3): Horn2Check[] {
  const E = edgeMap(S), T = triMap(S);
  const out: Horn2Check[] = [];
  for(const h of enumerateInnerHorns2(S)){
    // Is there an e02 with src->dst?
    const hasEdge = !!S.E.find(e => e.src===h.need_e02.src && e.dst===h.need_e02.dst);
    // Is there a triangle whose two sides match e01,e12 and whose third spans src→dst?
    let hasTri = false;
    for(const t of S.T2){
      if (t.e01===h.e01 && t.e12===h.e12) {
        const e02 = E.get(t.e02);
        if (e02 && e02.src===h.need_e02.src && e02.dst===h.need_e02.dst) { 
          hasTri = true; 
          break; 
        }
      }
    }
    out.push({ horn: h, hasEdge, hasTri });
  }
  return out;
}

// Λ^3_i inner horns for i=1,2: given three 2-faces of a tetrahedron sharing all but the inner face.
// We check whether some Tet in S has those three faces.
export type Horn3 = { missing: 1|2; faces: { d3?:string; d2?:string; d1?:string; d0?:string } };

export function enumerateInnerHorns3(S:SSetUpTo3): Horn3[] {
  const horns: Horn3[] = [];
  // Build all candidate triples from existing T3 fillers (for coverage) and also from chains of triangles.
  for(const t of (S.T3??[])){
    horns.push({ missing: 1, faces: { d3:t.d3, d2:t.d2, d0:t.d0 } }); // missing d1
    horns.push({ missing: 2, faces: { d3:t.d3, d1:t.d1, d0:t.d0 } }); // missing d2
  }
  // Also enumerate along edge-chains X0->X1->X2->X3 using triangles in S:
  // We look for t012, t013, t123, t023 present combinations.
  const T = triMap(S);
  const Ts = S.T2.map(t=>t.key);
  for(const t012 of Ts){
    for(const t013 of Ts){
      for(const t123 of Ts){
        horns.push({ missing: 1, faces: { d3:t012, d2:t013, d0:t123 } });
      }
    }
  }
  for(const t012 of Ts){
    for(const t023 of Ts){
      for(const t123 of Ts){
        horns.push({ missing: 2, faces: { d3:t012, d1:t023, d0:t123 } });
      }
    }
  }
  // Dedup naive list
  const seen = new Set<string>(); 
  const uniq: Horn3[] = [];
  for(const h of horns){
    const key = `${h.missing}|${h.faces.d3??""}|${h.faces.d2??""}|${h.faces.d1??""}|${h.faces.d0??""}`;
    if (!seen.has(key)){ 
      seen.add(key); 
      uniq.push(h); 
    }
  }
  return uniq;
}

export type Horn3Check = { horn: Horn3; hasTet:boolean };

export function checkHorns3(S:SSetUpTo3): Horn3Check[] {
  const T3 = tetMap(S);
  const out: Horn3Check[] = [];
  for(const h of enumerateInnerHorns3(S)){
    let hasTet = false;
    for (const tet of (S.T3??[])){
      if (h.missing===1){
        if (tet.d3===h.faces.d3 && tet.d2===h.faces.d2 && tet.d0===h.faces.d0){ 
          hasTet = true; 
          break; 
        }
      } else {
        if (tet.d3===h.faces.d3 && tet.d1===h.faces.d1 && tet.d0===h.faces.d0){ 
          hasTet = true; 
          break; 
        }
      }
    }
    out.push({ horn: h, hasTet });
  }
  return out;
}

/************ Quasi-category tester ************/
export type QCReport = {
  nMax: number;
  horns2: { total:number; filled:number; examplesMissing: number };
  horns3?: { total:number; filled:number; examplesMissing: number };
  isQuasiCategory: boolean;
};

export function isQuasiCategory(S:SSetUpTo3, nMax:number=3): QCReport {
  const c2 = checkHorns2(S);
  const horns2 = { 
    total: c2.length, 
    filled: c2.filter(x=>x.hasEdge && x.hasTri).length, 
    examplesMissing: c2.filter(x=>!(x.hasEdge && x.hasTri)).length 
  };
  
  let horns3: { total:number; filled:number; examplesMissing: number } | undefined;
  let isQuasiCat = horns2.examplesMissing === 0;
  
  if (nMax>=3){
    const c3 = checkHorns3(S);
    horns3 = { 
      total: c3.length, 
      filled: c3.filter(x=>x.hasTet).length, 
      examplesMissing: c3.filter(x=>!x.hasTet).length 
    };
    isQuasiCat = isQuasiCat && horns3.examplesMissing === 0;
  }
  
  const result: QCReport = {
    nMax,
    horns2,
    isQuasiCategory: isQuasiCat
  };
  
  if (horns3) {
    result.horns3 = horns3;
  }
  
  return result;
}

/************ Tiny nerve of a finite category (poset) ************/
// Build nerve up to 3 for a finite poset (objects + ≤).
// - Edges: all x≤y as 1-simplices
// - Triangles: for all x≤y≤z (composable pairs) with e02 the composite x≤z
// - Tetrahedra: for chains x≤y≤z≤w, faces are the evident 2-simplices.
export function nerveOfPoset(V:Obj[], leq:(x:Obj,y:Obj)=>boolean): SSetUpTo3 {
  const E: Edge[] = [];
  for(const x of V) {
    for(const y of V) {
      if (leq(x,y)) {
        E.push({ key:`e(${x},${y})`, src:x, dst:y });
      }
    }
  }
  
  const triKey = (x:Obj,y:Obj,z:Obj)=> `t(${x},${y},${z})`;
  const T2: Tri[] = [];
  for(const x of V) {
    for(const y of V) {
      for(const z of V) {
        if (leq(x,y) && leq(y,z) && leq(x,z)){
          T2.push({ 
            key: triKey(x,y,z), 
            e01:`e(${x},${y})`, 
            e12:`e(${y},${z})`, 
            e02:`e(${x},${z})` 
          });
        }
      }
    }
  }
  
  const T3: Tet[] = [];
  const tetKey = (w:Obj,x:Obj,y:Obj,z:Obj)=> `T(${w},${x},${y},${z})`;
  for(const w of V) {
    for(const x of V) {
      for(const y of V) {
        for(const z of V){
          if (leq(w,x) && leq(x,y) && leq(y,z)){
            const t012 = triKey(w,x,y);
            const t013 = triKey(w,x,z);
            const t023 = triKey(w,y,z);
            const t123 = triKey(x,y,z);
            T3.push({ 
              key: tetKey(w,x,y,z), 
              d3:t012, 
              d2:t013, 
              d1:t023, 
              d0:t123 
            });
          }
        }
      }
    }
  }
  
  return { V, E, T2, T3 };
}

/************ Pretty printing helpers ************/
export function printQCReport(rep: QCReport): void {
  console.log(`Quasi-category check (up to n=${rep.nMax}):`);
  console.log(`  Λ²₁ horns: ${rep.horns2.filled}/${rep.horns2.total} filled`);
  if (rep.horns3) {
    console.log(`  Λ³₁,Λ³₂ horns: ${rep.horns3.filled}/${rep.horns3.total} filled`);
  }
  console.log(`  Is quasi-category: ${rep.isQuasiCategory}`);
}

export function printMissingHorns2(S: SSetUpTo3, limit: number = 3): void {
  const misses = checkHorns2(S).filter(x => !(x.hasEdge && x.hasTri)).slice(0, limit);
  if (misses.length > 0) {
    console.log(`Missing Λ²₁ horns (first ${limit}):`);
    for (const h of misses) {
      console.log(`  ${h.horn.e01} ∘ ${h.horn.e12} needs ${h.horn.need_e02.src}→${h.horn.need_e02.dst}, hasEdge:${h.hasEdge}, hasTri:${h.hasTri}`);
    }
  }
}