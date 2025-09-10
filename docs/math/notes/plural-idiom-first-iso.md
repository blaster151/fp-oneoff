# Plural Idiom and the First Isomorphism Theorem

## The Two Idioms in Group Theory

### Singularist Idiom
"A group is a set $G$ together with a binary operation..."
- The **set** is the entity, and the binary operation is extra structure laid upon it
- This is the usual textbook phrasing
- Requires positing a "thing called the set" over and above its members

### Plural Idiom  
"A group $G$ is some objects $G$ equipped with a binary operation..."
- You don't posit a *thing called the set* over and above its members
- You just plural-talk your way through, as if the group *is* its members with structure
- "Useful-but-eliminable": lets you say what you need without metaphysical baggage

## How Plural Idiom Makes First Isomorphism Theorem Natural

The plural idiom is what makes the **First Isomorphism Theorem** feel natural. We don't need to hypostasize "the set underlying $G$" as a single object; we just say: a group $G$ consists of *some elements* with a binary operation.

### Kernel
The **kernel** of $f : G \to H$ is just *those elements of $G$* that map to the identity in $H$.
- No need to talk about "the set of kernel elements"
- Just: "those elements that satisfy the kernel condition"

### Image  
The **image** is just *those elements of $H$* that arise as $f(g)$ for some $g$.
- No need to talk about "the set of image elements"  
- Just: "those elements that are hit by the homomorphism"

### Quotient
The quotient $G/\ker f$ is *those cosets of the kernel*, i.e. pluralities of elements grouped by the equivalence relation.
- No need to talk about "the set of cosets"
- Just: "those cosets" as collections of elements

### Isomorphism
The isomorphism $G/\ker f \cong \operatorname{im} f$ is then given simply by saying "send the coset of $g$ to the element $f(g)$."
- No need to construct a "set-theoretic bijection"
- Just: "this coset corresponds to that image element"

## Implementation in Code

Our TypeScript implementation naturally follows the plural idiom:

```typescript
// We don't need a "Set<A>" object - just work with arrays of elements
export function kernel<A, B>(G: FinGroup<A>, H: FinGroup<B>, f: FinGroupMor<A, B>): A[] {
  return G.carrier.filter(a => H.eq(f.run(a), H.e));
}

export function image<A, B>(G: FinGroup<A>, f: FinGroupMor<A, B>): B[] {
  return G.carrier.map(a => f.run(a));
}

export function cosets<A>(G: FinGroup<A>, K: A[]): A[][] {
  // Just group elements by the equivalence relation
  // No need to construct a "set of cosets" object
}
```

## The Payoff

All the code scaffolding we've built (*Grp category, monos/epis, first isomorphism theorem*) is already plural-friendly. We never needed to pin down "a set object" — we just iterate over carriers and operations. That's exactly the plural idiom at work: handling the many without positing an extra singular entity beyond them.

## Source
Smith, *Introduction to Category Theory*, §§2.4–2.9, §4.1
