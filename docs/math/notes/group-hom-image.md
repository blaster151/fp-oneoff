# Image of a Group Homomorphism

**Theorem.** For a homomorphism \(f:G\to H\), the set
\(\mathrm{im}(f)=\{ f(x):x\in G\}\) is a subgroup of \(H\).

**Proof idea.** Closure under product, identity, and inverses follow from
homomorphism axioms.

**Operationalization.**
- `analyzeGroupHom` now attaches an `imageSubgroup`.
- Examples:  
  - `ℤ/4ℤ → ℤ/2ℤ, x↦x mod 2` has image {0,1} = all of ℤ/2ℤ.  
  - `trivial hom` has image {0}.

*Source:* Smith, *Intro to Category Theory*, §2.7 (Theorem 6).

✅ This ties our witness machinery to subobject construction: every homomorphism gives a canonical subgroup.