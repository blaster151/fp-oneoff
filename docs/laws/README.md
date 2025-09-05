# Law Coverage System

A comprehensive system for ensuring mathematical structures have proper law verification through coverage manifests, CI gates, and ESLint rules.

## Overview

The law coverage system provides:

1. **Coverage Manifest**: Defines which law packs are critical/important
2. **CI Audit Script**: Fails CI if critical packs are missing or failing
3. **ESLint Rules**: Warns when exported structures lack `@lawpack` tags
4. **Test Integration**: Vitest gate for red/green testing

## Components

### 1. Coverage Manifest (`docs/laws/coverage.manifest.json`)

Defines the importance hierarchy of law packs:

```json
{
  "critical": [
    "Monoid/number/sum",
    "CompleteLattice/powerset/{1,2,3}",
    "Codensity ≅ Nat(G^A, G)"
  ],
  "important": [
    "Monoid/string/concat",
    "Poset/number/leq",
    "Group/finite",
    "AbelianGroup/finite",
    "Ring/Zn",
    "Ring/M2(Zn)",
    "Ring/Poly(Zn)[trunc]",
    "Spec(Zn)",
    "CPO/powerset",
    "Adjunction/Galois/basic",
    "Recursion/HFunctor",
    "Recursion/cata-histo-zygo"
  ],
  "allowlistTags": []
}
```

**Categories:**
- **Critical**: Must be present and passing for CI to succeed
- **Important**: Should be present but don't block CI
- **Allowlist**: Tags that are intentionally skipped (experiments, WIP)

### 2. CI Audit Script (`scripts/audit/law_coverage.ts`)

**Purpose**: Fails CI if any critical tag is missing or any registered pack has failing laws.

**Usage**:
```bash
ts-node scripts/audit/law_coverage.ts
```

**What it checks**:
- All critical law packs are registered
- All registered law packs pass their laws
- No failing law packs (unless allowlisted)

**Output**:
- ✅ Success: Lists all registered packs
- ❌ Failure: Details missing/failing packs

### 3. ESLint Rule (`eslint-rules/require-lawpack-tag.js`)

**Purpose**: Warns when a module exports a "structure interface" or "instance" but lacks a `@lawpack <Tag>` JSDoc.

**Triggered by**:
- Exported interfaces/types with structure names: `Monoid`, `Group`, `Ring`, `Poset`, etc.
- Exported constants with structure names: `StringMonoid`, `ZnRing`, etc.

**Usage Convention**:
```typescript
/**
 * @lawpack Ring/Zn
 */
export const ZnRing = /* ... */;

/**
 * @lawpack Monoid/string/concat
 */
export interface StringMonoid {
  empty: string;
  concat: (a: string, b: string) => string;
}
```

**Configuration** (`.eslintrc.cjs`):
```javascript
module.exports = {
  rules: {
    "project/require-lawpack-tag": "warn"
  }
};
```

### 4. Test Integration (`src/laws/__tests__/coverage_audit.test.ts`)

**Purpose**: Provides a Vitest gate that mirrors the CI audit.

**Usage**:
```bash
npx vitest run src/laws/__tests__/coverage_audit.test.ts
```

**Benefits**:
- Red/green testing in development
- CI can just run tests instead of separate scripts
- Integrated with existing test infrastructure

## Workflow

### Adding New Law Packs

1. **Implement the structure** with proper law verification
2. **Register the law pack** in `src/laws/packs.ts`:
   ```typescript
   const pack = lawfulMonoid("MyTag", eq, monoid, samples);
   pack.run = () => runLaws(pack.laws, { M: monoid, xs: samples });
   registerLawful(pack);
   ```
3. **Add to manifest** if critical or important
4. **Add JSDoc tags** to exported structures
5. **Test locally**: `ts-node scripts/audit/law_coverage.ts`
6. **Run tests**: `npx vitest run src/laws/__tests__/coverage_audit.test.ts`

### CI Integration

**GitHub Actions example**:
```yaml
- name: Law Coverage Audit
  run: ts-node scripts/audit/law_coverage.ts

- name: Run Law Tests
  run: npx vitest run src/laws/__tests__/
```

**Local development**:
```bash
# Check coverage
ts-node scripts/audit/law_coverage.ts

# Run all law tests
npx vitest run src/laws/__tests__/

# Lint for missing tags
npx eslint src/ --ext .ts
```

## Current Status

**Critical Packs** (✅ All Present):
- `Monoid/number/sum`: Addition monoid laws
- `CompleteLattice/powerset/{1,2,3}`: Powerset lattice laws
- `Codensity ≅ Nat(G^A, G)`: Codensity equivalence laws

**Important Packs** (⚠️ Some Missing):
- `Monoid/string/concat`: ✅ Present
- `Poset/number/leq`: ✅ Present
- `Ring/Zn`: ✅ Present
- `Ring/Poly(Zn)[trunc]`: ✅ Present
- `CPO/powerset`: ✅ Present
- `Group/finite`: ❌ Missing
- `AbelianGroup/finite`: ❌ Missing
- `Ring/M2(Zn)`: ❌ Missing
- `Spec(Zn)`: ❌ Missing
- `Adjunction/Galois/basic`: ❌ Missing
- `Recursion/HFunctor`: ❌ Missing
- `Recursion/cata-histo-zygo`: ❌ Missing

## Best Practices

### Law Pack Tags

**Naming Convention**:
- `Structure/Type/Subtype`: `Monoid/number/sum`
- `Structure/Implementation`: `Ring/Zn`
- `Equivalence/Description`: `Codensity ≅ Nat(G^A, G)`
- `Category/Structure`: `CPO/powerset`

**Examples**:
```typescript
"Monoid/string/concat"
"Ring/Zn"
"Ring/Poly(Zn)[trunc]"
"CompleteLattice/powerset/{1,2,3}"
"Codensity ≅ Nat(G^A, G)"
```

### JSDoc Tags

**Format**: `@lawpack <Tag>`

**Examples**:
```typescript
/**
 * @lawpack Monoid/string/concat
 */
export const StringMonoid = { /* ... */ };

/**
 * @lawpack Ring/Zn
 */
export const ZnRing = (n: number) => { /* ... */ };
```

### Registry Integration

**Custom Run Methods**: Always provide custom `run` methods for law packs:
```typescript
const pack = lawfulMonoid("MyTag", eq, monoid, samples);
pack.run = () => runLaws(pack.laws, { M: monoid, xs: samples });
registerLawful(pack);
```

**Environment Handling**: Ensure law packs receive the correct environment parameters for their law checks.

## Troubleshooting

### Common Issues

1. **"Missing CRITICAL packs"**: Add the missing law packs to `src/laws/packs.ts`
2. **"Failing law packs"**: Check the law implementations and test data
3. **ESLint warnings**: Add `@lawpack <Tag>` JSDoc to exported structures
4. **Registry errors**: Ensure law packs have proper `run` methods

### Debug Commands

```bash
# Check registered packs
npx tsx -e "import('./src/laws/packs').then(() => import('./src/laws/registry').then(({allLawful}) => console.log(allLawful().map(p => p.tag))))"

# Run specific law pack
npx tsx -e "import('./src/laws/packs').then(() => import('./src/laws/registry').then(({runAll}) => console.log(runAll())))"

# Check ESLint
npx eslint src/laws/examples/ESLintDemo.ts
```

## Future Enhancements

1. **Automatic tag inference**: Infer law pack tags from JSDoc comments
2. **Coverage reporting**: Generate coverage reports for law verification
3. **Performance monitoring**: Track law verification performance
4. **Integration with other tools**: Connect with property-based testing frameworks
5. **Documentation generation**: Auto-generate law documentation from registered packs