# Identical up to isomorphism (Smith §2.8)

**Principle.**  
Two groups are *the same up to isomorphism* when their group tables agree,
even if their elements differ. Example: the three incarnations \(K_1,K_2,K_3\)
of the Klein four-group.

**Operationalization.**
- `IsoClass<G>`: wrapper type for equivalence classes of groups under isomorphism.
- `canonicalRepresentatives`: registry of known groups (cyclic, dihedral, Klein).
- `multiplicationTable(G)` → canonical hash for detecting structural identity.

**Motivation.**
- This lets us work with "the Klein four-group" abstractly, without worrying
about whether it's implemented via symmetries, numbers, or symbols.
- The structure *is* the object.

**Examples.**
- Klein four-group appears as:
  - Standard form: \(\{e,a,b,c\}\) with \(a^2=b^2=c^2=e\), \(ab=c\), etc.
  - Mod-8 odds: \(\{1,3,5,7\}\) under multiplication mod 8
  - Rectangle symmetries: \(\{id, h, v, r_{180}\}\) (identity, horizontal flip, vertical flip, 180° rotation)
- All have identical multiplication tables, hence are "the same group."

**Implementation.**
- `src/algebra/group/IsoClass.ts`: isomorphism class machinery
- `src/algebra/group/CanonicalGroups.ts`: registry of standard forms
- `src/algebra/group/__tests__/iso-class.test.ts`: verification that different incarnations are recognized as isomorphic

*Source:* Peter Smith, *Introduction to Category Theory*, §2.8.