// poset-pullback-pushout-demo.ts
// Pullbacks/pushouts in a thin category (poset) with explicit universal-property checks.
//
// Run: ts-node poset-pullback-pushout-demo.ts

/************ Minimal categorical interfaces ************/
export interface Category<Obj, Mor> {
  id(o: Obj): Mor;
  dom(m: Mor): Obj;
  cod(m: Mor): Obj;
  compose(g: Mor, f: Mor): Mor; // g ∘ f
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

console.log("=".repeat(80));
console.log("PULLBACKS/PUSHOUTS IN THIN CATEGORIES DEMO");
console.log("=".repeat(80));

/************ The divisibility poset P = {1,2,3,6} ************/
const divElems = [1,2,3,6] as const;
type D = typeof divElems[number];
const divides = (x:D,y:D)=> (y % x === 0);
const P: Poset<D> = { elems: [...divElems], leq: divides };
const CP = thinCategory(P);

console.log("Divisibility poset P = {1,2,3,6} where x ≤ y iff x | y");
console.log("Elements:", P.elems);

// Helpers: meet/join
function lowerBounds<T>(P: Poset<T>, S: T[]): T[] {
  return P.elems.filter(x => S.every(s => P.leq(x, s)));
}
function upperBounds<T>(P: Poset<T>, S: T[]): T[] {
  return P.elems.filter(x => S.every(s => P.leq(s, x)));
}
function maxima<T>(P: Poset<T>, xs: T[]): T[] {
  return xs.filter(x => xs.every(y => !(P.leq(x,y) && x!==y)));
}
function minima<T>(P: Poset<T>, xs: T[]): T[] {
  return xs.filter(x => xs.every(y => !(P.leq(y,x) && x!==y)));
}
function meet2<T>(P: Poset<T>, x:T, y:T): T | null {
  const lbs = lowerBounds(P, [x,y]);
  const glbs = maxima(P, lbs);
  return glbs.length===1 ? glbs[0]! : null;
}
function join2<T>(P: Poset<T>, x:T, y:T): T | null {
  const ubs = upperBounds(P, [x,y]);
  const lubs = minima(P, ubs);
  return lubs.length===1 ? lubs[0]! : null;
}

/************ Pullback/pushout checkers ************/
// In a thin category, pullback of a→c ←b is (a ∧ b) with legs to a,b, when it exists.
// Universal property reduces to: for any p with arrows p→a and p→b making the square commute (auto in poset),
// we must have p ≤ a∧b, and a∧b is the greatest such.
function checkPullback<T>(P: Poset<T>, a:T, b:T, c:T): {object:T|null, isUniversal:boolean} {
  // arrows exist iff ≤ holds
  if (!P.leq(a,c) || !P.leq(b,c)) return { object:null, isUniversal:false };
  const pb = meet2(P, a, b);
  if (pb===null) return { object:null, isUniversal:false };
  // universal property:
  let ok = true;
  for (const p of P.elems) {
    const sqCommutes = P.leq(p,a) && P.leq(p,b); // thin: existence implies commutativity
    if (sqCommutes && !P.leq(p, pb)) ok = false;
  }
  // greatest such lower bound already ensured by meet2 selecting GLB uniquely
  return { object: pb, isUniversal: ok };
}

// Dually for pushout: of a ← d → b is (a ∨ b)
function checkPushout<T>(P: Poset<T>, d:T, a:T, b:T): {object:T|null, isUniversal:boolean} {
  if (!P.leq(d,a) || !P.leq(d,b)) return { object:null, isUniversal:false };
  const po = join2(P, a, b);
  if (po===null) return { object:null, isUniversal:false };
  let ok = true;
  for (const q of P.elems) {
    const sqCommutes = P.leq(a,q) && P.leq(b,q);
    if (sqCommutes && !P.leq(po, q)) ok = false;
  }
  return { object: po, isUniversal: ok };
}

console.log("\n1. PULLBACKS IN DIVISIBILITY POSET");
console.log("Pullback of span a→c←b is meet a∧b (when both a,b ≤ c)");

/************ Demo ************/
const pairs: [D,D][] = [
  [1,1],[1,2],[1,3],[1,6],
  [2,2],[2,3],[2,6],
  [3,3],[3,6],
  [6,6]
];

console.log("\nPullbacks a→6←b (spans into 6):");
for (const [a,b] of pairs) {
  const res = checkPullback(P, a, b, 6);
  if (res.object!==null) {
    console.log(`  PB of ${a}→6←${b} is ${res.object}, universal: ${res.isUniversal}`);
  } else {
    console.log(`  PB of ${a}→6←${b}: no pullback exists`);
  }
}

console.log("\n" + "-".repeat(60));
console.log("\n2. PUSHOUTS IN DIVISIBILITY POSET");
console.log("Pushout of cospan a←d→b is join a∨b (when both d ≤ a,b)");

console.log("\nPushouts a←1→b (cospans from 1):");
for (const [a,b] of pairs) {
  const res = checkPushout(P, 1, a, b);
  if (res.object!==null) {
    console.log(`  PO of ${a}←1→${b} is ${res.object}, universal: ${res.isUniversal}`);
  } else {
    console.log(`  PO of ${a}←1→${b}: no pushout exists`);
  }
}

console.log("\n" + "-".repeat(60));
console.log("\n3. UNIVERSAL PROPERTY VERIFICATION");

// Detailed check for pullback 2→6←3
const pb_res = checkPullback(P, 2, 3, 6);
if (pb_res.object) {
  console.log(`\nPullback of 2→6←3 is ${pb_res.object} = meet(2,3)`);
  console.log("Universal property check:");
  console.log("For any p with p→2 and p→3 (i.e., p|2 and p|3), we need p ≤ meet(2,3)");
  
  const candidates = P.elems.filter(p => P.leq(p, 2) && P.leq(p, 3));
  console.log("Candidates p with p|2 and p|3:", candidates);
  console.log("All satisfy p ≤ meet(2,3):", 
    candidates.every(p => P.leq(p, pb_res.object!)));
  console.log(`meet(2,3) = ${pb_res.object} is greatest such element: ✓`);
}

// Detailed check for pushout 2←1→3
const po_res = checkPushout(P, 1, 2, 3);
if (po_res.object) {
  console.log(`\nPushout of 2←1→3 is ${po_res.object} = join(2,3)`);
  console.log("Universal property check:");
  console.log("For any q with 2→q and 3→q (i.e., 2|q and 3|q), we need join(2,3) ≤ q");
  
  const candidates = P.elems.filter(q => P.leq(2, q) && P.leq(3, q));
  console.log("Candidates q with 2|q and 3|q:", candidates);
  console.log("All satisfy join(2,3) ≤ q:", 
    candidates.every(q => P.leq(po_res.object!, q)));
  console.log(`join(2,3) = ${po_res.object} is least such element: ✓`);
}

console.log("\n" + "=".repeat(80));
console.log("PULLBACK/PUSHOUT THEORY IN THIN CATEGORIES:");
console.log("✓ Pullback of span a→c←b = meet(a,b) when a,b ≤ c");
console.log("✓ Pushout of cospan a←d→b = join(a,b) when d ≤ a,b");
console.log("✓ Universal properties verified via order-theoretic bounds");
console.log("✓ Thin categories make limit/colimit = lattice operations");
console.log("✓ Categorical constructions reduce to concrete order theory");
console.log("=".repeat(80));

console.log("\n🎯 WHAT THIS DEMONSTRATES:");
console.log("• Pullbacks in posets = greatest common divisors");
console.log("• Pushouts in posets = least common multiples");
console.log("• Universal properties = order-theoretic optimization");
console.log("• Categorical limits = lattice-theoretic meets/joins");
console.log("• Abstract category theory = concrete computational algorithms");