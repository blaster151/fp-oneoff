# Sets, Classes, and Plural Talk (Smith §3.1)

**Key idea.** In everyday mathematics, "the set of X" often functions as *plural talk* for "the X", without reifying a new object. A **set** is a single entity distinct from its members; a **class** (in the loose, plural-idiom sense) may just be a way to talk about many things at once.

**Design rationale in code.**
- We represent "large" collections (e.g., all groups, all sets) as **virtual/large**: `objects: "large" | Iterable<...>`.
- We avoid pretending to enumerate "all objects"; we allow categories like `Grp` or `Set` to be marked `"large"`.
- This justifies APIs that accept **iterables**/**oracles** instead of concrete arrays for big collections.

**Source.** Smith, *Introduction to Category Theory*, §3.1 (Sets and (virtual) classes).