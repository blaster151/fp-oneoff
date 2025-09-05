# Adopting the Domain-Theory Layer (CPO + lfpΩ)

## What to replace
- `while (changed) { ... }` loops that compute a closure or fixed-point.
- worklist iterations that monotonically enlarge a set until stabilization.

## Replacement
- Model your state space as a **CPO** (e.g., `powersetCPO`).
- Write the step function `f` as a monotone map on that CPO.
- Compute the fixed-point with `lfpOmega(CPO, f)`.

## Why it's better
- Semantics are clear (Knaster–Tarski / Kleene).
- Code is shorter and harder to get subtly wrong.
- Easy to test: `f(lfp) = lfp` and minimality (≤ any prefixed point).

## Tooling
- `scripts/find-domain-adoption.ts` prints candidate sites.
- ESLint rule `prefer-lfpomega-when-domain-imported` nudges refactors.
- `scripts/bench/lfpomega_bench.ts` compares while-changed vs lfpΩ.

## Quick pattern
```ts
import { powersetCPO, lfpOmega } from "../order/Domain";

const C = powersetCPO(universe, eq);
const f = (S: Thing[]) => /* monotone expansion of S */;
const fix = lfpOmega(C, f);
```

## Examples

### Before (traditional while loop)
```ts
function computeClosure(initial: Set<string>): Set<string> {
  let current = new Set(initial);
  let changed = true;
  while (changed) {
    changed = false;
    const next = new Set(current);
    for (const item of current) {
      if (item === "a" && !next.has("b")) {
        next.add("b");
        changed = true;
      }
      if (item === "b" && !next.has("c")) {
        next.add("c");
        changed = true;
      }
    }
    current = next;
  }
  return current;
}
```

### After (domain theory)
```ts
import { powersetCPO, lfpOmega } from "../order/Domain";

function computeClosure(initial: string[]): string[] {
  const universe = ["a", "b", "c"];
  const C = powersetCPO(universe, (x, y) => x === y);
  
  const f = (S: string[]) => {
    const out = S.slice();
    if (S.includes("a") && !out.includes("b")) out.push("b");
    if (S.includes("b") && !out.includes("c")) out.push("c");
    return out;
  };
  
  return lfpOmega(C, f);
}
```

## Benefits

1. **Mathematical clarity**: The fixed point semantics are explicit
2. **Fewer bugs**: No manual change tracking or loop conditions
3. **Testability**: Easy to verify `f(fix) = fix`
4. **Performance**: Optimized iteration with convergence detection
5. **Composability**: Functions can be easily composed and tested

## Migration checklist

- [ ] Identify while loops that compute closures or fixed points
- [ ] Model the state space as a CPO (usually `powersetCPO`)
- [ ] Extract the step function as a pure monotone function
- [ ] Replace the loop with `lfpOmega(CPO, f)`
- [ ] Add tests for fixed point property: `f(fix) = fix`
- [ ] Verify the result matches the original implementation