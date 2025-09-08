# EXECUTION PLAN: Maximum Token Efficiency

## CURRENT STATE
- **Total Errors**: 188
- **Target**: Get below 100 errors  
- **Strategy**: Use cheaper LLM for mechanical fixes, reserve expensive LLM for complex issues

## EXECUTION ORDER (Copy each prompt to older LLM)

### STEP 1: HENCHMAN_PROMPT_1.md
- **Target**: ~15-20 witnesses property errors
- **Expected Result**: 188 → ~170 errors
- **Time**: 2-3 minutes for older LLM

### STEP 2: HENCHMAN_PROMPT_2.md  
- **Target**: ~20-25 GroupHom signature errors
- **Expected Result**: ~170 → ~145 errors
- **Time**: 3-4 minutes for older LLM

### STEP 3: HENCHMAN_PROMPT_4.md
- **Target**: ~8-12 name/label property errors  
- **Expected Result**: ~145 → ~135 errors
- **Time**: 2-3 minutes for older LLM

### STEP 4: HENCHMAN_PROMPT_3.md
- **Target**: ~10-12 array access errors
- **Expected Result**: ~135 → ~125 errors  
- **Time**: 3-4 minutes for older LLM

### STEP 5: HENCHMAN_PROMPT_5.md
- **Target**: ~10 implicit any errors
- **Expected Result**: ~125 → ~115 errors
- **Time**: 2-3 minutes for older LLM

## AFTER HENCHMAN WORK
**Expected State**: ~115 errors remaining
**Remaining Issues**: Complex type relationships, ring modules, advanced interface conflicts

**THEN**: Return to expensive LLM for architectural fixes and complex patterns.

## VALIDATION BETWEEN STEPS
After each henchman prompt:
```bash
npm run typecheck 2>&1 | grep -E "error TS[0-9]+" | wc -l
```

## COST SAVINGS ESTIMATE
- **Henchman work**: ~50-70 errors fixed with cheap LLM
- **Expensive LLM**: Focus on remaining ~45-65 complex errors
- **Token savings**: ~70% reduction in expensive token usage

## MASTERMIND STRATEGY NOTES
The expensive LLM (you) established:
1. ✅ Pattern recognition methodology
2. ✅ Interface unification strategies  
3. ✅ Root cause analysis techniques
4. ✅ Systematic fix approaches

The henchman just executes the established patterns mechanically.