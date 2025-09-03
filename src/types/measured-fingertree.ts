// measured-fingertree.ts
// FingerTree with *monoidal measures*, enabling generic indexed ops (split by predicate on prefix measure).
//
// Exports: MeasuredFingerTree<T,M>, fromArray, toArray, pushL/pushR, popL/popR, concat, splitWith.
// A small Rope built on top (measure = length) is in rope.ts.
//
// Run demo: ts-node rope-demo.ts

/************ Monoid & Measured ************/
export type Monoid<M> = { empty: M; concat: (a:M,b:M)=>M };
export type Measured<T,M> = { measure: (x:T)=>M; M: Monoid<M> };

/************ Core structures ************/
type Digit<T,M> = { items: T[]; m: M };
type Node<T,M> =
  | { t:"N2", a:T, b:T, m:M }
  | { t:"N3", a:T, b:T, c:T, m:M };

function node2<T,M>(meas:Measured<T,M>, a:T,b:T): Node<T,M> {
  const m = meas.M.concat(meas.measure(a), meas.measure(b));
  return { t:"N2", a,b, m };
}

function node3<T,M>(meas:Measured<T,M>, a:T,b:T,c:T): Node<T,M> {
  const m = meas.M.concat(meas.M.concat(meas.measure(a), meas.measure(b)), meas.measure(c));
  return { t:"N3", a,b,c, m };
}

function digit<T,M>(meas:Measured<T,M>, items:T[]): Digit<T,M> {
  const m = items.reduce((acc,x)=> meas.M.concat(acc, meas.measure(x)), meas.M.empty);
  return { items, m };
}

function nodeToArray<T,M>(n:Node<T,M>): T[] { 
  return n.t==="N2" ? [n.a,n.b] : [n.a,n.b,n.c]; 
}

export type MeasuredFingerTree<T,M> =
  | { t:"Empty", m:M }
  | { t:"Single", x:T, m:M }
  | { t:"Deep", m:M, prefix: Digit<T,M>, deeper: MeasuredFingerTree<Node<T,M>,M>, suffix: Digit<T,M> };

function mkDeep<T,M>(meas:Measured<T,M>, p:Digit<T,M>, m:MeasuredFingerTree<Node<T,M>,M>, s:Digit<T,M>): MeasuredFingerTree<T,M> {
  const mTotal = [p.m, m.m, s.m].reduce(meas.M.concat);
  return { t:"Deep", m: mTotal, prefix: p, deeper: m, suffix: s };
}

export function mvalue<T,M>(t:MeasuredFingerTree<T,M>): M { return t.m; }

export function empty<T,M>(meas:Measured<T,M>): MeasuredFingerTree<T,M> { 
  return { t:"Empty", m: meas.M.empty }; 
}

export function single<T,M>(meas:Measured<T,M>, x:T): MeasuredFingerTree<T,M> { 
  return { t:"Single", x, m: meas.measure(x) }; 
}

/************ Conversions ************/
export function toArray<T,M>(t:MeasuredFingerTree<T,M>): T[] {
  switch(t.t){
    case "Empty": return [];
    case "Single": return [t.x];
    case "Deep": return [...t.prefix.items, ...toArray(t.deeper).flatMap(nodeToArray), ...t.suffix.items];
  }
}

export function fromArray<T,M>(meas:Measured<T,M>, xs:T[]): MeasuredFingerTree<T,M> {
  let t = empty(meas);
  for (const x of xs) t = pushR(meas, t, x);
  return t;
}

/************ Push/Pop ************/
export function pushL<T,M>(meas:Measured<T,M>, t:MeasuredFingerTree<T,M>, x:T): MeasuredFingerTree<T,M> {
  switch(t.t){
    case "Empty": return single(meas, x);
    case "Single": return mkDeep(meas, digit(meas,[x]), empty({measure:(n:Node<T,M>)=>n.m, M:meas.M}), digit(meas,[t.x]));
    case "Deep": {
      const p = t.prefix.items;
      if (p.length<4) return mkDeep(meas, digit(meas,[x, ...p]), t.deeper, t.suffix);
      const [a,b,c,d] = p as [T,T,T,T];
      const deeper2 = pushL({measure:(n:Node<T,M>)=>n.m, M:meas.M}, t.deeper, node2(meas,c,d));
      return mkDeep(meas, digit(meas,[x,a,b]), deeper2, t.suffix);
    }
  }
}

// pushR never returns Empty when given any tree and an element
export function pushR<T,M>(meas:Measured<T,M>, t:MeasuredFingerTree<T,M>, x:T): Exclude<MeasuredFingerTree<T,M>, {t:"Empty"}> {
  switch(t.t){
    case "Empty": return single(meas, x) as Exclude<MeasuredFingerTree<T,M>, {t:"Empty"}>;
    case "Single": return mkDeep(meas, digit(meas,[t.x]), empty({measure:(n:Node<T,M>)=>n.m, M:meas.M}), digit(meas,[x])) as Exclude<MeasuredFingerTree<T,M>, {t:"Empty"}>;
    case "Deep": {
      const s = t.suffix.items;
      if (s.length<4) return mkDeep(meas, t.prefix, t.deeper, digit(meas,[...s,x])) as Exclude<MeasuredFingerTree<T,M>, {t:"Empty"}>;
      const [a,b,c,d] = s as [T,T,T,T];
      const deeper2 = pushR({measure:(n:Node<T,M>)=>n.m, M:meas.M}, t.deeper, node2(meas,a,b));
      return mkDeep(meas, t.prefix, deeper2, digit(meas,[c,d,x])) as Exclude<MeasuredFingerTree<T,M>, {t:"Empty"}>;
    }
  }
}

export function popL<T,M>(meas:Measured<T,M>, t:MeasuredFingerTree<T,M>): { head:T, tail:MeasuredFingerTree<T,M> } | undefined {
  switch(t.t){
    case "Empty": return undefined;
    case "Single": return { head: t.x, tail: empty(meas) };
    case "Deep": {
      const [h, ...rest] = t.prefix.items;
      if (!h) return undefined;
      if (rest.length>0) return { head: h, tail: mkDeep(meas, digit(meas,rest), t.deeper, t.suffix) };
      if (t.deeper.t==="Empty"){
        const [s1, ...srest] = t.suffix.items;
        if (!s1) return { head: h, tail: empty(meas) };
        return { head: h, tail: srest.length? mkDeep(meas, digit(meas,srest), empty({measure:(n:Node<T,M>)=>n.m, M:meas.M}), digit(meas,[])) : single(meas,s1) };
      } else {
        const d = popL({measure:(n:Node<T,M>)=>n.m, M:meas.M}, t.deeper);
        if (!d) return { head: h, tail: empty(meas) };
        const newPrefix = digit(meas, nodeToArray(d.head));
        return { head: h, tail: mkDeep(meas, newPrefix, d.tail, t.suffix) };
      }
    }
  }
}

export function popR<T,M>(meas:Measured<T,M>, t:MeasuredFingerTree<T,M>): { init:MeasuredFingerTree<T,M>, last:T } | undefined {
  switch(t.t){
    case "Empty": return undefined;
    case "Single": return { init: empty(meas), last: t.x };
    case "Deep": {
      const s = t.suffix.items;
      if (s.length>1){
        const last = s[s.length-1]!;
        const init = mkDeep(meas, t.prefix, t.deeper, digit(meas, s.slice(0,-1)));
        return { init, last };
      }
      if (t.deeper.t==="Empty"){
        const p = t.prefix.items;
        const last = s[0]!;
        const init = p.length? mkDeep(meas, digit(meas,p), empty({measure:(n:Node<T,M>)=>n.m, M:meas.M}), digit(meas,[])) : empty(meas);
        return { init, last };
      } else {
        const d = popR({measure:(n:Node<T,M>)=>n.m, M:meas.M}, t.deeper);
        if (!d) return undefined;
        const newSuffix = digit(meas, nodeToArray(d.last));
        const init = mkDeep(meas, t.prefix, d.init, newSuffix);
        return { init, last: s[0]! };
      }
    }
  }
}

/************ Concat & Split ************/
function nodesFrom<T,M>(meas:Measured<T,M>, arr:T[]): Node<T,M>[] {
  const out: Node<T,M>[] = [];
  let i=0;
  while (i < arr.length){
    const remain = arr.length - i;
    if (remain === 2) { 
      out.push(node2(meas, arr[i]!, arr[i+1]!)); 
      i+=2; 
    } else if (remain >= 3) { 
      out.push(node3(meas, arr[i]!, arr[i+1]!, arr[i+2]!)); 
      i+=3; 
    } else if (remain === 1) {
      // Handle odd case by duplicating (simplified)
      out.push(node2(meas, arr[i]!, arr[i]!)); 
      i+=1;
    }
  }
  return out;
}

function app3<T,M>(meas:Measured<T,M>, left:MeasuredFingerTree<T,M>, xs:T[], right:MeasuredFingerTree<T,M>): MeasuredFingerTree<T,M> {
  if (left.t==="Empty"){ 
    let t=right; 
    for (let i=xs.length-1;i>=0;i--) t=pushL(meas,t,xs[i]!); 
    return t; 
  }
  if (right.t==="Empty"){ 
    let t=left;  
    for (let i=0;i<xs.length;i++) t=pushR(meas,t,xs[i]!); 
    return t; 
  }
  if (left.t==="Single") { 
    return pushL(meas, app3(meas, empty(meas), xs, right), left.x); 
  }
  if (right.t==="Single"){ 
    return pushR(meas, app3(meas, left, xs, empty(meas)), right.x); 
  }
  
  const middleNodes = nodesFrom(meas, [...left.suffix.items, ...xs, ...right.prefix.items]);
  let m = left.deeper;
  for (const nd of middleNodes) {
    m = pushR({measure:(n:Node<T,M>)=>n.m, M:meas.M}, m, nd);
  }
  return mkDeep(meas, left.prefix, m, right.suffix);
}

export function concat<T,M>(meas:Measured<T,M>, left:MeasuredFingerTree<T,M>, right:MeasuredFingerTree<T,M>): MeasuredFingerTree<T,M> {
  return app3(meas, left, [], right);
}

// Split using a monotone predicate on prefix measures.
// Returns { left, pivot?, right } where pivot is the element where predicate crossed to true.
export function splitWith<T,M>(meas:Measured<T,M>, t:MeasuredFingerTree<T,M>, pred:(m:M)=>boolean):
  { left: MeasuredFingerTree<T,M>, pivot?: T, right: MeasuredFingerTree<T,M> } {
  const M = meas.M;
  
  const go = (macc:M, t:MeasuredFingerTree<T,M>): any => {
    switch(t.t){
      case "Empty": return { left: empty(meas), right: empty(meas) };
      case "Single": {
        const mNext = M.concat(macc, meas.measure(t.x));
        if (pred(mNext)) return { left: empty(meas), pivot: t.x, right: empty(meas) };
        else return { left: t, right: empty(meas) };
      }
      case "Deep": {
        const mPref = M.concat(macc, t.prefix.m);
        if (pred(mPref)){
          // find inside prefix
          let acc = macc;
          const arr = t.prefix.items;
          for (let i=0;i<arr.length;i++){
            const item = arr[i]!;
            const mi = M.concat(acc, meas.measure(item));
            if (pred(mi)){
              const left = fromArray(meas, arr.slice(0,i));
              const right = app3(meas, empty(meas), arr.slice(i+1), mkDeep(meas, digit(meas,[]), t.deeper, t.suffix));
              return { left, pivot: item, right };
            }
            acc = mi;
          }
        }
        const mMid = M.concat(mPref, t.deeper.m);
        if (pred(mMid)){
          // Recursive call on deeper structure with Node<T,M> elements
          const deeperMeas: Measured<Node<T,M>, M> = {measure:(n:Node<T,M>)=>n.m, M:meas.M};
          const res = splitWith(deeperMeas, t.deeper, (m: M) => pred(M.concat(mPref, m)));
          const leftItems = [...t.prefix.items, ...toArray(res.left).flatMap(nodeToArray)];
          const left = fromArray(meas, leftItems);
          const right = mkDeep(meas, digit(meas,[]), res.right, t.suffix);
          return { left, pivot: res.pivot, right };
        }
        // in suffix
        let acc = mMid;
        const arr = t.suffix.items;
        for (let i=0;i<arr.length;i++){
          const item = arr[i]!;
          const mi = M.concat(acc, meas.measure(item));
          if (pred(mi)){
            const left = fromArray(meas, [...t.prefix.items, ...toArray(t.deeper).flatMap(nodeToArray), ...arr.slice(0,i)]);
            const right = fromArray(meas, arr.slice(i+1));
            return { left, pivot: item, right };
          }
          acc = mi;
        }
        return { left: t, right: empty(meas) };
      }
    }
  };
  return go(meas.M.empty, t);
}

/************ Common monoids ************/
export const SumMonoid: Monoid<number> = { 
  empty: 0, 
  concat: (a, b) => a + b 
};

export const ProductMonoid: Monoid<number> = { 
  empty: 1, 
  concat: (a, b) => a * b 
};

export const MaxMonoid: Monoid<number> = { 
  empty: -Infinity, 
  concat: (a, b) => Math.max(a, b) 
};

export const MinMonoid: Monoid<number> = { 
  empty: Infinity, 
  concat: (a, b) => Math.min(a, b) 
};

/************ Common measures ************/
export const lengthMeasure: Measured<string, number> = {
  M: SumMonoid,
  measure: (s) => s.length
};

export const sizeMeasure: Measured<any, number> = {
  M: SumMonoid,
  measure: (_) => 1
};

export const costMeasure: Measured<{cost: number}, number> = {
  M: SumMonoid,
  measure: (x) => x.cost
};

/************ Indexed operations ************/
export function splitAt<T>(meas:Measured<T,number>, t:MeasuredFingerTree<T,number>, index:number): { left: MeasuredFingerTree<T,number>, right: MeasuredFingerTree<T,number> } {
  const result = splitWith(meas, t, m => meas.M.concat(meas.M.empty, m) > index);
  return { left: result.left, right: result.right };
}

export function take<T>(meas:Measured<T,number>, t:MeasuredFingerTree<T,number>, n:number): MeasuredFingerTree<T,number> {
  return splitAt(meas, t, n).left;
}

export function drop<T>(meas:Measured<T,number>, t:MeasuredFingerTree<T,number>, n:number): MeasuredFingerTree<T,number> {
  return splitAt(meas, t, n).right;
}