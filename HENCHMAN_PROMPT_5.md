# HENCHMAN PROMPT 5: Fix "Implicit Any" Parameter Types (TS7006)

You are a TypeScript error fixing assistant. Your job is to add explicit type annotations to function parameters.

## THE PROBLEM
Functions have parameters without explicit types, causing "implicitly has an 'any' type" errors.

## FIND ERRORS
```bash
npm run typecheck 2>&1 | grep "TS7006.*implicitly has an 'any' type"
```

## MECHANICAL FIX PATTERNS

### Pattern A: Array Method Callbacks
```typescript
// FIND:
array.map(x => ...)
array.filter(item => ...)  
array.every((x, i) => ...)

// REPLACE:
array.map((x: any) => ...)
array.filter((item: any) => ...)
array.every((x: any, i: number) => ...)
```

### Pattern B: Function Definitions
```typescript
// FIND:
function name(x, y) { ... }
const func = (a, b) => { ... }

// REPLACE:
function name(x: any, y: any) { ... }  
const func = (a: any, b: any) => { ... }
```

### Pattern C: Object Method Definitions
```typescript
// FIND:
{
  method: (x, y) => { ... }
}

// REPLACE:
{
  method: (x: any, y: any) => { ... }
}
```

## SPECIFIC SEARCH COMMANDS

Use these to find instances:

```bash
# Find arrow functions with untyped params
rg "\(([^:)]+)\) =>" src/algebra/group/

# Find function definitions with untyped params  
rg "function \w+\([^:)]+\)" src/algebra/group/

# Find method definitions with untyped params
rg ":\s*\([^:)]+\) =>" src/algebra/group/
```

## REPLACEMENT STRATEGY

1. **For generic contexts**: Use `any` type
2. **For array callbacks**: First param is usually array element type, second is usually `number` (index)
3. **For comparisons**: Usually the same type as the array/object being compared

## EXAMPLES FROM CURRENT ERRORS

```typescript
// Current error in Congruence.ts:
elems.every(x => elems.every(y => ...))
// Fix:
elems.every((x: any) => elems.every((y: any) => ...))

// Current error in group definitions:
op: (x, y) => x + y
// Fix:  
op: (x: number, y: number) => x + y
```

## VALIDATION
```bash
npm run typecheck 2>&1 | grep "TS7006" | wc -l
```
Should reduce from ~10 to 0.

## SAFETY RULES
- Use `any` when the specific type is unclear
- For mathematical operations, use appropriate number types
- For string operations, use string types
- When in doubt, use `any` rather than guessing wrong

## EXPECTED IMPACT
Should fix approximately 10 TypeScript errors related to implicit any parameters.