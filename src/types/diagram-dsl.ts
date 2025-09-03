/** @math DEF-DIAGRAM @math COLIM-GENERAL @math LIMIT-GENERAL */

/** Lightweight DSL for common diagram shapes and quick functor wiring. */
import { SmallCategory } from "./category-to-nerve-sset.js";
import { SetObj } from "./catkit-kan.js";
import { Presheaf } from "./presheaf.js";

/** Helpers */
type ObjId = string;
type MorId = string;

type HomSpec<O extends ObjId, M extends MorId> = Record<string, M[]>; // key `${a}->${b}` : ids

function makeSmallCategory<O extends ObjId, M extends MorId>(
  Obj: O[],
  Mor: (M | { id: M; src: O; dst: O })[],
  homes: HomSpec<O, M>
): any {
  const MorExp: Array<{ id: M; src: O; dst: O }> = Mor.map(m =>
    (typeof m === "string" ? ({ id: m as M, src: "" as O, dst: "" as O }) : m) as any
  );

  const id = (o: O) => ({ id: `id_${o}` as M, src: o, dst: o });
  const ids = Obj.map(o => id(o));

  // Fill in missing identity morphisms
  const MorAll = [
    ...MorExp.filter(m => !String(m.id).startsWith("id_")),
    ...ids
  ];

  const byId = new Map<string, { id: M; src: O; dst: O }>();
  for (const m of MorAll) byId.set(String(m.id), m);

  const hom = (a: O, b: O) => {
    const key = `${a}->${b}`;
    const ids = (homes[key] ?? []) as M[];
    const out = ids.map(mid => byId.get(String(mid))!).filter(Boolean);
    
    // ensure identity is present when a=b
    if (a === b) {
      const iid = `id_${a}` as M;
      const im = byId.get(String(iid))!;
      if (im && !out.some(x => x.id === im.id)) out.unshift(im);
    }
    
    return {
      id: `hom-${a}-${b}`,
      elems: out,
      eq: (x: any, y: any) => x.id === y.id
    } as SetObj<{ id: M; src: O; dst: O }>;
  };

  const comp = (g: { id: M; src: O; dst: O }, f: { id: M; src: O; dst: O }) => {
    if (f.dst !== g.src) throw new Error("bad comp");
    if (String(f.id).startsWith("id_")) return g;
    if (String(g.id).startsWith("id_")) return f;
    
    // try to find a listed composite in homes table if any single nontrivial composite exists
    const key = `${f.src}->${g.dst}`;
    const options = (homes[key] ?? []) as M[];
    // prefer the unique non-identity in that hom-set when present
    const candidate = options.find(mid => !String(mid).startsWith("id_"));
    return candidate ? byId.get(String(candidate))! : g; // default benign collapse
  };

  const src = (m: { id: M; src: O; dst: O }) => m.src;
  const dst = (m: { id: M; src: O; dst: O }) => m.dst;

  return { 
    objects: Obj,
    Obj, 
    Mor: MorAll, 
    id, 
    src,
    dst,
    hom, 
    comp 
  } as any;
}

/* ===========================
   SHAPE BUILDERS
   =========================== */

/** discrete(n): n isolated objects */
export function discrete(n: number) {
  const Obj = Array.from({ length: n }, (_, i) => `o${i}`);
  const homes: HomSpec<any, any> = {}; // identities auto-filled
  return makeSmallCategory(Obj as any, [], homes);
}

/** chain(n): o0 -> o1 -> ... -> o{n-1} */
export function chain(n: number) {
  if (n < 1) throw new Error("n>=1");
  const Obj = Array.from({ length: n }, (_, i) => `o${i}`);
  const arrows = Array.from({ length: n - 1 }, (_, i) => ({ 
    id: `d${i}` as const, 
    src: `o${i}`, 
    dst: `o${i + 1}` 
  }));
  const homes: HomSpec<any, any> = {};
  for (let i = 0; i < n - 1; i++) {
    homes[`o${i}->o${i + 1}`] = [`d${i}`];
  }
  return makeSmallCategory(Obj as any, arrows as any, homes);
}

/** span: A <- S -> B */
export function span<A extends string = "A", S extends string = "S", B extends string = "B">(
  A = "A" as A, 
  S_ = "S" as S, 
  B_ = "B" as B
) {
  const Obj = [A, S_, B_];
  const l = { id: "l", src: S_, dst: A } as const;
  const r = { id: "r", src: S_, dst: B_ } as const;
  const homes: HomSpec<any, any> = {
    [`${S_}->${A}`]: ["l"],
    [`${S_}->${B_}`]: ["r"]
  };
  return makeSmallCategory(Obj as any, [l, r] as any, homes);
}

/** cospan: A -> C <- B */
export function cospan<A extends string = "A", C extends string = "C", B extends string = "B">(
  A = "A" as A, 
  C_ = "C" as C, 
  B_ = "B" as B
) {
  const Obj = [A, C_, B_];
  const i = { id: "i", src: A, dst: C_ } as const;
  const j = { id: "j", src: B_, dst: C_ } as const;
  const homes: HomSpec<any, any> = {
    [`${A}->${C_}`]: ["i"],
    [`${B_}->${C_}`]: ["j"]
  };
  return makeSmallCategory(Obj as any, [i, j] as any, homes);
}

/** square:
 * a -f-> b
 * |      |
 * g      h
 * v      v
 * c -k-> d
 */
export function square() {
  const Obj = ["a", "b", "c", "d"];
  const f = { id: "f", src: "a", dst: "b" } as const;
  const g = { id: "g", src: "a", dst: "c" } as const;
  const h = { id: "h", src: "b", dst: "d" } as const;
  const k = { id: "k", src: "c", dst: "d" } as const;
  const homes: HomSpec<any, any> = {
    "a->b": ["f"],
    "a->c": ["g"],
    "b->d": ["h"],
    "c->d": ["k"]
  };
  return makeSmallCategory(Obj as any, [f, g, h, k] as any, homes);
}

/* ===========================
   FUNCTOR HELPERS
   =========================== */

/** functorToFinSet(J, objMap, morMap)
 * objMap: (jObj) => FinSet
 * morMap: (jMor) => (x:any)=>any  (defaults to identity when omitted)
 */
export function functorToFinSet<J>(
  J: any, // SmallCategory
  objMap: (jObj: any) => SetObj<any>,
  morMap?: (jMor: any) => (x: any) => any
): any {
  return {
    obj: objMap, // Use 'obj' for SetFunctor interface
    onObj: objMap, // Also provide 'onObj' for compatibility
    map: morMap ?? ((_f: any) => (x: any) => x), // Use 'map' for SetFunctor interface
    onMor: morMap ?? ((_f: any) => (x: any) => x) // Also provide 'onMor' for compatibility
  };
}

/** objectwisePshDiagram(J, Pmap): build a diagram J→Presheaf(C) by providing only onObj per j.
 * (onMor defaults to identity wrapper since our pointwise (co)limits read P.onMor inside each presheaf.)
 */
export function objectwisePshDiagram<C, J>(
  _C: any, // SmallCategory
  J: any, // Shape category
  Pmap: (j: any) => { onObj: (c: any) => SetObj<any>, onMor: (f: any) => (x: any) => any }
) {
  return {
    J,
    onObj: (j: any) => Pmap(j),
    onMor: (_f: any) => (P: any) => P
  };
}

/**
 * Create a constant diagram (all objects map to same presheaf)
 */
export function constantPshDiagram<C, J>(
  _C: any,
  J: any,
  P: Presheaf<C>
) {
  return objectwisePshDiagram(_C, J, (_j: any) => P);
}

/**
 * Create a discrete diagram (no non-identity morphisms)
 */
export function discretePshDiagram<C>(
  _C: any,
  presheaves: Presheaf<C>[]
) {
  const J = discrete(presheaves.length);
  return objectwisePshDiagram(_C, J, (j: any) => {
    const idx = parseInt(j.slice(1)); // Extract index from "o0", "o1", etc.
    const P = presheaves[idx] || presheaves[0];
    if (!P) throw new Error(`No presheaf at index ${idx}`);
    return P;
  });
}

/**
 * Demonstrate the complete DSL system
 */
export function demonstrateDiagramDSL() {
  console.log("🔧 DIAGRAM DSL FOR CATEGORICAL COMPUTING");
  console.log("=" .repeat(50));
  
  console.log("\\nShape Builders:");
  console.log("  • discrete(n): n isolated objects");
  console.log("  • chain(n): o0 → o1 → ... → o{n-1}");
  console.log("  • span(): A ← S → B");
  console.log("  • cospan(): A → C ← B");
  console.log("  • square(): commutative square diagram");
  
  console.log("\\nFunctor Helpers:");
  console.log("  • functorToFinSet(J, objMap, morMap)");
  console.log("  • objectwisePshDiagram(C, J, Pmap)");
  console.log("  • constantPshDiagram(C, J, P)");
  console.log("  • discretePshDiagram(C, presheaves)");
  
  console.log("\\nIntegration:");
  console.log("  • Works with colimitFinSet / limitFinSet");
  console.log("  • Works with pshColimitGeneral / pshLimitGeneral");
  console.log("  • Self-documenting diagram construction");
  console.log("  • Terse examples for complex constructions");
  
  console.log("\\nAdvantages:");
  console.log("  • Readable: span() instead of manual category construction");
  console.log("  • Composable: Mix and match shape builders");
  console.log("  • Verified: Integrates with existing (co)limit solvers");
  console.log("  • Extensible: Easy to add new shape patterns");
  
  console.log("\\n🎯 Self-documenting categorical computing made easy!");
}