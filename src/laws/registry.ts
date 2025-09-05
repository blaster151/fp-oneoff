import { runLaws, Lawful } from "./Witness";

type AnyLawful = Lawful<any, any>;

const _packs: AnyLawful[] = [];

/** Register a witness pack once (e.g., from its module init or a test bootstrap). */
export function registerLawful(pack: AnyLawful) {
  _packs.push(pack);
}

/** Optional: clear (for isolated tests) */
export function clearLawful() {
  _packs.length = 0;
}

/** Snapshot of all registered packs. */
export function allLawful(): ReadonlyArray<AnyLawful> {
  return _packs.slice();
}

/** Run everything and return a report. */
export function runAll() {
  const report = _packs.map(p => {
    // Most law packs expect a small env; we pass what their laws expect.
    // If a pack exports a custom `run`, prefer that.
    const custom = (p as any).run as undefined | (() => { ok: boolean; failures: any[] });
    if (typeof custom === "function") {
      const r = custom();
      return { tag: p.tag, ok: r.ok, failures: r.failures };
    }
    // Generic path: law checks typically read their own env from closure;
    // For monoid laws, we need to provide the expected environment structure
    let env: any = {};
    if (p.tag.includes("Monoid")) {
      // Monoid laws expect { M, xs } environment
      env = { M: p.struct, xs: [p.struct.empty] };
    } else if (p.tag.includes("Poset") || p.tag.includes("CompleteLattice")) {
      // Poset laws expect { P } environment
      env = { P: p.struct };
    }
    const r = runLaws((p.laws as any), env);
    return { tag: p.tag, ok: r.ok, failures: r.failures };
  });
  return report;
}