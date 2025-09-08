# HENCHMAN_PROMPT 2: Fix TS2345 GroupHom Signature Mismatches

You are a TypeScript error fixing assistant. Your job is to fix function signature mismatches mechanically.

## THE PROBLEM
Functions are defined with `GroupHom<A, B>` but should use `GroupHom<unknown, unknown, A, B>` to match the new 4-parameter interface.

## FIND AFFECTED FUNCTIONS
```bash
npm run typecheck 2>&1 | grep "TS2345.*GroupHom.*unknown.*unknown.*number.*number.*not assignable.*GroupHom.*unknown.*unknown.*unknown.*unknown"
```

## THE MECHANICAL FIX

**Pattern 1 - Function Parameters**:
```typescript
// FIND:
export function functionName<A, B>(f: GroupHom<A, B>): ReturnType {

// REPLACE:
export function functionName<A, B>(f: GroupHom<unknown, unknown, A, B>): ReturnType {
```

**Pattern 2 - Return Types**:
```typescript
// FIND:  
): GroupHom<A, B> {

// REPLACE:
): GroupHom<unknown, unknown, A, B> {
```

**Pattern 3 - Variable Declarations**:
```typescript
// FIND:
const hom: GroupHom<A, B> = 

// REPLACE:
const hom: GroupHom<unknown, unknown, A, B> = 
```

## SPECIFIC REPLACEMENTS NEEDED

In files under `src/algebra/group/`:

1. **Search for**: `GroupHom<([^,]+),\s*([^>]+)>`
2. **Replace with**: `GroupHom<unknown, unknown, $1, $2>`

But ONLY in:
- Function parameter types
- Return types  
- Variable declarations
- Interface definitions

## SAFETY RULES
- Only change `GroupHom<A, B>` to `GroupHom<unknown, unknown, A, B>`
- Don't change `GroupHom` that already has 4 parameters
- Don't change imports/exports statements
- Skip any line you're not 100% sure about

## VALIDATION
```bash
npm run typecheck 2>&1 | grep "TS2345" | wc -l
```
Should reduce from ~44 to ~20.

## EXPECTED IMPACT  
Should fix approximately 20-25 TypeScript errors related to interface parameter mismatches.