import { SmallCategory, Obj, Mor } from "../category/core";

// A *very* tiny concrete encoding to keep focus on Small vs Large:
// We'll represent a finite group by its carrier set and operation table.
export type Elem = string | number;

export interface FinGroup {
  name: string;
  elems: Elem[];
  // op[x][y] = x * y
  op: Record<string, Record<string, Elem>>;
  id: Elem;
  inv: Record<string, Elem>;
}

export interface Hom {
  src: FinGroup;
  dst: FinGroup;
  map: Record<string, Elem>; // function on elems; must respect op.
}

function equalObj(a: Obj, b: Obj) {
  const A = a as FinGroup, B = b as FinGroup;
  return A.name === B.name; // simplistic; good enough for demo
}

function equalMor(f: Mor, g: Mor) {
  const F = f as Hom, G = g as Hom;
  if (F.src.name !== G.src.name || F.dst.name !== G.dst.name) return false;
  const keys = Object.keys(F.map);
  return keys.length === Object.keys(G.map).length &&
    keys.every(k => F.map[k] === G.map[k]);
}

export const FinGrp: SmallCategory = {
  tag: "FinGrp",

  equalObj,
  equalMor,

  dom: (f) => (f as Hom).src,
  cod: (f) => (f as Hom).dst,

  id: (a) => {
    const G = a as FinGroup;
    const map: Record<string, Elem> = {};
    for (const x of G.elems) map[String(x)] = x;
    return { src: G, dst: G, map } as Hom;
  },

  comp: (g, f) => {
    const F = f as Hom, G = g as Hom;
    if (F.dst !== G.src) throw new Error("non-composable");
    const map: Record<string, Elem> = {};
    for (const x of F.src.elems) {
      map[String(x)] = G.map[String(F.map[String(x)]!)]!;
    }
    return { src: F.src, dst: G.dst, map } as Hom;
  },

  // Explicit objects & hom-sets for the demo.
  // In a real library you'd not hardcode; here we inject via builders.
  objects(): Iterable<Obj> {
    return demoGroups();
  },

  hom(a: Obj, b: Obj): Iterable<Mor> {
    const A = a as FinGroup, B = b as FinGroup;
    const maps: Hom[] = [];
    // enumerate *all* functions A->B and keep those respecting op
    // (exponential; fine for toy sizes)
    const assign = (i: number, current: Record<string, Elem>) => {
      if (i === A.elems.length) {
        const h: Hom = { src: A, dst: B, map: { ...current } };
        if (isHom(h)) maps.push(h);
        return;
      }
      const x = A.elems[i]!;
      for (const y of B.elems) {
        current[String(x)] = y;
        assign(i + 1, current);
      }
    };
    assign(0, {});
    return maps;

    function isHom(h: Hom): boolean {
      // identity preservation
      if (h.map[String(A.id)] !== B.id) return false;
      // operation preservation
      for (const x of A.elems) for (const y of A.elems) {
        const xy = A.op[String(x)]![String(y)]!;
        const fx = h.map[String(x)]!;
        const fy = h.map[String(y)]!;
        const fxy = h.map[String(xy)]!;
        const fx_mul_fy = B.op[String(fx)]![String(fy)]!;
        if (fxy !== fx_mul_fy) return false;
      }
      return true;
    }
  },

  laws: {
    assoc: {
      assoc: () => true // inherited from function composition
    },
    id: {
      leftId: () => true,
      rightId: () => true
    }
  }
};

// --- tiny demo data ---------------------------------------------------------

export function cyclic2(): FinGroup {
  const elems = [0, 1];
  const id = 0;
  const op = {
    "0": { "0": 0, "1": 1 },
    "1": { "0": 1, "1": 0 },
  };
  const inv = { "0": 0, "1": 1 };
  return { name: "C2", elems, op, id, inv };
}

export function klein4(): FinGroup {
  const elems = ["1", "a", "b", "c"];
  const id = "1";
  const op: Record<string, Record<string, Elem>> = {};
  const row = (x: Elem, r: Record<string, Elem>) => (op[String(x)] = r);
  row("1", { "1": "1", "a": "a", "b": "b", "c": "c" });
  row("a", { "1": "a", "a": "1", "b": "c", "c": "b" });
  row("b", { "1": "b", "a": "c", "b": "1", "c": "a" });
  row("c", { "1": "c", "a": "b", "b": "a", "c": "1" });
  const inv = { "1": "1", "a": "a", "b": "b", "c": "c" };
  return { name: "V4", elems, op, id, inv };
}

function* demoGroups(): Iterable<FinGroup> {
  yield cyclic2();
  yield klein4();
}