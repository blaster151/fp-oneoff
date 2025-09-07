# Forgetful Functor \(U:\mathbf{Grp}\to\mathbf{Set}\) (Smith §2.9)

**Definition.** Send a group to its carrier set; a homomorphism to its underlying function.  
**Functor laws.** Preserves identities and composition (verified in tests).  

**Implications/Unlocks.**
- Enables limits/colimits reflection checks via \(U\).
- Sets stage for adjunctions: Free \( \dashv \) Forgetful (later).

*Code:* `src/category/instances/ForgetfulGrpToSet.ts`  
*Tests:* `test/category/forgetful_grp_to_set.test.ts`