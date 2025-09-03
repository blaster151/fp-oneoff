/** @math DEF-YONEDA @math DEF-COYONEDA @math REL-ISBELL-CODENSITY */

import { SetObj } from "./catkit-kan.js";
import { SmallCategory } from "./category-to-nerve-sset.js";
import type { Presheaf, NatPsh } from "./presheaf.js";
import { checkNaturality as checkNatPsh } from "./presheaf.js";
import type { Copresheaf, NatCo } from "./copresheaf.js";
import { checkNaturalityCo as checkNatCo } from "./copresheaf.js";

type Obj<C> = C extends SmallCategory<infer O, any> ? O : never;
type Mor<C> = C extends SmallCategory<any, infer M> ? M : never;

/** Yoneda y(c): a |-> Hom(a,c); contravariant on mor */
export function Yoneda<C>(Ccat: any) {
  const y = (c: any): any => ({
    onObj: (a: any) => Ccat.hom ? Ccat.hom(a, c) : { id: `hom-${a}-${c}`, elems: [], eq: (x: any, y: any) => x === y },
    onMor: (f: any) => (h: any) => Ccat.comp ? Ccat.comp(h, f) : h, // precompose
  });
  return { y };
}

/** co-Yoneda ŷ(c): a |-> Hom(c,a); covariant on mor */
export function coYoneda<C>(Ccat: any) {
  const yhat = (c: any): any => ({
    onObj: (a: any) => Ccat.hom ? Ccat.hom(c, a) : { id: `hom-${c}-${a}`, elems: [], eq: (x: any, y: any) => x === y },
    onMor: (f: any) => (h: any) => Ccat.comp ? Ccat.comp(f, h) : h, // postcompose
  });
  return { yhat };
}

/** Isbell conjugates:
 *  O(F)(c)   = Nat(F, y(c))          (copresheaf in c by post-composition)
 *  Spec(G)(c)= Nat(ŷ(c), G)          (presheaf in c by pre-composition)
 */
export function Isbell<C>(Ccat: any) {
  const { y } = Yoneda(Ccat);
  const { yhat } = coYoneda(Ccat);

  function O(F: any): any {
    return {
      onObj: (c: any) => {
        // elements are natural transformations α: F => y(c)
        const As = enumerateNatPsh(Ccat, F, y(c));
        return { id: `O(F)(${c})`, elems: As, eq: (x: any, y: any) => JSON.stringify(x) === JSON.stringify(y) };
      },
      onMor: (f: any) => {
        // f:c->d; y(f): y(c)->y(d); post-compose α |-> y(f)∘α
        const yf = natYoneda(Ccat, f);
        return (alpha: any) => composeNatPsh(Ccat, yf, alpha);
      },
    };
  }

  function Spec(G: any): any {
    return {
      onObj: (c: any) => {
        const As = enumerateNatCo(Ccat, yhat(c), G);
        return { id: `Spec(G)(${c})`, elems: As, eq: (x: any, y: any) => JSON.stringify(x) === JSON.stringify(y) };
      },
      onMor: (f: any) => {
        // f:c->d; ŷ(f): ŷ(d)->ŷ(c); pre-compose β |-> β ∘ ŷ(f)
        const yhf = natCoYoneda(Ccat, f);
        return (beta: any) => composeNatCo(Ccat, beta, yhf);
      },
    };
  }

  return { 
    O, 
    Spec, 
    y, 
    yhat, 
    checkNatPsh: (P: any, Q: any, a: any) => checkNatPsh(Ccat, P, Q, a),
    checkNatCo: (Q: any, R: any, a: any) => checkNatCo(Ccat, Q, R, a) 
  };
}

/* ---------- helpers (finite enumeration + composition) ---------- */

function enumerateNatPsh(C: any, P: any, Q: any): any[] {
  // brute-force components and filter by naturality (finite only)
  const objects = C.objects || C.Obj || [];
  
  // Get all function choices for each object
  const choices = objects.map((a: any) => functionSpace(P.onObj(a), Q.onObj(a)));
  const maps = cartesianMaps(objects, choices);
  
  const toNat = (m: Map<string, (x: any) => any>): any => ({
    at: (c: any) => (x: any) => {
      const f = m.get(`${c}`);
      return f ? f(x) : x;
    }
  });
  
  return maps.map(toNat).filter((alpha: any) => checkNatPsh(C, P, Q, alpha));
}

function enumerateNatCo(C: any, Q: any, R: any): any[] {
  const objects = C.objects || C.Obj || [];
  const choices = objects.map((a: any) => functionSpace(Q.onObj(a), R.onObj(a)));
  const maps = cartesianMaps(objects, choices);
  
  const toNat = (m: Map<string, (x: any) => any>): any => ({
    at: (c: any) => (x: any) => {
      const f = m.get(`${c}`);
      return f ? f(x) : x;
    }
  });
  
  return maps.map(toNat).filter((alpha: any) => checkNatCo(C, Q, R, alpha));
}

function functionSpace(A: SetObj<any>, B: SetObj<any>): Array<(x: any) => any> {
  const a = Array.from(A.elems);
  const b = Array.from(B.elems);
  const out: Array<(x: any) => any> = [];
  const m = b.length;
  const n = a.length;
  
  if (n === 0) return [(_x: any) => { throw new Error("empty domain"); }];
  
  const idx = new Array(n).fill(0);
  const total = Math.pow(m, n);
  
  for (let k = 0; k < total; k++) {
    const table = idx.map(i => b[i]);
    out.push((x: any) => {
      const index = a.findIndex((v: any) => A.eq ? A.eq(v, x) : Object.is(v, x));
      return index >= 0 ? table[index] : x;
    });
    
    // Increment index array
    for (let i = 0, carry = 1; i < n && carry; i++) {
      idx[i] += carry;
      if (idx[i] === m) {
        idx[i] = 0;
        carry = 1;
      } else {
        carry = 0;
      }
    }
  }
  return out;
}

function cartesianMaps(objs: any[], choices: Array<Array<(x: any) => any>>): Map<string, (x: any) => any>[] {
  const out: Map<string, (x: any) => any>[] = [];
  
  function go(i: number, acc: Map<string, (x: any) => any>): void {
    if (i === objs.length) {
      out.push(new Map(acc));
      return;
    }
    for (const f of choices[i]!) {
      acc.set(`${objs[i]}`, f);
      go(i + 1, acc);
      acc.delete(`${objs[i]}`);
    }
  }
  
  go(0, new Map());
  return out;
}

function natYoneda(C: any, f: any): any {
  // y(f): y(src(f)) -> y(dst(f)); at a: Hom(a,src) -> Hom(a,dst), h |-> f∘h
  return { 
    at: (a: any) => (h: any) => {
      try {
        return C.comp ? C.comp(f, h) : h;
      } catch (e) {
        return h;
      }
    }
  };
}

function natCoYoneda(C: any, f: any): any {
  // ŷ(f): ŷ(dst) -> ŷ(src); at a: Hom(dst,a) -> Hom(src,a), h |-> h∘f
  return { 
    at: (_a: any) => (h: any) => {
      try {
        return C.comp ? C.comp(h, f) : h;
      } catch (e) {
        return h;
      }
    }
  };
}

function composeNatPsh(C: any, beta: any, alpha: any): any {
  return { 
    at: (a: any) => (x: any) => {
      try {
        return beta.at(a)(alpha.at(a)(x));
      } catch (e) {
        return x;
      }
    }
  };
}

function composeNatCo(C: any, alpha: any, gamma: any): any {
  return { 
    at: (a: any) => (x: any) => {
      try {
        return alpha.at(a)(gamma.at(a)(x));
      } catch (e) {
        return x;
      }
    }
  };
}