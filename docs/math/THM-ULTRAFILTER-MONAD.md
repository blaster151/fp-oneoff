---
id: THM-ULTRAFILTER-MONAD
title: Codensity of FinSet↪Set is the Ultrafilter monad
source:
  - type: paper
    where: "Kennison–Gildenhuys (1971), 'Ultrafilter monads'"
    note: "Ultrafilters from codensity"
  - type: paper
    where: "Manes (1969), 'A triple theoretic construction of compact algebras'"
    note: "EM algebras = compact Hausdorff spaces"
  - type: slide
    where: "Codensity slides, 'Ultrafilters from codensity monads'"
    pages: [8-10]
---

**Statement (LaTeX).**
For the inclusion $G: \mathbf{FinSet} \hookrightarrow \mathbf{Set}$,
$$
T^G(A) \cong \{\,\text{ultrafilters on }A\,\}.
$$

The codensity monad of the inclusion functor is naturally isomorphic to the ultrafilter monad.

**Categorical Construction.**
$$
T^G(A) = \int_{n \in \mathbf{FinSet}} [[A, n], n]
$$
where the Boolean component at $2 = \{0,1\}$ provides characteristic function evaluation.

**Proof Sketch.**
The Boolean component $\phi_2 : (A \to 2) \to 2$ of a codensity element determines an ultrafilter via $U(S) := \phi_2(\chi_S) = \text{true}$. The naturality constraints ensure ultrafilter laws.

**Implications (TypeScript).**
- `ultrafilterFromCodensity(A, t)` extracts ultrafilter from Boolean component
- `mkUltrafilterMonad()` provides familiar monadic interface
- Laws via naturality: $U(S\cap T)=U(S)\wedge U(T)$, $U(A\setminus S)=\neg U(S)$
- Principal ultrafilters via unit: $\eta_A(a)$ gives principal ultrafilter at $a$
- EM algebra structure: $\alpha: U(A) \to A$ picks principal witness

**Witness Laws to Test.**
- Principal property: $\eta_A(a)$ contains exactly subsets containing $a$
- Intersection: $U(S \cap T) = U(S) \land U(T)$ via $\land \circ \langle\chi_S, \chi_T\rangle$
- Union: $U(S \cup T) = U(S) \lor U(T)$ via $\lor \circ \langle\chi_S, \chi_T\rangle$
- Complement: $U(A \setminus S) = \neg U(S)$ via $\neg \circ \chi_S$
- Ultrafilter laws: upward closure, prime property, proper filter
- EM algebra laws: $\alpha \circ \eta = \text{id}$, $\alpha \circ T(\alpha) = \alpha \circ \mu$

**Future Unlocks.**
- Eilenberg–Moore algebras = compact Hausdorff spaces (Manes theorem)
- Stone duality between Boolean algebras and Stone spaces
- Non-principal ultrafilters require axiom of choice (infinite case)
- Stone–Čech compactification via ultrafilter construction
- Applications to functional analysis, measure theory, and model theory
- Ultrafilter lemma and applications to combinatorics