# TypeScript Error Fix Prompts for Older LLMs

## Overview
These are detailed prompts for mechanical TypeScript error fixes that can be executed by older/cheaper LLMs. Each prompt is self-contained with specific search patterns and replacement rules.

---

## PROMPT 1: Fix TS2345 "Argument Type Mismatch" Errors (44 errors)

**Context**: Functions expecting `GroupHom<unknown, unknown, unknown, unknown>` but getting specific types like `GroupHom<unknown, unknown, number, number>`.

**Search Pattern**: 
```bash
npm run typecheck 2>&1 | grep "TS2345.*GroupHom.*unknown.*unknown.*number.*number.*not assignable.*GroupHom.*unknown.*unknown.*unknown.*unknown"
```

**Fix Strategy**:
1. Find all functions with signature `GroupHom<A, B>` that should be `GroupHom<unknown, unknown, A, B>`
2. Update their signatures to use the 4-parameter version

**Specific Files to Fix**:
- Search for: `function.*<A.*B>.*GroupHom<A.*B>`
- Replace with: `function.*<A.*B>.*GroupHom<unknown, unknown, A, B>`

**Example Fix**:
```typescript
// BEFORE:
export function someFunction<A, B>(f: GroupHom<A, B>): ReturnType {

// AFTER: 
export function someFunction<A, B>(f: GroupHom<unknown, unknown, A, B>): ReturnType {
```

**Files Likely Affected**: Any function in `src/algebra/group/` that takes `GroupHom<A, B>` parameters.

---

## PROMPT 2: Fix TS2339 "Property Does Not Exist" - Missing Interface Properties (63 errors)

**Context**: Multiple interface versions causing property mismatches.

### Sub-pattern 2A: Missing 'witnesses' property
**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "Property 'witnesses' does not exist"
```

**Fix Strategy**: These are test files importing from wrong module.
- Change imports from `../../../structures/group/Hom.js` to `../Hom`
- This switches from structures GroupHom (no witnesses) to algebra GroupHom (has witnesses)

### Sub-pattern 2B: Missing 'show' property  
**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "Property 'show' does not exist"
```

**Fix Strategy**: Remove all `.show` property access and replace with `String()`:
- Replace: `obj.show!(value)` with `String(value)`
- Replace: `obj.show ? obj.show(x) : String(x)` with `String(x)`

### Sub-pattern 2C: Missing 'name' vs 'label' property
**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "Property 'name' does not exist"
```

**Fix Strategy**: Replace `.name` with `.label` for structures interfaces:
- Replace: `obj.name` with `(obj as any).label`
- Replace: `obj.name ?? "default"` with `(obj as any).label ?? "default"`

---

## PROMPT 3: Fix TS2322 "Type Assignment Mismatch" - Interface Conflicts (28 errors)

**Context**: Two different FiniteGroup interfaces causing assignment conflicts.

**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "TS2322.*FiniteGroup.*algebra.*FiniteGroup.*structures"
```

**Fix Strategy**: Use consistent imports within each file.

**Rule**: If file imports from `./structures`, use structures types throughout:
```typescript
// CHANGE:
import { FiniteGroup } from "./Group";
import { Group } from "./structures";

// TO:
import { Group } from "./structures";  // Use structures version consistently
```

**Rule**: If file imports from `./Group`, use algebra types throughout:
```typescript
// CHANGE:  
import { Group } from "./structures";
import { FiniteGroup } from "./Group";

// TO:
import { FiniteGroup } from "./Group";  // Use algebra version consistently
```

---

## PROMPT 4: Fix TS18048 "Possibly Undefined" Array Access (12 errors)

**Context**: `noUncheckedIndexedAccess` requires null checks for array access.

**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "TS18048.*possibly.*undefined"
```

**Mechanical Fix Pattern**:
```typescript
// BEFORE:
const x = array[i];
if (x.property) { ... }

// AFTER:
const x = array[i];
if (x !== undefined && x.property) { ... }

// BEFORE:
return array[i].method();

// AFTER:
const item = array[i];
if (item === undefined) throw new Error("Array access out of bounds");
return item.method();
```

**Search and Replace Rules**:
1. Find: `array\[([^\]]+)\]\.` 
2. Replace with bounds check pattern

---

## PROMPT 5: Fix TS2353 "Unknown Properties" - exactOptionalPropertyTypes (4 errors)

**Context**: `exactOptionalPropertyTypes: true` prevents assigning `undefined` to optional properties.

**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "TS2353.*may only specify known properties"
```

**Fix Pattern**:
```typescript
// BEFORE:
return { 
  requiredProp: value,
  optionalProp: maybeUndefinedValue,
  anotherOptional: anotherMaybeUndefined
};

// AFTER:
const result = { requiredProp: value };
if (maybeUndefinedValue !== undefined) (result as any).optionalProp = maybeUndefinedValue;
if (anotherMaybeUndefined !== undefined) (result as any).anotherOptional = anotherMaybeUndefined;
return result;
```

---

## PROMPT 6: Fix TS7006 "Implicit Any" Parameters (10 errors)

**Context**: Function parameters without explicit types.

**Search Pattern**:
```bash
npm run typecheck 2>&1 | grep "TS7006.*implicitly has an 'any' type"
```

**Mechanical Fix**: Add type annotations to all function parameters.

**Pattern**:
```typescript
// BEFORE:
array.map(x => x.property)
array.filter((item, index) => condition)
function(x, y) { return x + y; }

// AFTER:  
array.map((x: ElementType) => x.property)
array.filter((item: ElementType, index: number) => condition)
function(x: Type1, y: Type2) { return x + y; }
```

---

## EXECUTION ORDER FOR MAXIMUM EFFICIENCY

1. **PROMPT 2 first** (63 errors) - Biggest impact
2. **PROMPT 1 second** (44 errors) - Second biggest
3. **PROMPT 3 third** (28 errors) - Interface unification
4. **PROMPT 4, 5, 6** - Cleanup remaining smaller issues

---

## VALIDATION COMMAND

After each prompt execution:
```bash
npm run typecheck 2>&1 | grep -E "error TS[0-9]+" | wc -l
```

Expected progression: 188 → ~125 → ~80 → ~50 → ~40 → ~30

## SAFETY NOTE

These prompts are designed for mechanical fixes. If an older LLM encounters an error it doesn't understand, it should skip that specific fix rather than guess.