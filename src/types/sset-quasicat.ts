// sset-quasicat.ts
// Horn checks (inner+outer up to n=3) with witnesses, general builder/validator,
// degeneracy generation, oriented-by-vertices helpers,
// **fillHorn** to materialize fillers, and **toChainComplex** for H₀/H₁-style work.
//
// Run: ts-node sset-quasicat.ts

/************ Simplicial set up to dimension 3 ************/
export type Obj = string;

export type Edge = {
  key:string; src:Obj; dst:Obj;
  degenerate?: { of:"V"; v:Obj; s:0 }; // s0(v): edge v->v
};

export type Tri = {
  key:string; e01:string; e12:string; e02:string;
  verts?: [Obj,Obj,Obj];
  degenerate?: { of:"E"; key:string; s:0|1 }; // s0/s1 applied to an edge
};

export type Tet = {
  key:string; d3:string; d2:string; d1:string; d0:string;
  verts?: [Obj,Obj,Obj,Obj];
  degenerate?: { of:"T2"; key:string; s:0|1|2 }; // s_i applied to triangle
};

export type SSetUpTo3 = {
  V: Obj[];
  E: Edge[];
  T2: Tri[];
  T3?: Tet[];
};

/************ Maps ************/
const edgeMap = (S:SSetUpTo3) => new Map(S.E.map(e=>[e.key,e] as const));
const triMap  = (S:SSetUpTo3) => new Map((S.T2??[]).map(t=>[t.key,t] as const));
const tetMap  = (S:SSetUpTo3) => new Map((S.T3??[]).map(T=>[T.key,T] as const));

/************ Utilities ************/
function ensureEdge(S:SSetUpTo3, src:Obj, dst:Obj, key?:string): Edge {
  const k = key ?? `e(${src},${dst})`;
  const em = edgeMap(S);
  const ex = em.get(k) || S.E.find(e=>e.src===src && e.dst===dst);
  if (ex) return ex;
  const ne: Edge = { key:k, src, dst };
  S.E.push(ne);
  return ne;
}

function addTriangle(S:SSetUpTo3, e01:string, e12:string, e02:string, key?:string, verts?:[Obj,Obj,Obj], deg?:Tri["degenerate"]): Tri {
  const k = key ?? `t(${e01}|${e12}|${e02})`;
  if (triMap(S).has(k)) return triMap(S).get(k)!;
  const t: Tri = { key:k, e01, e12, e02 };
  if (verts) t.verts = verts;
  if (deg) t.degenerate = deg;
  S.T2.push(t);
  return t;
}

function addTetra(S:SSetUpTo3, faces:{d3:string; d2:string; d1:string; d0:string}, key?:string, verts?:[Obj,Obj,Obj,Obj], deg?:Tet["degenerate"]): Tet {
  const k = key ?? `T(${faces.d3}|${faces.d2}|${faces.d1}|${faces.d0})`;
  if (!S.T3) S.T3 = [];
  if (tetMap(S).has(k)) return tetMap(S).get(k)!;
  const T: Tet = { key:k, ...faces };
  if (verts) T.verts = verts;
  if (deg) T.degenerate = deg;
  S.T3.push(T);
  return T;
}

/************ General SSet builder ************/
export function makeSSet(
  V: Obj[],
  edges: Array<{src:Obj; dst:Obj; key?:string}>,
  triangles?: Array<
    | { e01:string; e12:string; e02:string; key?:string }
    | { verts:[Obj,Obj,Obj]; key?:string }
  >,
  tets?: Array<
    | { d3:string; d2:string; d1:string; d0:string; key?:string }
    | { verts:[Obj,Obj,Obj,Obj]; key?:string }
  >
): SSetUpTo3 {
  const S: SSetUpTo3 = { V:[...V], E:[], T2:[], T3:[] };
  // edges
  for(const e of edges){ ensureEdge(S, e.src, e.dst, e.key); }
  // triangles
  for(const t of (triangles ?? [])){
    if ("verts" in t){
      const [v0,v1,v2] = t.verts;
      const e01 = ensureEdge(S, v0, v1).key;
      const e12 = ensureEdge(S, v1, v2).key;
      const e02 = ensureEdge(S, v0, v2).key;
      addTriangle(S, e01, e12, e02, t.key, [v0,v1,v2]);
    } else {
      addTriangle(S, t.e01, t.e12, t.e02, t.key);
    }
  }
  // tetrahedra
  for(const T of (tets ?? [])){
    if ("verts" in T){
      const [w,x,y,z] = T.verts;
      const triKey = (a:Obj,b:Obj,c:Obj)=> `t(${a},${b},${c})`;
      const e01 = ensureEdge(S,w,x).key, e12=ensureEdge(S,x,y).key, e02=ensureEdge(S,w,y).key;
      const e01b= ensureEdge(S,w,x).key, e12b=ensureEdge(S,x,z).key, e02b=ensureEdge(S,w,z).key;
      const e01c= ensureEdge(S,x,y).key, e12c=ensureEdge(S,y,z).key, e02c=ensureEdge(S,x,z).key;
      const e01d= ensureEdge(S,w,y).key, e12d=ensureEdge(S,y,z).key, e02d=ensureEdge(S,w,z).key;
      const d3 = addTriangle(S,e01,e12,e02,triKey(w,x,y),[w,x,y]).key;
      const d2 = addTriangle(S,e01b,e12b,e02b,triKey(w,x,z),[w,x,z]).key;
      const d1 = addTriangle(S,e01d,e12d,e02d,triKey(w,y,z),[w,y,z]).key;
      const d0 = addTriangle(S,e01c,e12c,e02c,triKey(x,y,z),[x,y,z]).key;
      addTetra(S, {d3,d2,d1,d0}, T.key, [w,x,y,z]);
    } else {
      addTetra(S, T);
    }
  }
  return S;
}

/************ Validator ************/
export function validateSSet(S:SSetUpTo3): { ok:boolean; errors:string[] } {
  const errs:string[] = [];
  const E = edgeMap(S);
  const seenE = new Set<string>();
  for(const e of S.E){
    if (seenE.has(e.key)) errs.push(`Duplicate edge key ${e.key}`);
    seenE.add(e.key);
    if (e.degenerate?.of==="V"){
      if (!S.V.includes(e.degenerate.v)) errs.push(`Edge ${e.key} marks degeneracy of missing vertex ${e.degenerate.v}`);
      if (!(e.src===e.degenerate.v && e.dst===e.degenerate.v)) errs.push(`Edge ${e.key} degeneracy shape wrong (expected loop on v)`);
    }
  }
  const T = triMap(S);
  for(const t of S.T2){
    const e01 = E.get(t.e01), e12 = E.get(t.e12), e02 = E.get(t.e02);
    if (!e01) errs.push(`Triangle ${t.key} missing e01=${t.e01}`);
    if (!e12) errs.push(`Triangle ${t.key} missing e12=${t.e12}`);
    if (!e02) errs.push(`Triangle ${t.key} missing e02=${t.e02}`);
    if (e01 && e12 && e02){
      if (e01.dst !== e12.src) errs.push(`Tri ${t.key} endpoints mismatch: e01.dst=${e01?.dst} vs e12.src=${e12?.src}`);
      if (e01.src !== e02.src) errs.push(`Tri ${t.key} endpoints mismatch: e01.src=${e01?.src} vs e02.src=${e02?.src}`);
      if (e12.dst !== e02.dst) errs.push(`Tri ${t.key} endpoints mismatch: e12.dst=${e12?.dst} vs e02.dst=${e02?.dst}`);
    }
    if (t.degenerate?.of==="E"){
      const base = E.get(t.degenerate.key);
      if (!base) errs.push(`Triangle ${t.key} degenerates unknown edge ${t.degenerate.key}`);
    }
  }
  for(const T3 of (S.T3 ?? [])){
    if (!T.get(T3.d3)) errs.push(`Tet ${T3.key} missing face d3=${T3.d3}`);
    if (!T.get(T3.d2)) errs.push(`Tet ${T3.key} missing face d2=${T3.d2}`);
    if (!T.get(T3.d1)) errs.push(`Tet ${T3.key} missing face d1=${T3.d1}`);
    if (!T.get(T3.d0)) errs.push(`Tet ${T3.key} missing face d0=${T3.d0}`);
  }
  return { ok: errs.length===0, errors: errs };
}

/************ Horn enumeration & checks (2D inner/outer) ************/
export type Horn2Inner = { tag:"inner"; e01:string; e12:string; need_e02: {src:Obj; dst:Obj} };

export function enumerateInnerHorns2(S:SSetUpTo3): Horn2Inner[] {
  const horns: Horn2Inner[] = [];
  for(const e1 of S.E){
    for(const e2 of S.E){
      if (e1.dst !== e2.src) continue;
      horns.push({ tag:"inner", e01:e1.key, e12:e2.key, need_e02:{src:e1.src, dst:e2.dst} });
    }
  }
  return horns;
}

export type Horn2InnerCheck = { horn: Horn2Inner; hasEdge:boolean; fillers: string[] };

export function checkHorns2Inner(S:SSetUpTo3): Horn2InnerCheck[] {
  const E = edgeMap(S);
  const out: Horn2InnerCheck[] = [];
  for(const h of enumerateInnerHorns2(S)){
    const hasEdge = !!S.E.find(e => e.src===h.need_e02.src && e.dst===h.need_e02.dst);
    const fillers:string[] = [];
    for(const t of S.T2){
      if (t.e01===h.e01 && t.e12===h.e12){
        const e02 = E.get(t.e02);
        if (e02 && e02.src===h.need_e02.src && e02.dst===h.need_e02.dst) { 
          fillers.push(t.key); 
        }
      }
    }
    out.push({ horn: h, hasEdge, fillers });
  }
  return out;
}

// Outer horns Λ^2_0 and Λ^2_2 (informational)
export type Horn2Outer =
  | { tag:"outer0"; e01:string; e02:string; need_e12: {src:Obj; dst:Obj} }
  | { tag:"outer2"; e12:string; e02:string; need_e01: {src:Obj; dst:Obj} };

export function enumerateOuterHorns2(S:SSetUpTo3): Horn2Outer[] {
  const horns: Horn2Outer[] = [];
  for(const e01 of S.E){
    for(const e02 of S.E){
      if (e01.src !== e02.src) continue;
      horns.push({ tag:"outer0", e01:e01.key, e02:e02.key, need_e12:{src:e01.dst, dst:e02.dst} });
    }
  }
  for(const e12 of S.E){
    for(const e02 of S.E){
      if (e12.dst !== e02.dst) continue;
      horns.push({ tag:"outer2", e12:e12.key, e02:e02.key, need_e01:{src:e02.src, dst:e12.src} });
    }
  }
  return horns;
}

export type Horn2OuterCheck = { horn: Horn2Outer; hasEdge:boolean; fillers: string[] };

export function checkHorns2Outer(S:SSetUpTo3): Horn2OuterCheck[] {
  const E = edgeMap(S);
  const out: Horn2OuterCheck[] = [];
  for(const h of enumerateOuterHorns2(S)){
    if (h.tag==="outer0"){
      const hasEdge = !!S.E.find(e => e.src===h.need_e12.src && e.dst===h.need_e12.dst);
      const triFillers = (S.T2??[]).filter(t => {
        const e01 = E.get(t.e01), e12 = E.get(t.e12), e02 = E.get(t.e02);
        if (!e01 || !e12 || !e02) return false;
        const h_e01 = E.get(h.e01)!, h_e02 = E.get(h.e02)!;
        return e01.key===h_e01.key && e02.key===h_e02.key &&
               e12.src===h.need_e12.src && e12.dst===h.need_e12.dst;
      }).map(t=>t.key);
      out.push({ horn: h, hasEdge, fillers: triFillers });
    } else {
      const hasEdge = !!S.E.find(e => e.src===h.need_e01.src && e.dst===h.need_e01.dst);
      const triFillers = (S.T2??[]).filter(t => {
        const e01 = E.get(t.e01), e12 = E.get(t.e12), e02 = E.get(t.e02);
        if (!e01 || !e12 || !e02) return false;
        const h_e12 = E.get(h.e12)!, h_e02 = E.get(h.e02)!;
        return e12.key===h_e12.key && e02.key===h_e02.key &&
               e01.src===h.need_e01.src && e01.dst===h.need_e01.dst;
      }).map(t=>t.key);
      out.push({ horn: h, hasEdge, fillers: triFillers });
    }
  }
  return out;
}

/************ 3D inner horns ************/
export type Horn3 = { missing: 1|2; faces: { d3?:string; d2?:string; d1?:string; d0?:string } };

export function enumerateInnerHorns3(S:SSetUpTo3): Horn3[] {
  const horns: Horn3[] = [];
  // From existing tetrahedra
  for(const t of (S.T3??[])){
    horns.push({ missing: 1, faces: { d3:t.d3, d2:t.d2, d0:t.d0 } }); // missing d1
    horns.push({ missing: 2, faces: { d3:t.d3, d1:t.d1, d0:t.d0 } }); // missing d2
  }
  // From all triples of 2-faces (broad over-approx for small finite S):
  const Ts = (S.T2??[]).map(t=>t.key);
  for(const d3 of Ts) {
    for(const d2 of Ts) {
      for(const d0 of Ts) {
        horns.push({ missing:1, faces:{d3,d2,d0} });
      }
    }
  }
  for(const d3 of Ts) {
    for(const d1 of Ts) {
      for(const d0 of Ts) {
        horns.push({ missing:2, faces:{d3,d1,d0} });
      }
    }
  }
  // Dedup
  const seen = new Set<string>(), out: Horn3[] = [];
  for(const h of horns){
    const key = `${h.missing}|${h.faces.d3??""}|${h.faces.d2??""}|${h.faces.d1??""}|${h.faces.d0??""}`;
    if (!seen.has(key)){ seen.add(key); out.push(h); }
  }
  return out;
}

export type Horn3Check = { horn: Horn3; fillers: string[] };

export function checkHorns3(S:SSetUpTo3): Horn3Check[] {
  const out: Horn3Check[] = [];
  for(const h of enumerateInnerHorns3(S)){
    const fillers = (S.T3??[]).filter(T => {
      if (h.missing===1) return T.d3===h.faces.d3 && T.d2===h.faces.d2 && T.d0===h.faces.d0;
      else              return T.d3===h.faces.d3 && T.d1===h.faces.d1 && T.d0===h.faces.d0;
    }).map(T=>T.key);
    out.push({ horn: h, fillers });
  }
  return out;
}

/************ Quasi-category tester ************/
export type QCReport = {
  nMax: number;
  horns2: { total:number; filled:number; examplesMissing: number };
  horns3?: { total:number; filled:number; examplesMissing: number };
  outer2?: { total:number; filled:number; examplesMissing: number }; // informational
  isQuasiCategory: boolean;
};

export function isQuasiCategory(S:SSetUpTo3, nMax:number=3): QCReport {
  const c2 = checkHorns2Inner(S);
  const horns2 = { 
    total: c2.length, 
    filled: c2.filter(x=>x.hasEdge && x.fillers.length>0).length, 
    examplesMissing: c2.filter(x=>!(x.hasEdge && x.fillers.length>0)).length 
  };
  
  let horns3: { total:number; filled:number; examplesMissing: number } | undefined;
  let isQuasiCat = horns2.examplesMissing === 0;
  
  if (nMax>=3){
    const c3 = checkHorns3(S);
    horns3 = { 
      total: c3.length, 
      filled: c3.filter(x=>x.fillers.length>0).length, 
      examplesMissing: c3.filter(x=>x.fillers.length===0).length 
    };
    isQuasiCat = isQuasiCat && horns3.examplesMissing === 0;
  }
  
  const o2 = checkHorns2Outer(S);
  const outer2 = { 
    total: o2.length, 
    filled: o2.filter(x=>x.hasEdge && x.fillers.length>0).length, 
    examplesMissing: o2.filter(x=>!(x.hasEdge && x.fillers.length>0)).length 
  };
  
  const result: QCReport = {
    nMax,
    horns2,
    outer2,
    isQuasiCategory: isQuasiCat
  };
  
  if (horns3) {
    result.horns3 = horns3;
  }
  
  return result;
}

/************ Degeneracy generation ************/
function triFaceEdgeKey(S:SSetUpTo3, tri:Tri, j:0|1|2): string {
  // d0 = e12; d1 = e02; d2 = e01
  return j===0 ? tri.e12 : (j===1 ? tri.e02 : tri.e01);
}

export function generateDegeneracies(S:SSetUpTo3, upTo:number=3): void {
  const E = edgeMap(S);
  // s0 on vertices -> edges v->v
  for (const v of S.V){
    const loop = ensureEdge(S, v, v);
    if (!loop.degenerate) loop.degenerate = { of:"V", v, s:0 };
  }
  if (upTo<2) return;
  
  // s0/s1 on edges -> triangles
  for(const e of [...S.E]){
    const x=e.src, y=e.dst; const eKey=e.key;
    const e_xx = ensureEdge(S, x, x).key;
    const e_xy = ensureEdge(S, x, y).key;
    const e_yy = ensureEdge(S, y, y).key;
    addTriangle(S, e_xx, e_xy, e_xy, `sd0[${eKey}]`, [x,x,y], { of:"E", key:eKey, s:0 });
    addTriangle(S, e_xy, e_yy, e_xy, `sd1[${eKey}]`, [x,y,y], { of:"E", key:eKey, s:1 });
  }
  if (upTo<3) return;
  
  // s_i on triangles -> tetrahedra
  const T = triMap(S); 
  const E2 = edgeMap(S);
  for(const t of [...S.T2]){
    if (t.degenerate) continue; // skip already degenerate triangles
    const v0 = E2.get(t.e01)!.src, v1 = E2.get(t.e01)!.dst, v2 = E2.get(t.e12)!.dst;
    
    const degTri = (edgeKey:string, k:0|1) => {
      const e = E2.get(edgeKey)!;
      const name = `sd${k}[${edgeKey}]`;
      const exists = T.get(name) || S.T2.find(tr => tr.key===name);
      if (exists) return name;
      if (k===0){
        const e_xx = ensureEdge(S, e.src, e.src).key;
        const e_xy = ensureEdge(S, e.src, e.dst).key;
        addTriangle(S, e_xx, e_xy, e_xy, name, [e.src,e.src,e.dst], { of:"E", key:e.key, s:0 });
      } else {
        const e_yy = ensureEdge(S, e.dst, e.dst).key;
        const e_xy = ensureEdge(S, e.src, e.dst).key;
        addTriangle(S, e_xy, e_yy, e_xy, name, [e.src,e.dst,e.dst], { of:"E", key:e.key, s:1 });
      }
      return name;
    };
    
    addTetra(S, {
      d0: t.key,
      d1: t.key,
      d2: degTri(triFaceEdgeKey(S,t,1), 0),
      d3: degTri(triFaceEdgeKey(S,t,2), 0)
    }, `SD0[${t.key}]`, [v0,v0,v1,v2], { of:"T2", key:t.key, s:0 });
    
    addTetra(S, {
      d0: degTri(triFaceEdgeKey(S,t,0), 0),
      d1: t.key,
      d2: t.key,
      d3: degTri(triFaceEdgeKey(S,t,2), 1)
    }, `SD1[${t.key}]`, [v0,v1,v1,v2], { of:"T2", key:t.key, s:1 });
    
    addTetra(S, {
      d0: degTri(triFaceEdgeKey(S,t,0), 1),
      d1: degTri(triFaceEdgeKey(S,t,1), 1),
      d2: t.key,
      d3: t.key
    }, `SD2[${t.key}]`, [v0,v1,v2,v2], { of:"T2", key:t.key, s:2 });
  }
}

/************ getHornWitness helper ************/
export type HornSpec =
  | { kind:"Lambda2_1"; e01:string; e12:string }
  | { kind:"Lambda2_0"; e01:string; e02:string }
  | { kind:"Lambda2_2"; e12:string; e02:string }
  | { kind:"Lambda3_1"; d3:string; d2:string; d0:string }
  | { kind:"Lambda3_2"; d3:string; d1:string; d0:string };

export function getHornWitness(S:SSetUpTo3, spec: HornSpec): {
  missingEdge?: string;
  triangleFillers?: string[];
  tetraFillers?: string[];
} {
  const E = edgeMap(S);
  if (spec.kind==="Lambda2_1"){
    const e1 = E.get(spec.e01), e2 = E.get(spec.e12);
    if (!e1 || !e2) return { triangleFillers: [] };
    const need = `e(${e1.src},${e2.dst})`;
    const fillers = (S.T2??[]).filter(t => t.e01===spec.e01 && t.e12===spec.e12 && edgeMap(S).get(t.e02)?.src===e1.src && edgeMap(S).get(t.e02)?.dst===e2.dst).map(t=>t.key);
    const hasEdge = !!S.E.find(e => e.src===e1.src && e.dst===e2.dst);
    const result: { missingEdge?: string; triangleFillers?: string[]; tetraFillers?: string[] } = { triangleFillers: fillers };
    if (!hasEdge) result.missingEdge = need;
    return result;
  } else if (spec.kind==="Lambda2_0"){
    const e01 = E.get(spec.e01), e02 = E.get(spec.e02);
    if (!e01 || !e02) return { triangleFillers: [] };
    const need = `e(${e01.dst},${e02.dst})`;
    const fillers = (S.T2??[]).filter(t => t.e01===spec.e01 && t.e02===spec.e02 && edgeMap(S).get(t.e12)?.src===e01.dst && edgeMap(S).get(t.e12)?.dst===e02.dst).map(t=>t.key);
    const hasEdge = !!S.E.find(e => e.src===e01.dst && e.dst===e02.dst);
    const result: { missingEdge?: string; triangleFillers?: string[]; tetraFillers?: string[] } = { triangleFillers: fillers };
    if (!hasEdge) result.missingEdge = need;
    return result;
  } else if (spec.kind==="Lambda2_2"){
    const e12 = E.get(spec.e12), e02 = E.get(spec.e02);
    if (!e12 || !e02) return { triangleFillers: [] };
    const need = `e(${e02.src},${e12.src})`;
    const fillers = (S.T2??[]).filter(t => t.e12===spec.e12 && t.e02===spec.e02 && edgeMap(S).get(t.e01)?.src===e02.src && edgeMap(S).get(t.e01)?.dst===e12.src).map(t=>t.key);
    const hasEdge = !!S.E.find(e => e.src===e02.src && e.dst===e12.src);
    const result: { missingEdge?: string; triangleFillers?: string[]; tetraFillers?: string[] } = { triangleFillers: fillers };
    if (!hasEdge) result.missingEdge = need;
    return result;
  } else if (spec.kind==="Lambda3_1"){
    const fillers = (S.T3??[]).filter(T => T.d3===spec.d3 && T.d2===spec.d2 && T.d0===spec.d0).map(T=>T.key);
    return { tetraFillers: fillers };
  } else {
    const fillers = (S.T3??[]).filter(T => T.d3===spec.d3 && T.d1===spec.d1 && T.d0===spec.d0).map(T=>T.key);
    return { tetraFillers: fillers };
  }
}

/************ FILL HORNS: materialize minimal fillers ************/
export function fillHorn(S:SSetUpTo3, spec: HornSpec): { created: string[] } {
  const created:string[] = [];
  const E = edgeMap(S);
  if (spec.kind==="Lambda2_1"){
    const e1 = E.get(spec.e01), e2 = E.get(spec.e12);
    if (!e1 || !e2) throw new Error("fillHorn Λ^2_1: referenced edges missing");
    // Ensure edge e02
    const e02 = ensureEdge(S, e1.src, e2.dst);
    if (!E.has(e02.key)) created.push(e02.key);
    // Ensure triangle
    const key = `t(${e1.key}|${e2.key}|${e02.key})`;
    if (!triMap(S).has(key)){
      addTriangle(S, e1.key, e2.key, e02.key, key, [e1.src, e1.dst, e2.dst]);
      created.push(key);
    }
  } else if (spec.kind==="Lambda2_0"){
    const e01 = E.get(spec.e01), e02 = E.get(spec.e02);
    if (!e01 || !e02) throw new Error("fillHorn Λ^2_0: referenced edges missing");
    const e12 = ensureEdge(S, e01.dst, e02.dst);
    if (!E.has(e12.key)) created.push(e12.key);
    const key = `t(${e01.key}|${e12.key}|${e02.key})`;
    if (!triMap(S).has(key)){
      addTriangle(S, e01.key, e12.key, e02.key, key, [e01.src, e01.dst, e02.dst]);
      created.push(key);
    }
  } else if (spec.kind==="Lambda2_2"){
    const e12 = E.get(spec.e12), e02 = E.get(spec.e02);
    if (!e12 || !e02) throw new Error("fillHorn Λ^2_2: referenced edges missing");
    const e01 = ensureEdge(S, e02.src, e12.src);
    if (!E.has(e01.key)) created.push(e01.key);
    const key = `t(${e01.key}|${e12.key}|${e02.key})`;
    if (!triMap(S).has(key)){
      addTriangle(S, e01.key, e12.key, e02.key, key, [e02.src, e12.src, e12.dst]);
      created.push(key);
    }
  } else if (spec.kind==="Lambda3_1"){
    // Need a tetra with faces d3,d2,d0; deduce vertices if faces carry verts
    const faces = { d3: spec.d3, d2: spec.d2, d1: "missing", d0: spec.d0 };
    const key = `T(${faces.d3}|${faces.d2}|missing|${faces.d0})`;
    if (!tetMap(S).has(key)){
      addTetra(S, { d3: faces.d3, d2: faces.d2, d1: faces.d1, d0: faces.d0 }, key);
      created.push(key);
    }
  } else { // Lambda3_2
    const faces = { d3: spec.d3, d2: "missing", d1: spec.d1, d0: spec.d0 };
    const key = `T(${faces.d3}|missing|${faces.d1}|${faces.d0})`;
    if (!tetMap(S).has(key)){
      addTetra(S, { d3: faces.d3, d2: faces.d2, d1: faces.d1, d0: faces.d0 }, key);
      created.push(key);
    }
  }
  return { created };
}

/************ CHAIN COMPLEX: (C2 <-d2- C1 <-d1- C0) ************/
export type ChainComplex02 = {
  C0: Obj[];
  C1: string[]; // edge keys
  C2: string[]; // triangle keys
  d1: number[][]; // |C0| x |C1|
  d2: number[][]; // |C1| x |C2|
};

export function toChainComplex(S:SSetUpTo3): ChainComplex02 {
  const C0 = [...S.V];
  const C1 = S.E.map(e=>e.key);
  const C2 = S.T2.map(t=>t.key);
  const i0 = new Map(C0.map((v,i)=>[v,i] as const));
  const i1 = new Map(C1.map((k,i)=>[k,i] as const));

  const zeros = (r:number,c:number)=> Array.from({length:r},()=>Array(c).fill(0));
  const d1 = zeros(C0.length, C1.length);
  for (let j=0;j<S.E.length;j++){
    const e = S.E[j]!;
    const dstIdx = i0.get(e.dst)!;
    const srcIdx = i0.get(e.src)!;
    d1[dstIdx]![j]! += 1;
    d1[srcIdx]![j]! -= 1;
  }
  const d2 = zeros(C1.length, C2.length);
  for (let k=0;k<S.T2.length;k++){
    const t = S.T2[k]!;
    // ∂[0,1,2] = e12 - e02 + e01
    const e12Idx = i1.get(t.e12)!;
    const e02Idx = i1.get(t.e02)!;
    const e01Idx = i1.get(t.e01)!;
    d2[e12Idx]![k]! += 1;
    d2[e02Idx]![k]! -= 1;
    d2[e01Idx]![k]! += 1;
  }
  return { C0, C1, C2, d1, d2 };
}

/************ Nerve of a finite poset ************/
export function nerveOfPoset(V:Obj[], leq:(x:Obj,y:Obj)=>boolean): SSetUpTo3 {
  const edges:{src:Obj; dst:Obj}[] = [];
  for(const x of V) {
    for(const y of V) {
      if (leq(x,y)) edges.push({src:x,dst:y});
    }
  }
  const S = makeSSet(V, edges);
  for(const x of V) {
    for(const y of V) {
      for(const z of V){
        if (leq(x,y) && leq(y,z) && leq(x,z)){
          addTriangle(S, `e(${x},${y})`, `e(${y},${z})`, `e(${x},${z})`, `t(${x},${y},${z})`, [x,y,z]);
        }
      }
    }
  }
  for(const w of V) {
    for(const x of V) {
      for(const y of V) {
        for(const z of V){
          if (leq(w,x) && leq(x,y) && leq(y,z)){
            addTetra(S, {
              d3:`t(${w},${x},${y})`,
              d2:`t(${w},${x},${z})`,
              d1:`t(${w},${y},${z})`,
              d0:`t(${x},${y},${z})`
            }, `T(${w},${x},${y},${z})`, [w,x,y,z]);
          }
        }
      }
    }
  }
  return S;
}

/************ Pretty printing helpers ************/
export function printQCReport(rep: QCReport): void {
  console.log(`Quasi-category check (up to n=${rep.nMax}):`);
  console.log(`  Λ²₁ inner horns: ${rep.horns2.filled}/${rep.horns2.total} filled`);
  if (rep.horns3) {
    console.log(`  Λ³₁,Λ³₂ inner horns: ${rep.horns3.filled}/${rep.horns3.total} filled`);
  }
  if (rep.outer2) {
    console.log(`  Λ²₀,Λ²₂ outer horns: ${rep.outer2.filled}/${rep.outer2.total} filled (informational)`);
  }
  console.log(`  Is quasi-category: ${rep.isQuasiCategory}`);
}

export function printMissingHorns2(S: SSetUpTo3, limit: number = 3): void {
  const misses = checkHorns2Inner(S).filter(x => !(x.hasEdge && x.fillers.length>0)).slice(0, limit);
  if (misses.length > 0) {
    console.log(`Missing Λ²₁ horns (first ${limit}):`);
    for (const h of misses) {
      console.log(`  ${h.horn.e01} ∘ ${h.horn.e12} needs ${h.horn.need_e02.src}→${h.horn.need_e02.dst}, hasEdge:${h.hasEdge}, fillers:${h.fillers.length}`);
    }
  }
}

/************ Demos ************/
function rankOverQ(A:number[][]):number{
  if (A.length === 0 || A[0]!.length === 0) return 0;
  const m=A.length, n=A[0]!.length; 
  const B=A.map(r=>r.slice());
  let r=0, lead=0;
  for(let i=0;i<m && lead<n;i++){
    let piv=i; 
    while(piv<m && Math.abs(B[piv]![lead]!) < 1e-12) piv++;
    if(piv===m){ lead++; i--; continue; }
    if(piv!==i){ const t=B[i]!; B[i]=B[piv]!; B[piv]=t; }
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

function demo() {
  console.log("=== Demo A: fillHorn on outer & inner horns ===");
  const S = makeSSet(["a","b","c"], [
    {src:"a",dst:"a"},{src:"b",dst:"b"},{src:"c",dst:"c"},
    {src:"a",dst:"b"},{src:"a",dst:"c"}
  ]);
  console.log("Before fill, outer Λ^2_0 witnesses:", getHornWitness(S, {kind:"Lambda2_0", e01:"e(a,b)", e02:"e(a,c)"}));
  console.log("fillHorn Λ^2_0:", fillHorn(S, {kind:"Lambda2_0", e01:"e(a,b)", e02:"e(a,c)"}));
  console.log("After fill, outer Λ^2_0 witnesses:", getHornWitness(S, {kind:"Lambda2_0", e01:"e(a,b)", e02:"e(a,c)"}));
  
  // Inner horn fill
  const S2 = makeSSet(["1","2","6"], [
    {src:"1",dst:"2"},{src:"2",dst:"6"},{src:"1",dst:"1"},{src:"2",dst:"2"},{src:"6",dst:"6"}
  ]);
  console.log("Before fill, inner Λ^2_1 witnesses:", getHornWitness(S2, {kind:"Lambda2_1", e01:"e(1,2)", e12:"e(2,6)"}));
  console.log("fillHorn Λ^2_1:", fillHorn(S2, {kind:"Lambda2_1", e01:"e(1,2)", e12:"e(2,6)"}));
  console.log("After fill, inner Λ^2_1 witnesses:", getHornWitness(S2, {kind:"Lambda2_1", e01:"e(1,2)", e12:"e(2,6)"}));

  console.log("\n=== Demo B: Chain complex from a poset nerve + sanity ∂1∘∂2=0 ===");
  const V = ["1","2","3","6"];
  const leq = (x:string,y:string)=> (parseInt(y)%parseInt(x)===0);
  const N = nerveOfPoset(V, leq);
  const CC = toChainComplex(N);
  
  // Check ∂1 ∘ ∂2 = 0
  const m = CC.d1.length, p = CC.d2.length > 0 ? CC.d2[0]!.length : 0, n = CC.d1.length > 0 ? CC.d1[0]!.length : 0;
  let ok=true;
  for(let i=0;i<m;i++){
    for(let k=0;k<p;k++){
      let s=0;
      for(let j=0;j<n;j++) {
        const d1_val = CC.d1[i]?.[j] ?? 0;
        const d2_val = CC.d2[j]?.[k] ?? 0;
        s += d1_val * d2_val;
      }
      if (s!==0){ ok=false; break; }
    }
  }
  console.log("Sizes |C0|,|C1|,|C2| =", CC.C0.length, CC.C1.length, CC.C2.length);
  console.log("Boundary sanity (d1 ∘ d2 == 0)?", ok);
  
  // Quick Betti numbers over Q
  const r1 = rankOverQ(CC.d1), r2 = rankOverQ(CC.d2);
  const b0 = CC.C0.length - r1;
  const b1 = (CC.C1.length - r1) - r2;
  console.log("Betti (over ℚ): β₀=", b0, "β₁=", b1);
  
  console.log("\n=== Demo C: Quasi-category verification ===");
  const qc_report = isQuasiCategory(N, 3);
  printQCReport(qc_report);
  
  if (qc_report.isQuasiCategory) {
    console.log("✅ Nerve of poset is quasi-category (as expected)");
  } else {
    console.log("❌ Unexpected: nerve should be quasi-category");
  }
}

// Export demo function for external use
export { demo };