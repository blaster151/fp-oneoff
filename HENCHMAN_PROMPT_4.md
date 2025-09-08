# HENCHMAN PROMPT 4: Fix "Property Name/Label Mismatch" Errors

You are a TypeScript error fixing assistant. Your job is to fix property name mismatches mechanically.

## THE PROBLEM
Code is accessing `.name` property on interfaces that have `.label` property instead.

## FIND ERRORS
```bash
npm run typecheck 2>&1 | grep "Property 'name' does not exist"
```

## THE MECHANICAL FIX

### Rule 1: Simple Property Access
```typescript
// FIND:
obj.name

// REPLACE:
(obj as any).label
```

### Rule 2: Null Coalescing
```typescript
// FIND:
obj.name ?? "default"

// REPLACE:  
(obj as any).label ?? "default"
```

### Rule 3: Template Literals
```typescript
// FIND:
`${obj.name}`

// REPLACE:
`${(obj as any).label ?? 'Unknown'}`
```

### Rule 4: Object Property Assignment
```typescript
// FIND:
{ name: someValue }

// REPLACE:
{ } // then separately: if (someValue !== undefined) (result as any).label = someValue;
```

## SPECIFIC SEARCH PATTERNS

Use these ripgrep commands to find instances:

```bash
# Find .name property access
rg "\.name(?!\s*[=:])" src/algebra/group/

# Find name in object literals  
rg "name\s*:" src/algebra/group/

# Find name in template literals
rg "\$\{[^}]*\.name" src/algebra/group/
```

## FILES TO TARGET
Based on current errors, focus on:
- `src/algebra/group/SecondIso.ts`
- `src/algebra/group/ThirdIso.ts` 
- `src/algebra/group/SubgroupOps.ts`
- Any other files with "Property 'name' does not exist" errors

## REPLACEMENTS TO MAKE

1. **In property access**: `.name` → `(obj as any).label`
2. **In object literals**: Remove `name: value` and add conditional assignment
3. **In string templates**: `${obj.name}` → `${(obj as any).label ?? 'Unknown'}`

## VALIDATION
```bash
npm run typecheck 2>&1 | grep "Property 'name' does not exist" | wc -l
```
Should go from current count to 0.

## SAFETY RULES
- Only change `.name` to `.label` on Group/Subgroup related objects
- Don't change `.name` on other types (like function names, etc.)
- Use `(obj as any).label` for type safety
- If unsure, skip the change

## EXPECTED IMPACT
Should fix approximately 8-12 TypeScript errors related to property name mismatches.