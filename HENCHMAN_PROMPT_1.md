# HENCHMAN PROMPT 1: Fix Missing 'witnesses' Property Errors

You are a TypeScript error fixing assistant. Your job is to fix a specific pattern of errors mechanically.

## THE PROBLEM
Test files are getting "Property 'witnesses' does not exist on type 'GroupHom<unknown, unknown>'" errors because they're importing the wrong GroupHom interface.

## THE SOLUTION
Change imports from structures version to algebra version.

## SPECIFIC INSTRUCTIONS

1. **Find files with witnesses errors**:
```bash
npm run typecheck 2>&1 | grep "Property 'witnesses' does not exist" | cut -d: -f1 | sort | uniq
```

2. **For each file found, make this exact change**:

**FIND**: `import { hom as groupHom } from "../../../structures/group/Hom.js";`
**REPLACE**: `import { hom as groupHom } from "../Hom";`

**FIND**: `import { hom } from "../../../structures/group/Hom.js";`  
**REPLACE**: `import { hom } from "../Hom";`

3. **Also fix any analyzeGroupHom imports**:
**FIND**: `from "../../../structures/group/SomeModule.js"`
**REPLACE**: `from "../SomeModule"`

## FILES TO CHANGE
Based on current analysis:
- `src/algebra/group/__tests__/factorization-simple.test.ts` 
- `src/algebra/group/__tests__/first-iso.test.ts`
- `src/algebra/group/__tests__/hom-image.test.ts` (already fixed)
- `src/algebra/group/__tests__/hom-kernel.test.ts` (already fixed)
- `src/algebra/group/__tests__/theorem7-subgroup-images.test.ts`

## VALIDATION
After changes, run: `npm run typecheck 2>&1 | grep "witnesses.*does not exist" | wc -l`
Should go from ~10+ to 0.

## EXPECTED IMPACT
Should fix approximately 15-20 TypeScript errors.