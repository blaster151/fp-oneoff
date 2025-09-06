# "Identical up to isomorphism" (Smith §2.8)

**Point.** Presentations may differ wildly (numbers vs. rectangle symmetries),
yet if the multiplication tables coincide up to relabeling, the groups are the same *as structure*.

**In code.**
- `IsoClass` wraps a finite group table and canonicalizes it under all relabelings.
- Equal keys ⇒ same isomorphism class.
- `StandardGroups`: `V4()`, `Cn(n)` small constructors for examples.

**Caveats.**
- Canonicalization is factorial-time (n!). OK for n ≤ 8. For larger groups use invariants or explicit `GroupIso` witnesses.

**Source.** Smith, *Introduction to Category Theory*, §2.8 (discussion of K₁,K₂,K₃).