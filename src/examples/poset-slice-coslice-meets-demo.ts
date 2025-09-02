// poset-slice-coslice-meets-demo.ts
// Extended demonstration showing coslices and meets/joins as limits/colimits
// This is the comprehensive version with all the advanced features

/************ Minimal categorical interfaces ************/
export interface Category<Obj, Mor> {
  id(o: Obj): Mor;
  dom(m: Mor): Obj;
  cod(m: Mor): Obj;
  compose(g: Mor, f: Mor): Mor; // g ∘ f
}

export interface Functor<AObj, AMor, BObj, BMor> {
  dom: Category<AObj, AMor>;
  cod: Category<BObj, BMor>;
  onObj(a: AObj): BObj;
  onMor(f: AMor): BMor;
}

/************ Posets as thin categories ************/
type ThinMor<T> = { src: T; dst: T } | null;

export interface Poset<T> {
  elems: T[];
  leq: (x: T, y: T) => boolean; // reflexive & transitive assumed
}

export function thinCategory<T>(P: Poset<T>): Category<T, ThinMor<T>> {
  return {
    id: (x) => ({ src: x, dst: x }),
    dom: (m) => (m ? m.src : (undefined as any)),
    cod: (m) => (m ? m.dst : (undefined as any)),
    compose: (g, f) => {
      if (!f || !g) return null;
      if (f.dst !== g.src) throw new Error("thin compose: mismatched endpoints");
      return P.leq(f.src, g.dst) ? { src: f.src, dst: g.dst } : null;
    }
  };
}

export function monotoneAsFunctor<T, U>(
  P: Poset<T>, Q: Poset<U>, h: (t:T)=>U
): Functor<T, ThinMor<T>, U, ThinMor<U>> {
  const CP = thinCategory(P);
  const CQ = thinCategory(Q);
  return {
    dom: CP, cod: CQ,
    onObj: h,
    onMor: (m) => (m ? { src: h(m.src), dst: h(m.dst) } : null)
  };
}

/************ Generic comma category (F ↓ G) ************/
export type CommaObj<AObj, BObj, CMor> = { a: AObj; b: BObj; alpha: CMor };
export type CommaMor<AObj, AMor, BObj, BMor, CMor> = {
  from: CommaObj<AObj, BObj, CMor>;
  to:   CommaObj<AObj, BObj, CMor>;
  f: AMor; g: BMor;
};

export function comma<AObj, AMor, BObj, BMor, CObj, CMor>(
  F: Functor<AObj, AMor, CObj, CMor>,
  G: Functor<BObj, BMor, CObj, CMor>,
  C: Category<CObj, CMor>
) {
  function mkMor(
    x: CommaObj<AObj, BObj, CMor>,
    y: CommaObj<AObj, BObj, CMor>,
    f: AMor,
    g: BMor
  ): CommaMor<AObj, AMor, BObj, BMor, CMor> {
    const left  = C.compose(G.onMor(g), x.alpha);
    const right = C.compose(y.alpha, F.onMor(f));
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      throw new Error("comma: square does not commute");
    }
    return { from: x, to: y, f, g };
  }

  const Cat: Category<
    CommaObj<AObj, BObj, CMor>,
    CommaMor<AObj, AMor, BObj, BMor, CMor>
  > = {
    id: (o) => mkMor(o, o, F.dom.id(o.a), G.dom.id(o.b)),
    dom: (m) => m.from,
    cod: (m) => m.to,
    compose: (g, f) => {
      if (f.to !== g.from) throw new Error("comma: compose endpoints mismatch");
      return mkMor(f.from, g.to, F.dom.compose(g.f, f.f), G.dom.compose(g.g, f.g));
    }
  };
  return { Cat, mkMor };
}

/************ Terminal category 1 ************/
type OneObj = "•"; type OneMor = "id";
const ONE: Category<OneObj, OneMor> = {
  id: () => "id", dom: () => "•", cod: () => "•", compose: () => "id"
};

console.log("=".repeat(80));
console.log("COMPREHENSIVE POSET SLICE/COSLICE/MEETS DEMO");
console.log("=".repeat(80));

/************ The divisibility poset P = {1,2,3,6} ************/
const divElems = [1,2,3,6] as const;
type D = typeof divElems[number];
const divides = (x:D,y:D)=> (y % x === 0);
const P: Poset<D> = { elems: [...divElems], leq: divides };
const CP = thinCategory(P);

console.log("Divisibility poset P = {1,2,3,6} where x ≤ y iff x | y");

// Identity functor on CP
const Id: Functor<D, ThinMor<D>, D, ThinMor<D>> = {
  dom: CP, cod: CP,
  onObj: x => x,
  onMor: f => f
};

/************ Slice (already shown): P ↓ 6 ************/
const c6: D = 6;
const Const6: Functor<OneObj, OneMor, D, ThinMor<D>> = {
  dom: ONE, cod: CP,
  onObj: () => c6,
  onMor: () => ({ src: c6, dst: c6 })
};
const { Cat: Slice6, mkMor: mkSlice6 } = comma(Id, Const6, CP);
const slice6Objs = P.elems.filter(x => divides(x, c6)).map(x => ({ a:x, b:"•" as OneObj, alpha:{src:x,dst:c6} }));
console.log("Slice P↓6 objects:", slice6Objs.map(o=>o.a)); // [1,2,3,6]

/************ Coslice 6 ↓ P (multiples of 6 present in P) ************/
const { Cat: CoSlice6, mkMor: mkCoSlice6 } = comma(Const6 as any, Id as any, CP);
// Objects: (•, y, α: 6→y) exist iff 6 ≤ y (i.e., 6 | y). In our finite P, only y=6.
const coslice6Objs = P.elems.filter(y => divides(c6, y)).map(y => ({ a:"•" as OneObj, b:y, alpha:{src:c6,dst:y} }));
console.log("Coslice 6↓P objects:", coslice6Objs.map(o=>o.b)); // [6]

// For a more interesting coslice, use 1: 1 divides everyone.
const c1: D = 1;
const Const1: Functor<OneObj, OneMor, D, ThinMor<D>> = {
  dom: ONE, cod: CP,
  onObj: () => c1,
  onMor: () => ({ src: c1, dst: c1 })
};
const { Cat: CoSlice1, mkMor: mkCoSlice1 } = comma(Const1 as any, Id as any, CP);
const coslice1Objs = P.elems.filter(y => divides(c1, y)).map(y => ({ a:"•" as OneObj, b:y, alpha:{src:c1,dst:y} }));
console.log("Coslice 1↓P objects:", coslice1Objs.map(o=>o.b)); // [1,2,3,6]

/************ Meets (limits) and Joins (colimits) in a finite poset ************/
function lowerBounds<T>(P: Poset<T>, S: T[]): T[] {
  return P.elems.filter(x => S.every(s => P.leq(x, s)));
}
function upperBounds<T>(P: Poset<T>, S: T[]): T[] {
  return P.elems.filter(x => S.every(s => P.leq(s, x)));
}
function maxima<T>(P: Poset<T>, xs: T[]): T[] {
  return xs.filter(x => xs.every(y => !P.leq(x,y) || !P.leq(y,x) || x===y)).filter(x =>
    xs.every(y => !(P.leq(x,y) && x!==y))
  );
}
function minima<T>(P: Poset<T>, xs: T[]): T[] {
  return xs.filter(x => xs.every(y => !P.leq(y,x) || !P.leq(x,y) || x===y)).filter(x =>
    xs.every(y => !(P.leq(y,x) && x!==y))
  );
}

function meet2<T>(P: Poset<T>, x:T, y:T): T | null {
  const lbs = lowerBounds(P, [x,y]);
  const glbs = maxima(P, lbs); // greatest lower bounds
  return glbs.length===1 ? glbs[0]! : null;
}
function join2<T>(P: Poset<T>, x:T, y:T): T | null {
  const ubs = upperBounds(P, [x,y]);
  const lubs = minima(P, ubs); // least upper bounds
  return lubs.length===1 ? lubs[0]! : null;
}

// Pretty tables for meet/join
const pairs: [D,D][] = [
  [1,1],[1,2],[1,3],[1,6],
  [2,2],[2,3],[2,6],
  [3,3],[3,6],
  [6,6]
];

console.log("\nMeet table (∧) in P:");
for (const [x,y] of pairs) {
  console.log(`${x} ∧ ${y} =`, meet2(P,x,y));
}

console.log("\nJoin table (∨) in P:");
for (const [x,y] of pairs) {
  console.log(`${x} ∨ ${y} =`, join2(P,x,y));
}

/************ Sanity: products/pullbacks and coproducts/pushouts in thin cats ************/
// In a thin category, all Hom-sets are ≤1 element, so:
//  - Binary product x×y exists ⇔ x ∧ y exists, and is that meet.
//  - Binary coproduct x⊔y exists ⇔ x ∨ y exists, and is that join.
// For our P, both exist everywhere (it's a finite lattice), so:
let allGood = true;
for (const [x,y] of pairs) {
  if (meet2(P,x,y) === null || join2(P,x,y) === null) allGood = false;
}
console.log("\nP is a lattice (all binary meets/joins exist)?", allGood);

console.log("\n" + "=".repeat(80));
console.log("WHAT THIS SHOWS:");
console.log("• Slice P↓6: divisors of 6 form a principal ideal");
console.log("• Coslice 6↓P: multiples of 6 in P (just {6})");
console.log("• Coslice 1↓P: multiples of 1 = everything");
console.log("• Meet/join tables match gcd/lcm in divisibility lattice");
console.log("• Thin categories make limits/colimits = lattice operations");
console.log("• Comma categories provide the universal construction framework");
console.log("=".repeat(80));