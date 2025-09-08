# Image Subgroup Theorem (Theorem 6)

**Theorem.** The image of a group homomorphism is always a subgroup of the codomain.

Given $f:G\to H$, the set $f[G]=\{f(x)\mid x\in G\}$ is closed under multiplication, contains the identity, and is closed under inverses — so it is a subgroup of $H$.

## Mathematical Insights

1. **Homomorphism → subgroup construction**
   Given $f:G\to H$, the set $f[G]=\{f(x)\mid x\in G\}$ is closed under multiplication, contains the identity, and is closed under inverses — so it is a subgroup of $H$.
   This is the *image subgroup*.

2. **Dual perspective**
   Similarly, the **kernel** of a homomorphism (not shown here, but coming soon in the book) is a subgroup of the domain. These two together are the "First Isomorphism Theorem" ingredients.

3. **Closure proof pattern**
   Notice the structure of the proof:
   - Closure under the operation (product of two f-images is again an f-image).
   - Identity is an f-image.
   - Inverses are f-images (since $f(x)^{-1}=f(x^{-1})$).
   This is the canonical subgroup test specialized to f-images.

4. **Category-theoretic shadow**
   This is the first glimpse of how functors (here: Homomorphisms as structure-preserving maps) preserve structure and generate sub-objects.

## Operationalization

- `src/algebra/group/ImageSubgroup.ts`
  - `imageSubgroup(f)`: constructs the image subgroup of homomorphism f
  - `verifyImageSubgroup(img)`: verifies the three subgroup axioms
  - `imageSize(f)`: computes the size of the image
  - `isSurjective(f)`: checks if f is surjective by comparing image size to target size
  - `makeSurjective(f)`: creates a surjective homomorphism by restricting codomain to image

## Test Cases

- Identity homomorphism: image is the whole group
- Mod 2 map Z4 → Z2: image is all of Z2 (surjective)
- Inclusion Z2 → Z4: image is {0,1} (not surjective)
- Constant map: image is trivial subgroup {0}
- Product projection: image is the projected component
- Surjective construction: `makeSurjective` creates surjective homomorphism

## Key Properties Verified

1. **Subgroup axioms**: closure, identity, inverses
2. **Surjectivity detection**: image size equals target size
3. **Inclusion homomorphism**: natural map from image to target
4. **Structure preservation**: image inherits operations from target

*(This implements the classical result that homomorphisms generate subgroups, providing the foundation for the First Isomorphism Theorem.)*