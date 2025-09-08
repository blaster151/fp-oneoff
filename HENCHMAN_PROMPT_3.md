# HENCHMAN PROMPT 3: Fix Array Access "Possibly Undefined" Errors (TS18048)

You are a TypeScript error fixing assistant. Your job is to add null checks for array access.

## THE PROBLEM
`noUncheckedIndexedAccess: true` requires null checks when accessing arrays with `array[index]`.

## FIND ERRORS
```bash
npm run typecheck 2>&1 | grep "TS18048.*possibly.*undefined"
```

## MECHANICAL FIX PATTERNS

### Pattern A: Simple Property Access
```typescript
// FIND:
const x = array[i].property;

// REPLACE:  
const item = array[i];
if (item === undefined) throw new Error("Array index out of bounds");
const x = item.property;
```

### Pattern B: Method Calls
```typescript
// FIND:
return array[index].method();

// REPLACE:
const item = array[index];
if (item === undefined) throw new Error("Array index out of bounds");
return item.method();
```

### Pattern C: Conditional Access
```typescript
// FIND:
if (array[i].property) { ... }

// REPLACE:
const item = array[i];
if (item !== undefined && item.property) { ... }
```

### Pattern D: Assignment
```typescript
// FIND:
array[i].property = value;

// REPLACE:
const item = array[i];
if (item !== undefined) {
  item.property = value;
}
```

## SEARCH AND REPLACE RULES

1. **Find pattern**: `(\w+)\[([^\]]+)\]\.(\w+)`
2. **Replace with**: 
```
const item = $1[$2];
if (item === undefined) throw new Error("Array access out of bounds");  
item.$3
```

3. **Find pattern**: `(\w+)\[([^\]]+)\]\.(\w+\([^)]*\))`
4. **Replace with**:
```
const item = $1[$2];
if (item === undefined) throw new Error("Array access out of bounds");
item.$3
```

## FILES TO TARGET
Focus on files in `src/algebra/group/` that have TS18048 errors:
- Look for array access patterns like `table[i][j]`, `elems[index].prop`, etc.

## VALIDATION
```bash
npm run typecheck 2>&1 | grep "TS18048" | wc -l  
```
Should reduce from ~12 to ~0.

## SAFETY RULES
- Only add checks for array access followed by property/method access
- Don't change array access that's just getting the value (like `array[i]` by itself)
- Use descriptive error messages
- If unsure about the fix, skip it

## EXPECTED IMPACT
Should fix approximately 10-12 TypeScript errors.