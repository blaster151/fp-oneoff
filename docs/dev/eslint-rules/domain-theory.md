# ESLint Rules for Domain Theory Adoption

## Suggested Rule: `prefer-lfpomega-when-domain-imported`

This rule would detect patterns that could be replaced with domain theory constructs when the domain theory module is imported.

### Patterns to detect:

1. **While loops with change tracking:**
```ts
let changed = true;
while (changed) {
  changed = false;
  // ... modification logic
}
```

2. **Worklist algorithms:**
```ts
const worklist = [...initial];
while (worklist.length > 0) {
  const item = worklist.pop();
  // ... process item and add to worklist
}
```

3. **Set expansion patterns:**
```ts
let current = new Set(initial);
let changed = true;
while (changed) {
  changed = false;
  for (const item of current) {
    if (condition && !current.has(newItem)) {
      current.add(newItem);
      changed = true;
    }
  }
}
```

### Suggested fixes:

1. **Replace with lfpOmega:**
```ts
import { powersetCPO, lfpOmega } from "../order/Domain";

const C = powersetCPO(universe, eq);
const f = (S: Set<Item>) => {
  const out = new Set(S);
  // ... expansion logic
  return out;
};
const result = lfpOmega(C, f);
```

2. **Replace with closure operators:**
```ts
import { closureOnX } from "../order/Galois";

const closure = closureOnX(galoisConnection);
const result = closure(initial);
```

### Rule configuration:

```json
{
  "rules": {
    "prefer-lfpomega-when-domain-imported": [
      "warn",
      {
        "imports": ["../order/Domain", "../order/Galois"],
        "patterns": ["while-changed", "worklist", "set-expansion"]
      }
    ]
  }
}
```

### Implementation notes:

- Only trigger when domain theory modules are imported
- Provide specific suggestions based on detected patterns
- Include performance considerations in suggestions
- Link to adoption guide for detailed migration steps

### Benefits:

- **Consistency**: Encourages use of domain theory patterns
- **Correctness**: Reduces bugs from manual change tracking
- **Maintainability**: Makes fixed point semantics explicit
- **Performance**: Can suggest optimizations for specific cases