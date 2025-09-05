import { Term, Var, App } from "../Term";
import { Signature, opOf } from "../Signature";
import { normalize, rule, RewriteRule, normalizeHead, key } from "./Rules";
import { must } from "../../util/guards";

/** Canonical right-association of a flat list with a fixed binary op symbol. */
function packRight(op: any, xs: Term[]): Term {
  if (xs.length === 0) throw new Error("packRight: empty list");
  let acc = xs[xs.length - 1];
  for (let i = xs.length - 2; i >= 0; i--) acc = App(op, [xs[i], acc]);
  return acc;
}

/** Flatten nested occurrences of `op` and collect arguments left-to-right. */
function flatten(op: any, t: Term): Term[] {
  if ((t as any).tag !== "App") return [t];
  const { op: o, args } = t as any;
  if (o !== op) return [t];
  const out: Term[] = [];
  for (const a of args as Term[]) out.push(...flatten(op, a));
  return out;
}

function isUnit(unit: Term): (t: Term) => boolean {
  const ku = JSON.stringify(unit);
  return (t: Term) => JSON.stringify(t) === ku;
}

/** ===== MONOID (assoc + unit), no commutativity ===== */
export function monoidNormalForm(sig: Signature, opName = "mul", unitName = "e") {
  const op = must(opOf(sig, opName), "unknown operator: " + opName);
  const e = must(opOf(sig, unitName), "unknown operator: " + unitName);
  const E = App(e, []);
  const ac = { name: op.name, assoc: true, comm: false, idem: false };

  // Head rules to delete units; assoc handled by ac.assoc=true
  const rules: RewriteRule[] = [
    rule(App(op, [App(e, []), Var(0)]), Var(0), ac),
    rule(App(op, [Var(0), App(e, [])]), Var(0), ac),
  ];

  return {
    /** Compute canonical normal form:
     *  - normalize children
     *  - flatten by assoc
     *  - drop units
     *  - right-associate
     */
    nf(t: Term): Term {
      // First, run engine to clear trivial e's and normalize heads
      const t0 = normalize(t, rules);
      // Recursively normalize subterms
      const rec = (u: Term): Term => {
        if ((u as any).tag !== "App") return u;
        const u1 = App((u as any).op, (u as any).args.map(rec));
        const u2 = normalizeHead(u1, ac); // flatten if needed at head
        if ((u2 as any).op !== op) return u2;
        // Now we have a possibly flat form; collect args, drop units, pack right
        const xs = flatten(op, u2).filter(a => !isUnit(E)(a));
        if (xs.length === 0) return E;       // all units => unit
        if (xs.length === 1) return xs[0];   // single arg => itself
        return packRight(op, xs);
      };
      return rec(t0);
    }
  };
}

/** ===== SEMILATTICE (ACI + unit) ===== */
export function semilatticeNormalForm(sig: Signature, opName = "join", unitName = "bot") {
  const op = must(opOf(sig, opName), "unknown operator: " + opName);
  const e = must(opOf(sig, unitName), "unknown operator: " + unitName);
  const ac = { name: op.name, assoc: true, comm: true, idem: true };

  // unit deletion rules; AC(I) at head supplies flatten/sort/dedup
  const rules: RewriteRule[] = [
    rule(App(op, [App(e, []), Var(0)]), Var(0), ac),
    rule(App(op, [Var(0), App(e, [])]), Var(0), ac),
  ];

  return {
    /** Canonical ACI NF:
     *  - normalize children
     *  - AC(I) head-normalize: flatten, sort, dedup
     *  - remove units and re-normalize to ensure fixed point
     */
    nf(t: Term): Term {
      const t0 = normalize(t, rules);
      const rec = (u: Term): Term => {
        if ((u as any).tag !== "App") return u;
        const u1 = App((u as any).op, (u as any).args.map(rec));
        const u2 = normalizeHead(u1, ac);
        if ((u2 as any).op !== op) return u2;
        // Remove unit arguments if any survived, then head-normalize again for dedup/sort
        const xs = (u2 as any).args.filter((a: Term) => key(a) !== key(App(e, [])));
        const u3 = App(op, xs.length ? xs : [App(e, [])]);
        return normalizeHead(u3, ac);
      };
      return rec(t0);
    }
  };
}